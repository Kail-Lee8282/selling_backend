export default `#graphql

    type ProductShop {
        isAd:Boolean
        productTitle:String
        imgUrl:String
        productUrl:String
        reviewCount:Int
        purchaseCount:Int
        price:Int
    }

    type ProductShopsResult {
        state:State!
        data: [ProductShop]
    }

    type Query {
        seeProductShops(keyword:String!,page:Int):ProductShopsResult!
    }
`;
