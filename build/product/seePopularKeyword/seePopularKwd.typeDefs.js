export default `#graphql
    
    

    type PopularKeyword {
        rank:Int
        keyword:String
        kwdCategoryName: String
        monthlyClickCnt:Int
        productCnt:Int
        cid:Int
    }

    type seePopularKwdResult {
        data:[PopularKeyword]
        state:State!
    }

    type Query {
        seePopularKwd(cid:Int!, keyword:String):seePopularKwdResult!
    }
`;
