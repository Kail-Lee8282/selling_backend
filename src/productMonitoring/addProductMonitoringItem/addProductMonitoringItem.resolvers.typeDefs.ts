export default `#graphql

type AddProductMonitoringItemReturn {
    id:String
}


type AddProductMonitoringItemResult {
    state:State!
    data:AddProductMonitoringItemReturn
}

type Mutation {
    addProductMonitoringItem(uri:String!):AddProductMonitoringItemResult!
}
`;
