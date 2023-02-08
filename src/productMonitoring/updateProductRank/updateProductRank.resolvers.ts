import { protectedResovler } from "../../db/user/user.utils";
import { Resolvers, State } from "../../types";
import { dateToString, nowKrDate } from "../../util";
import { getProductDisplayPosition } from "../productMonitoring";
import { MonitoringKeywordRank } from "../seeProductMonitoringItem/seeProductMonitoringItem.resolvers";

type UpdateProductRankResult = {
  state: State;
  data?: MonitoringKeywordRank;
};

const updateProductRank: Resolvers<UpdateProductRankResult> = async (
  _,
  { id },
  { dataSources: { productsDb: client } }
) => {
  try {
    const keywordInfo = await client.monitoringKeyword.findUnique({
      where: {
        id,
      },
      select: {
        keyword: true,
        productNo: true,
      },
    });

    if (!keywordInfo) {
      return {
        state: { ok: false, error: "Monitoring keyword is exist" },
      };
    }

    const nowDate = dateToString(nowKrDate());
    const find = await client.monitoringKeywordRank.findUnique({
      where: {
        date_keywordid: {
          date: nowDate,
          keywordid: id,
        },
      },
    });

    if (find) {
      console.log(find.updatedAt.getTime(), Date.now());

      if (find.updatedAt.getTime() + 600000 >= Date.now()) {
        return {
          state: {
            ok: false,
            error: "Can't update within 10 min.",
          },
        };
      }
    }

    const data = await getProductDisplayPosition(
      keywordInfo.keyword,
      keywordInfo.productNo
    );

    const upsertData = await client.monitoringKeywordRank.upsert({
      update: {
        ...data,
      },
      create: {
        date: nowDate,
        keywordid: id,
        ...data,
      },
      where: {
        date_keywordid: {
          date: nowDate,
          keywordid: id,
        },
      },
    });

    return {
      state: {
        ok: true,
      },
      data: {
        id,
        rank: upsertData.rank,
        page: upsertData.page,
        index: upsertData.index,
        adRank: upsertData.adRank,
        adPage: upsertData.adPage,
        adIndex: upsertData.adIndex,
        date: upsertData.date,
        updateAt: upsertData.updatedAt,
      },
    };
  } catch (e) {
    console.error("updateProductRank", e);

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
    updateProductRank: protectedResovler(updateProductRank),
  },
};

export default resolvers;
