import { protectedResovler } from "../../db/user/user.utils";
import { Resolvers, State } from "../../types";

const removeMonitoringItem: Resolvers<State> = async (
  _,
  { productNo },
  { loginUser, dataSources: { productsDb: client } }
) => {
  try {
    const MAX_RETRIES = 5;
    let retries = 0;

    const existItem = await client.productMonitoring.findUnique({
      where: {
        userId_storeProductNo: {
          storeProductNo: productNo,
          userId: loginUser.id,
        },
      },
    });

    if (!existItem) {
      return {
        ok: false,
        error: "Not exist data.",
      };
    }

    const removeId = await client.monitoringKeyword.findMany({
      where: {
        userId: loginUser.id,
        productNo,
      },
      select: {
        id: true,
      },
    });

    if (!removeId || removeId.length <= 0) {
      return {
        ok: false,
        error: "Not exist keyword.",
      };
    }

    while (retries < MAX_RETRIES) {
      try {
        await client.$transaction(
          [
            client.monitoringKeywordRank.deleteMany({
              where: {
                OR: removeId.map((item) => {
                  return { keywordid: item.id };
                }),
              },
            }),
            client.monitoringKeyword.deleteMany({
              where: {
                OR: removeId.map((item) => {
                  return { id: item.id };
                }),
              },
            }),
            client.productMonitoring.delete({
              where: {
                userId_storeProductNo: {
                  storeProductNo: productNo,
                  userId: loginUser.id,
                },
              },
            }),
          ],
          {
            isolationLevel: "Serializable",
          }
        );

        break;
      } catch (err) {
        if (err.code === "P2034") {
          retries++;
          continue;
        }
        throw err;
      }
    }

    return {
      ok: true,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      error: e.message,
    };
  }
};

const resolvers = {
  Mutation: {
    removeMonitoringItem: protectedResovler(removeMonitoringItem),
  },
};

export default resolvers;
