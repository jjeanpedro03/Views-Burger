import fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import { db } from "./database/connection.js";
import { rotasCarrinho } from "./routes/carrinho.js";

const app = fastify({ logger: true });

app.register(cors, {
    origin: "*",
});

app.register(rotasCarrinho);

app.get("/teste-banco", async (request, reply) => {
    try {
        const resultado = await db.selectFrom("produtos").selectAll().execute();
        return {
            status: "Conectado com sucesso ao Neon!",
            produtos_cadastrados: resultado,
        };
    } catch (error) {
        app.log.error(error);
        return reply
            .status(500)
            .send({ erro: "Não foi possível conectar ao banco de dados." });
    }
});

app.post("/seed", async (request, reply) => {
    try {
        await db.deleteFrom("item_adicionais").execute();
        await db.deleteFrom("itens_carrinho").execute();
        await db.deleteFrom("carrinhos").execute();
        await db.deleteFrom("produtos").execute();
        await db.deleteFrom("adicionais").execute();

        const produtosInseridos = await db
            .insertInto("produtos")
            .values([
                {
                    nome: "X-Burger Artesanal",
                    preco_base: 28.5,
                    descricao:
                        "Pão brioche, blend de 150g e muito queijo prato.",
                },
                {
                    nome: "Monstro Bacon",
                    preco_base: 36.0,
                    descricao:
                        "Pão australiano, blend de 150g, muito bacon crocante e cheddar maçaricado.",
                },
                {
                    nome: "Batata Frita Palito",
                    preco_base: 14.0,
                    descricao: "Batata frita crocante com sal e alecrim.",
                },
                {
                    nome: "Refrigerante Lata",
                    preco_base: 6.0,
                    descricao: "Coca-cola ou Guaraná 350ml.",
                },
            ])
            .returningAll()
            .execute();

        const adicionaisInseridos = await db
            .insertInto("adicionais")
            .values([
                { nome: "Carne Extra (Blend 150g)", preco: 9.0 },
                { nome: "Bacon em Cubos", preco: 4.5 },
                { nome: "Queijo Cheddar Extra", preco: 3.5 },
                { nome: "Molho Especial da Casa", preco: 2.0 },
            ])
            .returningAll()
            .execute();

        return {
            mensagem: "Banco de dados populado com sucesso!",
            produtos: produtosInseridos,
            adicionais: adicionaisInseridos,
        };
    } catch (error) {
        app.log.error(error);
        return reply
            .status(500)
            .send({ erro: "Falha ao rodar o seed do banco." });
    }
});

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3333;
        await app.listen({ port, host: "0.0.0.0" });
        console.log(`Servidor rodando em http://localhost:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
