import axios from "axios";

export interface NaverKeywordRank {
  keyword: string;
  linkId: string;
  rank: number;
  productCount?: number;
}

interface NaverRankResponse {
  date: string;
  datetime: string;
  message: string | null;
  range: string;
  ranks: NaverKeywordRank[];
  returnCode: number;
  statesCode: number;
}
/**
 * 카테고리에 대한 인기 키워드 조회
 * @param cid
 * @param startDate
 * @param endDate
 * @returns
 */
export async function getRankKeywords(
  cid: number,
  startDate: string,
  endDate: string,
  page?: number
) {
  try {
    const res = await axios.post<NaverRankResponse>(
      "https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver",
      {
        cid,
        timeUnit: "date",
        startDate,
        endDate,
        page: page ? page : 1,
        count: 20,
      },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          referer: "https://datalab.naver.com/shoppingInsight/sCategory.naver",
        },
      }
    );

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

type NaverCategoryResponse = {
  cid: number;
  pid: number;
  name: string;
  childList: NaverCategoryResponse[];
};

/**
 * 네이버 데이터 렙에 있는 카테고리 정보를 읽어 온다.
 * @param cid 카테고리 ID
 * @returns
 */
export function getCategoriesFormNaver(cid: number) {
  try {
    return axios.get<NaverCategoryResponse>(
      "https://datalab.naver.com/shoppingInsight/getCategory.naver",
      {
        params: {
          cid,
        },
        headers: {
          referer: "https://datalab.naver.com/shoppingInsight/sCategory.naver",
        },
      }
    );
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export type NaverProduct = {
  category1Id: string;
  category1Name: string;
  category2Id: string;
  category2Name: string;
  category3Id: string;
  category3Name: string;
  category4Id: string;
  category4Name: string;
  crUrl: string;
  imageUrl: string;
  adImageUrl: string;
  productTitle: string;
  lowPrice: number;
  mallProductUrl: string;
  mallProductId: string;
  purchaseCnt: number;
  reviewCountSum: number;
  mallCount: number;
  adcrUrl: string;
  mallName: string;
  openDate: string;
  adId: string;
  gdid: string;
};
type NaverShoppingResult = {
  query: string;
  mallNo: string;
  productCount: number;
  total: number;
  products: NaverProduct[];
  cmp: {
    count: number;
    categories: {
      id: string;
      name: string;
      relevance: number;
    }[];
  };
};
type NaverShopListResponse = {
  mainFilters: any[];
  subFilters: any[];
  selectedFilters: any[];
  shoppingResult: NaverShoppingResult;
  relatedTags: string[];
  searchAdResult: {
    products: NaverProduct[];
    adMeta: any;
  };
};

export function getShoppingProuctList(keyword: string, index?: number) {
  try {
    const pagingIndex = index ? index : 1;

    return axios.get<NaverShopListResponse>(
      "https://msearch.shopping.naver.com/api/search/all",
      {
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
        },
      }
    );
  } catch (e) {
    console.error("getShoppingProuctList", e);
    return null;
  }
}

type NaverSimpleProductResponse = {
  id: number;
  category: {
    wholeCategoryid: string;
    wholeCategoryName: string;
    categoryId: string;
    categoryName: string;
  };
  name: string;
  channel: {
    channelNo: number;
    accountNo: number;
    channelName: string;
  };
  productNo: number;
  salePrice: number;
  seoInfo: {
    sellerTags: { code: number; text: string }[];
  };
  naverShoppingSearchInfo: {
    manufacturerName: string;
    brandName: string;
    modelName: string;
  };
  benefitsView: {
    discountedSalePrice: number;
    mobileDiscountedSalePrice: number;
  };
  saleAmount: {
    cumulationSaleCount: number;
    recentSaleCount: number;
  };
  reviewAmount: {
    totalReviewCount: number;
    premiumRevieCount: number;
    averageReviewScore: number;
    productSatisfactionPercent: number;
  };
  representativeImageUrl: string;
};

export function getProductInfo(productNo: string) {
  try {
    return axios.get<NaverSimpleProductResponse>(
      `https://smartstore.naver.com/i/v1/simple-products/${productNo}`
    );
  } catch (e) {
    console.error("getProductInfo", e);
    return null;
  }
}
