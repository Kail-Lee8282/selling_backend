const typeDefs = `#graphql
    type DataLabResultData  {
    period: String
    ratio: String
    group: String
    }

    type DataLabResult {
    title: String
    category:[String]
    keywords: [String]
    keyword: [String]
    data: [DataLabResultData]
    }

    type DataLabData {
    startDate: String
    endDate: String
    timeUnit: String
    results: [DataLabResult]
    }

    type Result {
    ok:Boolean!
    error:String
    data:DataLabData
    }

    type Shop{
    title:String
    link:String
    image:String
    lprice:String
    hprice:String
    mallName:String
    productId:String
    productType:Int
    maker:String
    brand:String
    category1:String
    category2:String
    category3:String
    category4:String
    }

    type ShopChannel{
        lastBuildDate:String
        total:Int
        start:Int
        display:Int
        items:[Shop]
    }

    
    type SearchShopResult{
        ok:Boolean!
        error:String
        rss:ShopChannel
    }
    
    type Query {

        searchShop(
            query:String!,
            display:Int,
            start:Int,
            sort:String,
            filter:String,
            exclude:String):SearchShopResult

        trandKeyword(
            startDate:String!, 
            endDate:String!,
            timeUnit:String!, 
            groupName:String!,
            keywords:[String],
            device:String,
            gender:String,
            ages:[String]):Result

        categoryKeywordAge(
            startDate:String!, 
            endDate:String!,
            timeUnit:String!, 
            category:String!,
            keyword:String!, 
            device:String,
            gender:String,
            ages:[String]):Result

        categoryGender(
            startDate:String!, 
            endDate:String!,
            timeUnit:String!, 
            category:String!,
            device:String,
            gender:String,
            ages:[String]):Result
    }
`;
export default typeDefs;
