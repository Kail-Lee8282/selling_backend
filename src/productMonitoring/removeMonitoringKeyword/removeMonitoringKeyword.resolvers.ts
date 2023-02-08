import { protectedResovler } from "../../db/user/user.utils";
import { Resolvers, State } from "../../types";

type RevmoveMonitoringKwdResult = {
  state: State;
};

const removeMonitoringKeyword: Resolvers<RevmoveMonitoringKwdResult> = async (
  _,
  { id },
  { dataSources: { productsDb: client } }
) => {
  try {
    //https://www.prisma.io/docs/concepts/components/prisma-client/transactions#transaction-timing-issues
    const MAX_RETRIES = 5;
    let retries = 0;

    const existData = await client.monitoringKeyword.findUnique({
      where: {
        id,
      },
    });

    if (!existData) {
      return {
        state: {
          ok: false,
          error: "data is exist.",
        },
      };
    }

    while (retries < MAX_RETRIES) {
      try {
        await client.$transaction(
          [
            client.monitoringKeywordRank.deleteMany({
              where: {
                keywordid: id,
              },
            }),
            client.monitoringKeyword.delete({
              where: {
                id,
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
      state: {
        ok: true,
      },
    };
  } catch (e) {
    console.error("removeMonitoringKeyword", e);
    return {
      state: {
        ok: false,
        error: e,
      },
    };
  }
};

const resolvers = {
  Mutation: {
    removeMonitoringKeyword: protectedResovler(removeMonitoringKeyword),
  },
};

export default resolvers;
