export default `#graphql
   
    type Category {
        cid:Int!
        name:String
        pid:Int
        level:Int
        parent:[Category]
        children:[Category]
    }
    
    type Grade{
        code:String!
        gradeName:String
        gradeDesc:String
        level:Int
    }

    type User {
        id:String!
        email:String!
        userName:String
        password:String
        phoneNum:String
        grade:Grade
        createdAt:String
        update:String
    }

 type MutationResponse{
        ok:Boolean!
        error:String
    }




`;
