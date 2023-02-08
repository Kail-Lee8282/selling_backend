import { PrismaClient } from "@prisma/client";
import { protectedResovler } from "../../db/user/user.utils";
import resolver from "../../product/product.resolvers";
import { Resolvers, State } from "../../types";
import { dateToString, nowKrDate } from "../../util";
import { getProductDisplayPosition } from "../productMonitoring";
import { MonitoringKeywordRank } from "../seeProductMonitoringItem/seeProductMonitoringItem.resolvers";

type AddMonitoringKeywordResult = {
  state: State;
  data?: MonitoringKeywordRank;
};

const addMonitoringKeyword: Resolvers<AddMonitoringKeywordResult> = async (
  _,
  { productNo, keyword },
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    const kwd = (keyword as string).replace(" ", "");

    if (!productNo || productNo.length <= 0) {
      return {
        state: {
          ok: false,
          error: "ProductNo is not Exist.",
        },
      };
    }

    if (!kwd || kwd.length <= 0) {
      return {
        state: {
          ok: false,
          error: "Keyword is not Exist.",
        },
      };
    }

    const isExisting = await client.monitoringKeyword.findFirst({
      where: {
        userId: loginUser.id,
        productNo,
        keyword: kwd,
      },
    });

    if (isExisting) {
      return {
        state: {
          ok: false,
          error: "Keyword Exist.",
        },
      };
    }

    const insertKeyword = await client.monitoringKeyword.create({
      data: {
        keyword: kwd,
        productMonitoring: {
          connect: {
            userId_storeProductNo: {
              storeProductNo: productNo,
              userId: loginUser.id,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!insertKeyword.id) {
      return {
        state: {
          ok: false,
          error: "add keyword failed.",
        },
      };
    }

    const rankData = await getProductDisplayPosition(kwd, productNo);

    const result = await client.monitoringKeywordRank.create({
      data: {
        date: dateToString(nowKrDate()),
        keywordid: insertKeyword.id,
        ...rankData,
      },
    });

    return {
      state: {
        ok: true,
      },
      data: {
        date: result.date,
        id: result.keywordid,
        rank: result.rank,
        page: result.page,
        index: result.index,
        adRank: result.adRank,
        adPage: result.adPage,
        adIndex: result.adIndex,
        updateAt: result.updatedAt,
      },
    };
  } catch (e) {
    console.error("addMonitoringKeyword", e);
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
    addMonitoringKeyword: protectedResovler(addMonitoringKeyword),
  },
};

export default resolvers;
