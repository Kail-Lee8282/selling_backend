import { protectedResovler } from "../../db/user/user.utils";
import { getProductInfo } from "../../external/api/naver/url/naver.urlRequest";
const seeProductMonitoringItem = async (_, __, { loginUser, dataSources: { productsDb: client } }) => {
    try {
        const monitoringItems = await client.productMonitoring.findMany({
            where: {
                userId: loginUser.id,
            },
        });
        const data = [];
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
                            isAd: true,
                            keywordid: true,
                            page: true,
                            rank: true,
                            updatedAt: true,
                        },
                    },
                },
            });
            const keywordRanks = res_Keywords.map((item) => {
                return {
                    keyword: item.keyword,
                    ranks: item.MonitoringKeywordRank.map((rank) => {
                        return {
                            date: rank.date,
                            id: rank.keywordid,
                            index: rank.index,
                            page: rank.page,
                            rank: rank.rank,
                            isAd: rank.isAd,
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
    }
    catch (e) {
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
        seeProductMonitoringItem: protectedResovler(seeProductMonitoringItem),
    },
};
export default resolvers;
