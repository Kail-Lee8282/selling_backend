require("dotenv").config();
import { ApolloServer } from "@apollo/server";
import { NaverAdAPI } from "./external/api/naver/ad/NaverAdAPI";
import { NaverDataLabAPI } from "./external/api/naver/datalab/NaverDataLabAPI";
import { typeDefs, resolvers } from "./schema";
import client from "./client";
import { ContextValue } from "./types";
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
import { dateTimeToString, dateToString } from "./util";
import { getProductDisplayPosition } from "./productMonitoring/productMonitoring";
//express
const PORT = 4000;
async function startApolloServer() {
  const app = express();

  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const server = new ApolloServer<ContextValue>({
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

  app.use(
    "/",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { cache } = server;
        let user = null;
        if (req.headers?.token) {
          user = await getUser(req.headers?.token as string);
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
    })
  );

  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀  Server ready at: http://localhost:${PORT}`);
  });
}

startApolloServer();

// new Promise(async () => {
//   let count = 0;
//   while (true) {
//     try {
//       console.log(count, dateTimeToString(new Date()));
//       const today = dateToString(new Date());
//       const find = await client.monitoringKeyword.findFirst({
//         where: {
//           MonitoringKeywordRank: {
//             none: {
//               date: today,
//             },
//           },
//         },
//         select: {
//           id: true,
//           productNo: true,
//           keyword: true,
//         },
//       });

//       console.log(find);
//       const data = await getProductDisplayPosition(
//         find.keyword,
//         find.productNo
//       );
//       console.log(data);
//       const updateData = await client.monitoringKeywordRank.create({
//         data: {
//           date: dateToString(new Date()),
//           keywordInfo: {
//             connect: {
//               id: find.id,
//             },
//           },
//           adIndex: data.adIndex,
//           adPage: data.adPage,
//           adRank: data.adPage,
//           index: data.index,
//           page: data.page,
//           rank: data.rank,
//         },
//       });

//       console.log(updateData);
//     } catch (e) {
//       console.error(e);
//     }

//     count++;
//     await new Promise((r) => setTimeout(r, 60000));
//   }
// });
