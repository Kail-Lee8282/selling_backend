import { Resolvers, State } from "../../types";
import { getShoppingProuctList } from "../../external/api/naver/url/naver.urlRequest";
type ProductShop = {
  isAd?: boolean;
  productTitle: string;
  productId: string;
  imgUrl: string;
  productUrl: string;
  reviewCount: number;
  purchaseCount: number;
  price: number;
  mallName: string;
  selseStart: string;
  id: string;
};

type ProductShopsResult = {
  state: State;
  data?: ProductShop[];
};

/**
 * 모바일 기준 리스트 조회
 * @param keyword 검색할 키워드
 * @param page 검색할 페이지
 * @returns 모바일 페이지 상품 리스트
 */
export async function getMobileProductShopList(
  keyword: string,
  page: number
  // tryCnt?: number
) {
  // if (!tryCnt) {
  //   tryCnt = 0;
  // }
  try {
    const list = await getShoppingProuctList(keyword, page);

    if (!list.data.shoppingResult) {
      return [];
    }

    // 일반 상품 리스트
    const data = list.data.shoppingResult.products?.map((item) => {
      const reviewCount =
        typeof item.reviewCountSum === "string"
          ? Number(item.reviewCountSum)
          : item.reviewCountSum;
      const purchaseCount =
        typeof item.purchaseCnt === "string"
          ? Number(item.purchaseCnt)
          : item.purchaseCnt;

      return {
        id: item.gdid,
        isAd: false,
        productTitle: item.productTitle,
        productId: item.mallProductId,
        imgUrl: item.imageUrl,
        productUrl: item.mallCount > 0 ? item.crUrl : item.mallProductUrl,
        reviewCount,
        purchaseCount,
        price: item.lowPrice,
        mallName: item.mallName,
        selseStart: item.openDate,
      } as ProductShop;
    });

    // 광고 상품 리스트
    if (list.data.searchAdResult && list.data.searchAdResult.products) {
      list.data.searchAdResult.products.forEach((item, index) => {
        let insertIdx = 0;
        if (index < 3) {
          insertIdx = index;
        } else if (index < 6) {
          insertIdx = 13 + (index % 3);
        } else {
          insertIdx = 26 + (index % 6);
        }

        const reviewCount =
          typeof item.reviewCountSum === "string"
            ? Number(item.reviewCountSum)
            : item.reviewCountSum;
        const purchaseCount =
          typeof item.purchaseCnt === "string"
            ? Number(item.purchaseCnt)
            : item.purchaseCnt;

        data.splice(insertIdx, 0, {
          isAd: true,
          id: item.adId,
          imgUrl: item.adImageUrl ? item.adImageUrl : item.imageUrl,
          productTitle: item.productTitle,
          productId: item.mallProductId,
          productUrl: item.adcrUrl,
          price: item.lowPrice,
          purchaseCount,
          reviewCount,
          mallName: item.mallName,
          selseStart: item.openDate,
        });
      });
    }

    return data;
  } catch (e) {
    console.error("getMobileProductShopList", keyword, page, e);
    return null;
  }
}

const seeProductShops: Resolvers<ProductShopsResult> = async (
  _,
  { keyword, page }
) => {
  try {
    const upperKwd = (keyword as string).toUpperCase();
    const paging = page ? page : 1;

    const data = await getMobileProductShopList(upperKwd, paging);

    return {
      state: {
        ok: true,
      },
      data,
    };
  } catch (e) {
    console.error("seeProductShops", e);
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
    seeProductShops,
  },
};

export default resolvers;
