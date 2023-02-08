export default `#graphql

    type UpdateProductRankResult {
        state:State!,
        data:MonitoringKeywordRank
    }

    type Mutation{
        updateProductRank(id:String!):UpdateProductRankResult!
    }

`;
