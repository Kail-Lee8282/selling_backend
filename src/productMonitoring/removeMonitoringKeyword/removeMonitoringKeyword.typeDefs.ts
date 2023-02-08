export default `#graphql

    type RemoveMonitoringKwdResult {
        state:State!
        
    }

    type Mutation {
        removeMonitoringKeyword(id:String):RemoveMonitoringKwdResult!
    }
`;
