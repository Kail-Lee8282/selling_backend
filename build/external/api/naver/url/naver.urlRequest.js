import axios from "axios";
/**
 * 카테고리에 대한 인기 키워드 조회
 * @param cid
 * @param startDate
 * @param endDate
 * @returns
 */
export async function getRankKeywords(cid, startDate, endDate, page) {
    try {
        const res = await axios.post("https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver", {
            cid,
            timeUnit: "date",
            startDate,
            endDate,
            page: page ? page : 1,
            count: 20,
        }, {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                referer: "https://datalab.naver.com/shoppingInsight/sCategory.naver",
            },
        });
        return res.data;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
/**
 * 네이버 데이터 렙에 있는 카테고리 정보를 읽어 온다.
 * @param cid 카테고리 ID
 * @returns
 */
export function getCategoriesFormNaver(cid) {
    try {
        return axios.get("https://datalab.naver.com/shoppingInsight/getCategory.naver", {
            params: {
                cid,
            },
            headers: {
                referer: "https://datalab.naver.com/shoppingInsight/sCategory.naver",
            },
        });
    }
    catch (e) {
        console.error(e);
        return undefined;
    }
}
export function getShoppingProuctList(keyword, index) {
    try {
        const pagingIndex = index ? index : 1;
        return axios.get("https://msearch.shopping.naver.com/api/search/all", {
            params: {
                sort: "rel",
                pagingIndex,
                pagingSize: 40,
                viewType: "lst",
                productSet: "total",
                frm: "NVSHPAG",
                query: keyword,
                origQuery: keyword,
            },
            headers: {
                referer: "https://msearch.shopping.naver.com/search/all",
                Cookie: "NNB=OX7KGUIVXVDWG;",
            },
        });
    }
    catch (e) {
        console.error("getShoppingProuctList", e);
        return null;
    }
}
export function getProductInfo(productNo) {
    try {
        return axios.get(`https://smartstore.naver.com/i/v1/simple-products/${productNo}`);
    }
    catch (e) {
        console.error("getProductInfo", e);
        return null;
    }
}
