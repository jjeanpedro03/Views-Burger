import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';

export async function rotasCarrinho(app: FastifyInstance) {
  
  // 1. Rota de Adicionar Item 
  app.post('/carrinho/adicionar', async (request, reply) => {
    const p_id = request.body && (request.body as any).produto_id;
    const qtd = request.body && (request.body as any).quantidade;
    const add_ids = request.body && (request.body as any).adicionais_ids;
    const { carrinho_id } = request.body as any;

    try {
      let idDoCarrinho = carrinho_id;
      if (!idDoCarrinho) {
        const novoCarrinho = await db
          .insertInto('carrinhos')
          .values({ status: 'ativo' })
          .returning('id')
          .executeTakeFirstOrThrow();
        idDoCarrinho = novoCarrinho.id;
      }
      const novoItemCarrinho = await db
        .insertInto('itens_carrinho')
        .values({ carrinho_id: idDoCarrinho, produto_id: p_id, quantidade: qtd || 1 })
        .returning('id')
        .executeTakeFirstOrThrow();
      const idDoItem = novoItemCarrinho.id;
      if (add_ids && add_ids.length > 0) {
        const lines = add_ids.map((idAdd: number) => ({ item_carrinho_id: idDoItem, adicional_id: idAdd }));
        await db.insertInto('item_adicionais').values(lines).execute();
      }
      return reply.status(201).send({ mensagem: 'Item adicionado ao carrinho com sucesso!', carrinho_id: idDoCarrinho, item_carrinho_id: idDoItem });
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ erro: 'Erro ao adicionar item.' });
    }
  });

  // 2. Rota de Visualizar e Calcular 
  app.get('/carrinho/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrinhoId = Number(id);

    try {
      const itensDoCarrinho = await db
        .selectFrom('itens_carrinho')
        .innerJoin('produtos', 'produtos.id', 'itens_carrinho.produto_id')
        .select([
          'itens_carrinho.id as item_id',
          'produtos.nome as produto_nome',
          'produtos.preco_base as produto_preco_base',
          'itens_carrinho.quantidade'
        ])
        .where('itens_carrinho.carrinho_id', '=', carrinhoId)
        .execute();

      if (itensDoCarrinho.length === 0) {
        return reply.status(404).send({ erro: 'Carrinho vazio ou não encontrado.' });
      }

      let valorBrutoTotal = 0;
      const itensFormatados = [];
      let totalHamburgueres = 0;
      let totalBatatas = 0;
      let totalRefrigerantes = 0;
      let precoUnitarioRefri = 0;

      for (const item of itensDoCarrinho) {
        const adicionaisDoItem = await db
          .selectFrom('item_adicionais')
          .innerJoin('adicionais', 'adicionais.id', 'item_adicionais.adicional_id')
          .select(['adicionais.id', 'adicionais.nome', 'adicionais.preco'])
          .where('item_adicionais.item_carrinho_id', '=', Number(item.item_id))
          .execute();

        const precoBaseProduto = Number(item.produto_preco_base);
        const totalAdicionais = adicionaisDoItem.reduce((soma, add) => soma + Number(add.preco), 0);
        
        const precoUnitarioTotal = precoBaseProduto + totalAdicionais;
        const subtotalDoItem = precoUnitarioTotal * Number(item.quantidade);
        valorBrutoTotal += subtotalDoItem;

        const nomeMinusculo = item.produto_nome.toLowerCase();
        if (nomeMinusculo.includes('burger') || nomeMinusculo.includes('monstro')) {
          totalHamburgueres += item.quantidade;
        } else if (nomeMinusculo.includes('batata')) {
          totalBatatas += item.quantidade;
        } else if (nomeMinusculo.includes('refrigerante')) {
          totalRefrigerantes += item.quantidade;
          precoUnitarioRefri = precoBaseProduto;
        }

        itensFormatados.push({
          item_id: item.item_id,
          produto: item.produto_nome,
          quantidade: item.quantidade,
          preco_base: precoBaseProduto,
          adicionais: adicionaisDoItem,
          preco_unitario_total: precoUnitarioTotal,
          subtotal: subtotalDoItem
        });
      }

      let descontoTotal = 0;
      const descritivosDescontos: string[] = [];

      if (totalRefrigerantes > 1) {
        const quantidadeComDesconto = totalRefrigerantes - 1;
        const valorDoDescontoRefri = (precoUnitarioRefri * 0.5) * quantidadeComDesconto;
        descontoTotal += valorDoDescontoRefri;
        descritivosDescontos.push(`Promo Refri: 50% de desconto em ${quantidadeComDesconto} refrigerante(s) (Economizou R$ ${valorDoDescontoRefri.toFixed(2)})`);
      }

      const quantidadeDeCombos = Math.min(totalHamburgueres, totalBatatas, totalRefrigerantes);
      if (quantidadeDeCombos > 0) {
        const valorDescontoCombo = quantidadeDeCombos * 5.00;
        descontoTotal += valorDescontoCombo;
        descritivosDescontos.push(`Combo Ativado: ${quantidadeDeCombos}x Combo Hamburgueria (- R$ ${valorDescontoCombo.toFixed(2)})`);
      }

      const valorFinalComDesconto = valorBrutoTotal - descontoTotal;

      return {
        carrinho_id: carrinhoId,
        itens: itensFormatados,
        resumo_financeiro: {
          valor_bruto: valorBrutoTotal,
          descontos_aplicados: descritivosDescontos,
          total_descontos: descontoTotal,
          valor_final: Math.max(0, valorFinalComDesconto)
        }
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ erro: 'Erro ao calcular o carrinho.' });
    }
  });

  // 3. Finalizar Pedido usando Transação do Kysely
  app.post('/carrinho/:id/finalizar', async (request, reply) => {
    const { id } = request.params as { id: string };
    const carrinhoId = Number(id);

    try {
      // Abrindo a transação segura do banco de dados
      await db.transaction().execute(async (trx) => {
        
        // 1: Verificar se o carrinho existe e se ainda está ativo
        const carrinho = await trx
          .selectFrom('carrinhos')
          .select(['status'])
          .where('id', '=', carrinhoId)
          .executeTakeFirst();

        if (!carrinho) {
          throw new Error('CARRINHO_NAO_ENCONTRADO');
        }

        if (carrinho.status !== 'ativo') {
          throw new Error('CARRINHO_JA_FINALIZADO');
        }

        // 2: Mudar o status do carrinho para 'finalizado'
        await trx
          .updateTable('carrinhos')
          .set({ status: 'finalizado' })
          .where('id', '=', carrinhoId)
          .execute();
          
        // Parte futura: trx.insertInto('pedidos_cozinha')...
      });

      return {
        mensagem: 'Pedido finalizado e enviado para a cozinha com sucesso!',
        carrinho_id: carrinhoId,
        status: 'finalizado'
      };

    } catch (error: any) {
      app.log.error(error);

      if (error.message === 'CARRINHO_NAO_ENCONTRADO') {
        return reply.status(404).send({ erro: 'Carrinho não encontrado no sistema.' });
      }
      if (error.message === 'CARRINHO_JA_FINALIZADO') {
        return reply.status(400).send({ erro: 'Este carrinho já foi finalizado anteriormente.' });
      }

      return reply.status(500).send({ erro: 'Falha crítica ao finalizar o pedido.' });
    }
  });
}