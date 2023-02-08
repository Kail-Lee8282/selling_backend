export default `#graphql

    type AddMonitoringKeywordResult {
        state:State!
        data:MonitoringKeywordRank
    }

    type Mutation {
        addMonitoringKeyword(productNo:String!,keyword:String!):AddMonitoringKeywordResult!
    }
`;
