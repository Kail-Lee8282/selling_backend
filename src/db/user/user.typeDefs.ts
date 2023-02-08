export default `#graphql


    type LoginResult{
        ok:Boolean!
        error:String
        token:String
    }

    type Mutation{
        createAccount(
            email:String!,
            userName:String,
            password:String,
            phoneNumber:String,
        ):MutationResponse

        login(email:String!, password:String!):LoginResult
    }

    type Query{
        me:User
    }
    
`;
