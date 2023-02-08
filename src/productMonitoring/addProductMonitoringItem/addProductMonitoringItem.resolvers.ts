import { protectedResovler } from "../../db/user/user.utils";
import {
  getProductInfo,
  getShoppingProuctList,
} from "../../external/api/naver/url/naver.urlRequest";
import { getMobileProductShopList } from "../../product/seeProductShops/seeProductShops.resolvers";
import { Resolvers, State } from "../../types";
import { dateToString, nowKrDate, sleep } from "../../util";
import { getProductDisplayPosition } from "../productMonitoring";

const NAVER_SMART_STORE_URL_PATTERN =
  /(smartstore.naver.com\/)([-a-zA-Z0-9])*(\/products\/)([0-9]+)/gi;

type AddProductMonitoringItemResult = {
  state: State;
  data?: {
    id: string;
  };
};

const addProductMonitoringItem: Resolvers<
  AddProductMonitoringItemResult
> = async (_, { uri }, { dataSources: { productsDb: client }, loginUser }) => {
  // 네이버 스마트 스토어 제품만 허용
  const match = (uri as string).match(NAVER_SMART_STORE_URL_PATTERN);
  if (!match) {
    return {
      state: {
        ok: false,
        error: "this url isn't a naver store product.",
      },
    };
  }

  const productUrl = new URL(`https://${match[0]}`);
  // 0: empty
  // 1: store code
  // 2: "products"
  // 3: productNo
  const pathName = productUrl.pathname.split("/");

  let productNo = "";
  if (pathName.length >= 4) {
    productNo = pathName[3];
  } else {
    return {
      state: {
        ok: false,
        error: "Product Id exists.",
      },
    };
  }

  // DB 에 존재 하는 확인
  const productItem = await client.productMonitoring.findUnique({
    where: {
      userId_storeProductNo: {
        userId: loginUser.id,
        storeProductNo: productNo,
      },
    },
  });

  if (productItem) {
    return {
      state: {
        ok: false,
        error: "Product item exists.",
      },
    };
  }

  // 모니터링 할 제품 등록
  const res = await getProductInfo(productNo);
  const keywords = [res.data.category.categoryName];

  await client.productMonitoring.create({
    data: {
      productUrl: productUrl.href,
      storeProductNo: productNo,
      user: {
        connect: {
          id: loginUser.id,
        },
      },
    },
  });

  if (keywords?.length > 0) {
    const keyword = keywords[0];
    const mKeywordInfo = await client.monitoringKeyword.create({
      data: {
        productMonitoring: {
          connect: {
            userId_storeProductNo: {
              storeProductNo: productNo,
              userId: loginUser.id,
            },
          },
        },
        keyword,
      },
    });

    const data = await getProductDisplayPosition(keyword, productNo);

    await client.monitoringKeywordRank.create({
      data: {
        date: dateToString(nowKrDate()),
        keywordid: mKeywordInfo.id,
        ...data,
      },
    });
  }

  try {
    return {
      state: {
        ok: true,
      },
      data: {
        id: productNo,
      },
    };
  } catch (e) {
    console.error("addProductMonitoringItem", e);
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
    addProductMonitoringItem: protectedResovler(addProductMonitoringItem),
  },
};

export default resolvers;
