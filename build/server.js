require("dotenv").config();
import { ApolloServer } from "@apollo/server";
import { NaverAdAPI } from "./external/api/naver/ad/NaverAdAPI";
import { NaverDataLabAPI } from "./external/api/naver/datalab/NaverDataLabAPI";
import { typeDefs, resolvers } from "./schema";
import client from "./client";
import { getUser } from "./db/user/user.utils";
import express from "express";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
//express
const PORT = 4000;
async function startApolloServer() {
    const app = express();
    const httpServer = createServer(app);
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });
    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });
    const wsServer = new WebSocketServer({
        server: httpServer,
    });
    const serverCleanup = useServer({ schema }, wsServer);
    await server.start();
    app.use("/", cors(), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            const { cache } = server;
            let user = null;
            if (req.headers?.token) {
                user = await getUser(req.headers?.token);
            }
            return {
                dataSources: {
                    naverDataLabAPI: new NaverDataLabAPI({ cache }),
                    naverAdAPI: new NaverAdAPI({
                        cache,
                    }),
                    productsDb: client,
                },
                loginUser: user,
            };
        },
    }));
    httpServer.listen({ port: PORT }, () => {
        console.log(`🚀  Server ready at: http://localhost:${PORT}`);
    });
}
startApolloServer();
// new Promise(async () => {
//   let count = 0;
//   while (true) {
//     console.log(count);
//     count++;
//     await new Promise((r) => setTimeout(r, 1000));
//   }
// });
