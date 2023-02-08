import axios from "axios";
/**
 * 전체 카테고리 경로 변경
 * @param category1
 * @param category2
 * @param category3
 * @param category4
 * @returns
 */
export const fullPathCategory = (category1, category2, category3, category4) => {
    let result = "";
    if (category1) {
        result += category1;
        if (category2) {
            result += `>${category2}`;
            if (category3) {
                result += `>${category3}`;
                if (category4) {
                    result += `>${category4}`;
                }
            }
        }
    }
    return result;
};
/**
 * 카테고리에 대한 인기 키워드 조회
 * @param cid
 * @param startDate
 * @param endDate
 * @returns
 */
export async function getRankKeywords(cid, startDate, endDate) {
    try {
        const res = await axios.post("https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver", {
            cid,
            timeUnit: "date",
            startDate,
            endDate,
            page: 1,
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
