import { protectedResovler } from "../../db/user/user.utils";
import { Resolvers, State } from "../../types";
import { dateTimeToString } from "../../util";
import {
  StoreKeywordRank,
  StoreKeywordResult,
} from "../storeMonitoring.resolvers";

const seeStoreKeywordItems: Resolvers<StoreKeywordResult> = async (
  _,
  __,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    // 로그인 사용자가 등록한 스토어 키워드 랭킹 조회
    const keywordList = await client.storeKeywordRank.findMany({
      where: {
        StoreMonitoring: {
          userId: loginUser.id,
        },
      },
      include: {
        StoreMonitoring: {
          select: {
            keyword: true,
            storeName: true,
          },
        },
      },
    });

    // 페이지 전달 데이터 컨버팅
    const data = keywordList.map<StoreKeywordRank>((item) => {
      const { storeName, keyword } = item.StoreMonitoring;

      return {
        id: item.id,
        storeName,
        keyword,
        title: item.title,
        isAd: item.isAd,
        productId: item.productId,
        productImg: item.productImg,
        productUrl: item.productUrl,
        reviewCount: item.reviewCnt,
        purchaseCount: item.selesCnt,
        rank: item.rank,
        page: item.page,
        index: item.index,
        seleStart: item.seleStart,
        updatedAt: dateTimeToString(item.updatedAt),
      };
    });

    return {
      state: {
        ok: true,
      },
      data,
    };
  } catch (e) {
    console.error(e);

    return {
      state: {
        ok: false,
        error: e.message,
      },
    };
  }
};

const resolvers = {
  Query: {
    seeStoreKeywordItems: protectedResovler(seeStoreKeywordItems),
  },
};

export default resolvers;
