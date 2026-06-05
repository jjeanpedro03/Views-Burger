import { Generated } from 'kysely';

export interface TabelaProdutos {
  // Mudamos para Generated<number> para o Kysely entender que o Postgres gera o ID sozinho no INSERT
  id: Generated<number>; 
  nome: string;
  preco_base: number | string;
  descricao: string | null;
}

export interface TabelaAdicionais {
  id: Generated<number>;
  nome: string;
  preco: number | string;
}

export interface TabelaCarrinhos {
  id: Generated<number>;
  // Mudamos para Generated para aceitar inserts sem passar status ou data de criação
  status: Generated<'ativo' | 'finalizado' | 'abandonado'>;
  criado_em: Generated<Date>;
}

export interface TabelaItensCarrinho {
  id: Generated<number>;
  carrinho_id: number;
  produto_id: number;
  quantidade: number;
}

export interface TabelaItemAdicionais {
  id: Generated<number>;
  item_carrinho_id: number;
  adicional_id: number;
}

export interface Database {
  produtos: TabelaProdutos;
  adicionais: TabelaAdicionais;
  carrinhos: TabelaCarrinhos;
  itens_carrinho: TabelaItensCarrinho;
  item_adicionais: TabelaItemAdicionais;
}