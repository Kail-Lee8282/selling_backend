const managerKeyword = async (_, { keyword }, { dataSources: { naverAdAPI } }) => {
    const res = await naverAdAPI.getManagedKeyword(keyword);
    return res;
};
const resolvers = {
    Query: {
        relKwdStat: async (_, { hintKeywords, event, month, showDetail }, { dataSources }) => {
            return await dataSources.naverAdAPI.getRelKwdStat(hintKeywords, event, month, showDetail);
        },
        managerKeyword,
    },
};
export default resolvers;
