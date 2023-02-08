import { getShoppingProuctList } from "../../external/api/naver/url/naver.urlRequest";
/**
 * 모바일 기준 리스트 조회
 * @param keyword
 * @param page
 * @returns
 */
export async function getMobileProductShopList(keyword, page) {
    try {
        const list = await getShoppingProuctList(keyword, page);
        const data = list.data.shoppingResult.products.map((item) => {
            return {
                productTitle: item.productTitle,
                productId: item.mallProductId,
                imgUrl: item.imageUrl,
                productUrl: item.mallCount > 0 ? item.crUrl : item.mallProductUrl,
                reviewCount: item.reviewCountSum,
                purchaseCount: item.purchaseCnt,
                price: item.lowPrice,
            };
        });
        list.data.searchAdResult.products.forEach((item, index) => {
            let insertIdx = 0;
            if (index < 3) {
                insertIdx = index;
            }
            else if (index < 6) {
                insertIdx = 13 + (index % 3);
            }
            else {
                insertIdx = 26 + (index % 6);
            }
            data.splice(insertIdx, 0, {
                isAd: true,
                imgUrl: item.adImageUrl ? item.adImageUrl : item.imageUrl,
                productTitle: item.productTitle,
                productId: item.mallProductId,
                productUrl: item.adcrUrl,
                price: item.lowPrice,
                purchaseCount: item.purchaseCnt,
                reviewCount: item.reviewCountSum,
            });
        });
        return data;
    }
    catch (e) {
        console.error("getMobileProductShopList", e);
        return null;
    }
}
const seeProductShops = async (_, { keyword, page }) => {
    try {
        const upperKwd = keyword.toUpperCase();
        const paging = page ? page : 1;
        const data = await getMobileProductShopList(upperKwd, paging);
        return {
            state: {
                ok: true,
            },
            data,
        };
    }
    catch (e) {
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
