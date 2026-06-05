<h1 align="center">🍔 Views's Burger — Dashboard de Hamburgueria com Regras de Negócio & Banco de Dados em Tempo Real</h1>

<p align="center">
  O <strong>Views's Burger</strong> é um dashboard interativo para gerenciamento e simulação de pedidos em tempo real, focado no processamento seguro de transações e aplicação dinâmica de motores de regras de desconto.
</p>

<p align="center">
  Este projeto foi totalmente desenvolvido por mim, <strong>Jean Pedro</strong>.
</p>

<p align="center">
  <img src="./img/apresentacao-projeto.gif" alt="Demonstração Views's Burger" width="700px" style="border-radius: 10px; border: 2px solid #f59e0b;"/>
</p>

## 🎯 Objetivo

Este projeto foi desenvolvido com o objetivo de construir uma aplicação Full Stack que une uma interface de usuário rápida e reativa com um back-end robusto, simulando a esteira de produção e o fechamento atômico de pedidos de um delivery moderno.

## 🚀 Sobre o Projeto

Uma solução ponta a ponta voltada para alta performance e consistência de dados. O sistema gerencia carrinhos de compras de forma dinâmica, aplicando descontos cumulativos diretamente pelo banco de dados a cada alteração do cliente.

- 📱 Interface moderna, escura e responsiva com Tailwind CSS
- 🔄 Integração assíncrona (Fetch API) com comunicação em tempo real
- 🛡️ Fechamento de pedidos via Database Transactions (Garantia ACID)
- ⏱️ Alerta de sucesso dinâmico e animado com percepção de "pedido a caminho"

## 🛠️ Tecnologias Utilizadas

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,tailwind,ts,nodejs,postgres,git" height="40px" />
</p>

- **HTML5 & Tailwind CSS:** Estrutura e estilização moderna baseada em utilitários
- **TypeScript & Node.js:** Back-end tipado, seguro e escalável
- **Fastify:** Framework HTTP focado em baixa latência e máxima performance
- **Kysely:** Query builder TypeScript-first para consultas SQL seguras
- **PostgreSQL (Neon.tech):** Banco de dados em nuvem serverless com transações atômicas
- **Git:** Versionamento e organização do histórico do projeto

## ⚙️ Funcionalidades

- **Customização de Itens:** Adição dinâmica de lanches com múltiplos opcionais e cálculo de subtotal imediato
- **Motor de Promoções:** Cálculo automático no back-end de descontos progressivos (Ex: 50% de desconto na compra do segundo refrigerante)
- **Feedback Visual "Ultra-Rápido":** Substituição do alert tradicional por um fluxo contínuo de carregamento de transação SQL e sucesso animado
- **Persistência de Estado:** Vinculação inteligente do ID do carrinho ativo para evitar perda de dados em atualizações de página

## 💡 Diferenciais Técnicos

- **Transações Atômicas (SQL):** Uso de `TRANSACTION` no fechamento do pedido para garantir que o estoque, o carrinho e a cozinha atualizem juntos ou sofram rollback em caso de falha
- **Segurança de Credenciais:** Isolamento completo de chaves e strings de conexão de banco de dados utilizando variáveis de ambiente (`.env`)
- **UX Perceptiva:** Transições fluidas no fechamento do pedido que simulam o tempo real de processamento de gateways de pagamento e envio direto para a cozinha
- **Código Limpo e Modular:** Separação rígida de responsabilidades entre as rotas da API, regras de negócio e manipulação do DOM no Front-end

## 📂 Estrutura de Pastas

```text
├── back-end/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── front-end/
│   ├── img/
│   └── index.html
├── database.sql
└── .gitignore
```
## 💻 Como rodar o projeto localmente:

```
1. Clonar o Repositório
Bash
git clone [https://github.com/seu-usuario/views-burger.git](https://github.com/seu-usuario/views-burger.git)
cd views-burger
2. Configurar o Banco de Dados
Crie uma instância de banco de dados PostgreSQL (Recomendado: Neon.tech)

Execute as queries contidas no arquivo database.sql na raiz do projeto para criar as tabelas e dados iniciais do cardápio.

3. Configurar o Back-end
Acesse a pasta do back-end: cd back-end

Instale as dependências: npm install

Copie o arquivo de exemplo: cp .env.example .env (ou crie manualmente o arquivo .env)

Abra o arquivo .env e insira a sua string de conexão gerada pelo Neon:

Fragmento do código
   DATABASE_URL="postgres://seu_usuario:sua_senha@seu_endereco.neon.tech/neondb?sslmode=require"
   PORT=3333
Inicie o servidor de desenvolvimento: npm run dev

4. Configurar o Front-end
Navegue até a pasta do front-end ou use a raiz.

Abra o arquivo index.html diretamente no seu navegador ou utilizando a extensão Live Server do VS Code.

Monte o seu hambúrguer e simule a transação!
