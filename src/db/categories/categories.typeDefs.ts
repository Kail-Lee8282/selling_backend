export default `#graphql
  
  
 type CategoryResponse{
        ok:Boolean!
        error:String
        data:Category
  }
  

  type Query {
    getCategories(cid: Int!): Category!
  }

  input CategoryInput {
    cid:Int!
    name:String!
    pid:Int
  }

  type Mutation {
    addCategory(cid:Int!, name:String!, pid:Int):CategoryResponse!
    addCategoryFromNamver(cid:Int!):State!
    addManyCategory(items:[CategoryInput]!):CategoryResponse!
  }
`;
