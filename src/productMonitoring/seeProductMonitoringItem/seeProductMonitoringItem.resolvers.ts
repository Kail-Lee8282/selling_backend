import { protectedResovler } from "../../db/user/user.utils";
import { getProductInfo } from "../../external/api/naver/url/naver.urlRequest";
import { Resolvers, State } from "../../types";

export type MonitoringKeywordRank = {
  date: string;
  index: number;
  page: number;
  rank: number;
  adIndex: number;
  adPage: number;
  adRank: number;
  id: string;
  updateAt: Date;
};

export type MonitoringProduct = {
  title: string; //제품 명
  productNo: string; // 제품 코드
  reviewCount: number; // 리뷰 개수
  reviewScore: number; // 리뷰 평점
  cumulationSaleCount: number; // 6개월 판매개 수
  recentSaleCount: number; //3일 판개 개수
  storeName: string; // 스토어 명
  salePrice: number; //실제 판매 가격 PC - 할일율 적용
  mobileSalePrice: number; // 실제 판매 가격 모바일 - 할인율 적용
  productImageUrl?: string; //제품 이미지
  productUrl: string;
  storeUrl?: string;
  wholeCategoryName?: string;
  searchTags?: string[];
  keywords?: MonitoringKeyword[];
};

type MonitoringKeyword = {
  keyword: string;
  id: string;
  ranks?: MonitoringKeywordRank[];
};

type seeProductMonitoringItemsResult = {
  state: State;
  data?: MonitoringProduct[];
};

type seeProductMonitoringItemResult = {
  state: State;
  data?: MonitoringProduct;
};

const seeProductMonitoringItems: Resolvers<
  seeProductMonitoringItemsResult
> = async (_, __, { loginUser, dataSources: { productsDb: client } }) => {
  try {
    const monitoringItems = await client.productMonitoring.findMany({
      where: {
        userId: loginUser.id,
      },
    });

    const data: MonitoringProduct[] = [];
    for (let i = 0; i < monitoringItems.length; i++) {
      const item = monitoringItems[i];
      const res_ProductInfo = await getProductInfo(item.storeProductNo);
      const res_Keywords = await client.monitoringKeyword.findMany({
        where: {
          productNo: item.storeProductNo,
          userId: loginUser.id,
        },
        include: {
          MonitoringKeywordRank: {
            select: {
              date: true,
              index: true,
              keywordid: true,
              page: true,
              rank: true,
              adIndex: true,
              adPage: true,
              adRank: true,
              updatedAt: true,
            },
            orderBy: {
              updatedAt: "asc",
            },
          },
        },
      });

      const keywordRanks = res_Keywords.map<MonitoringKeyword>((item) => {
        return {
          keyword: item.keyword,
          id: item.id,
          ranks: item.MonitoringKeywordRank?.map((rank) => {
            return {
              date: rank.date,
              id: rank.keywordid,
              index: rank.index,
              page: rank.page,
              rank: rank.rank,
              adIndex: rank.adIndex,
              adPage: rank.adPage,
              adRank: rank.adRank,
              updateAt: rank.updatedAt,
            };
          }),
        };
      });

      const productInfo = res_ProductInfo.data;
      if (productInfo) {
        data.push({
          productNo: item.storeProductNo,
          title: productInfo.name,
          reviewCount: productInfo.reviewAmount.totalReviewCount,
          reviewScore: productInfo.reviewAmount.averageReviewScore,
          cumulationSaleCount: productInfo.saleAmount.cumulationSaleCount,
          recentSaleCount: productInfo.saleAmount.recentSaleCount,
          storeName: productInfo.channel.channelName,
          salePrice: productInfo.benefitsView.discountedSalePrice,
          mobileSalePrice: productInfo.benefitsView.mobileDiscountedSalePrice,
          productImageUrl: productInfo.representativeImageUrl,
          productUrl: item.productUrl,
          keywords: keywordRanks,
        });
      }
    }

    return {
      state: {
        ok: true,
      },
      data,
    };
  } catch (e) {
    console.error("seeProductMonitoringItems", e);
    return {
      state: {
        ok: false,
        error: e,
      },
    };
  }
};

const seeProductMonitoringItem: Resolvers<
  seeProductMonitoringItemResult
> = async (
  _,
  { productNo },
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    const dbProductInfo = await client.productMonitoring.findUnique({
      where: {
        userId_storeProductNo: {
          storeProductNo: productNo,
          userId: loginUser.id,
        },
      },
    });

    if (!dbProductInfo) {
      return {
        state: {
          ok: false,
          error: "Item is not exist",
        },
      };
    }

    const res_ProductInfo = await getProductInfo(productNo);
    const res_Keywords = await client.monitoringKeyword.findMany({
      where: {
        productNo: productNo,
        userId: loginUser.id,
      },
      include: {
        MonitoringKeywordRank: {
          select: {
            date: true,
            index: true,
            keywordid: true,
            page: true,
            rank: true,
            adIndex: true,
            adPage: true,
            adRank: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "asc",
          },
        },
      },
    });

    console.log(res_Keywords);

    const keywordRanks = res_Keywords.map<MonitoringKeyword>((item) => {
      return {
        keyword: item.keyword,
        id: item.id,
        ranks: item.MonitoringKeywordRank?.map((rank) => {
          return {
            date: rank.date,
            id: rank.keywordid,
            index: rank.index,
            page: rank.page,
            rank: rank.rank,
            adIndex: rank.adIndex,
            adPage: rank.adPage,
            adRank: rank.adRank,
            updateAt: rank.updatedAt,
          };
        }),
      };
    });

    const productInfo = res_ProductInfo.data;
    if (!productInfo) {
      return {
        state: {
          ok: false,
          error: "Not exist product infomation",
        },
      };
    }

    const data = {
      productNo: productNo,
      title: productInfo.name,
      reviewCount: productInfo.reviewAmount.totalReviewCount,
      reviewScore: productInfo.reviewAmount.averageReviewScore,
      cumulationSaleCount: productInfo.saleAmount.cumulationSaleCount,
      recentSaleCount: productInfo.saleAmount.recentSaleCount,
      storeName: productInfo.channel.channelName,
      salePrice: productInfo.benefitsView.discountedSalePrice,
      mobileSalePrice: productInfo.benefitsView.mobileDiscountedSalePrice,
      productImageUrl: productInfo.representativeImageUrl,
      productUrl: dbProductInfo.productUrl,
      keywords: keywordRanks,
      wholeCategoryName: res_ProductInfo.data.category.wholeCategoryName,
      searchTags: res_ProductInfo.data.seoInfo.sellerTags?.map(
        (item) => item.text
      ),
    };

    return {
      state: {
        ok: true,
      },
      data,
    };
  } catch (e) {
    console.error("seeProductMonitoringItem", e);
    return {
      state: {
        ok: false,
        error: e,
      },
    };
  }
};

const resolvers = {
  Query: {
    seeProductMonitoringItems: protectedResovler(seeProductMonitoringItems),
    seeProductMonitoringItem: protectedResovler(seeProductMonitoringItem),
  },
};

export default resolvers;
