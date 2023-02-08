export default `#graphql


type RelKwdStatResult{
    relKeyword:String
    monthlyPcQcCnt:String
    monthlyMobileQcCnt:String
    monthlyAvePcClkCnt:String
    monthlyAveMobileClkCnt:String
    monthlyAvePcCtr:String
    monthlyAveMobileCtr:String
    plAvgDepth:String
    compIdx:String
}

type ManagerKeywordResult {
    keyword:String
    isAdult:Boolean
    isRestricted:Boolean
    isSeason:Boolean
    isSellProhibit:Boolean
    isLowSearchVolume:Boolean
    PCPLMaxDepth:Int
}

type RelKwdStatListResult{
    keywordList:[RelKwdStatResult]
}

type ManagerKeywordListResult{
    keyword:String
    managedKeyword:ManagerKeywordResult
}



type Query{
    relKwdStat(
    hintKeywords:String!
    event:Int
    month:Int
    showDetail:Int
    ):RelKwdStatListResult
    managerKeyword(keyword:String!):[ManagerKeywordListResult]!
}

`;
