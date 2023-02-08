import { getMobileProductShopList } from "../product/seeProductShops/seeProductShops.resolvers";
import { StoreKeywordRank } from "./storeMonitoring.resolvers";

/**
 * 스토어이름, 키워드 검색 결과 반환
 * @param storeName
 * @param keyword
 * @returns
 */
export async function FindStoreKeyword(
  storeName: string,
  keyword: string
): Promise<StoreKeywordRank[]> {
  try {
    const MAX_SEARCH_PAGE = 10;
    const data: StoreKeywordRank[] = [];
    for (let page = 1; page <= MAX_SEARCH_PAGE; page++) {
      const searchList = await getMobileProductShopList(keyword, page);
      searchList.forEach((product, index) => {
        if (product.mallName === storeName) {
          const idx = index + 1;
          data.push({
            id: `${product.id}_${storeName}_${keyword}`,
            storeName: product.mallName,
            keyword,
            title: product.productTitle,
            isAd: product.isAd,
            productId: product.productId,
            productImg: product.imgUrl,
            productUrl: product.productUrl,
            reviewCount: product.reviewCount,
            purchaseCount: product.purchaseCount,
            rank: (page - 1) * 50 + idx,
            page,
            index: idx,
            seleStart: product.selseStart,
            updatedAt: "",
          });
        }
      });
    }

    return data;
  } catch (e) {
    throw e;
  }
}
