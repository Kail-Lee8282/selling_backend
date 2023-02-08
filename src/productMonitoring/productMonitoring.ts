import { getMobileProductShopList } from "../product/seeProductShops/seeProductShops.resolvers";
import { sleep } from "../util";

/**
 * 제품 표시위치 반환
 * @param keyword
 * @param productNo
 * @returns
 */
export async function getProductDisplayPosition(
  keyword: string,
  productNo: string
) {
  const result = {
    adIndex: -1,
    adPage: -1,
    adRank: -1,
    index: -1,
    page: -1,
    rank: -1,
  };
  try {
    let find = false;
    let findAd = false;
    for (let page = 1; page < 20; page++) {
      const data = await getMobileProductShopList(keyword, page);

      const findIdx = data.findIndex((item) => item.productId === productNo);

      if (findIdx >= 0) {
        const index = findIdx + 1;
        if (data[findIdx].isAd) {
          result.adIndex = index;
          result.adPage = page;
          result.adRank = index * page;
          findAd = true;
        } else {
          result.index = index;
          result.page = page;
          result.rank = index * page;
          find = true;
        }
      }

      if (find && findAd) {
        break;
      }

      await sleep(100);
    }
  } catch (e) {
    console.error("getProductDisplayPosition", e);
  }
  return result;
}
