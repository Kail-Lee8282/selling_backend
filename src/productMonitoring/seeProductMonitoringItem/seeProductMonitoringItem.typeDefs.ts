const typeDefs = `#graphql
    


    type MonitoringKeyword {
        keyword: String
        id:String
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
        wholeCategoryName:String
        searchTags:[String]
        keywords:[MonitoringKeyword]
    }

    type seeProductMonitoringItemsResult {
        state:State!
        data:[MonitoringProduct]
    }
    
    type seeProductMonitoringItemResult {
        state:State!
        data:MonitoringProduct
    }

    type Query{
        seeProductMonitoringItems:seeProductMonitoringItemsResult!
        seeProductMonitoringItem(productNo:String!):seeProductMonitoringItemResult!
    }
`;

export default typeDefs;
