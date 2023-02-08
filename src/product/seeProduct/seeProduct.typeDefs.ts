const typeDefs = `#graphql


type SeeProductResult {
    state:State!
    product:Product
}

type Query {
    seeProduct(keyword:String!):SeeProductResult!
    test(test:String, cid:Int):State!
}
`;

export default typeDefs;
