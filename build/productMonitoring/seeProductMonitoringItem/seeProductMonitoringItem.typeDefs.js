const typeDefs = `#graphql
    

    type MonitoringKeywordRank {
        date: String
        index: Int
        page: Int
        rank: Int
        isAd: Boolean
        id: String
        updateAt: String
    }

    type MonitoringKeyword {
        keyword: String
        ranks:[MonitoringKeywordRank]
    }

    type MonitoringProduct {
        title: String 
        productNo: String 
        reviewCount: Int
        reviewScore: Float
        cumulationSaleCount: Int
        recentSaleCount: Int 
        storeName: String 
        salePrice: Int
        mobileSalePrice: Int
        productImageUrl: String
        productUrl:String
        keywords:[MonitoringKeyword]
    }

    type seeProductMonitoringItemResult {
        state:State!
        data:[MonitoringProduct]
    }
    
    type Query{
        seeProductMonitoringItem:seeProductMonitoringItemResult!
    }
`;
export default typeDefs;
