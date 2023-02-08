const resolvers = {
    Query: {
        searchShop: async (_, { query, display, start, sort, filter, exclude }, { dataSources }) => {
            try {
                const data = await dataSources.naverDataLabAPI.getShop(query, display, start, sort, filter, exclude);
                console.log(data);
                return {
                    ok: true,
                    rss: data,
                };
            }
            catch (e) {
                console.log("searchShop", e);
                return {
                    ok: false,
                    error: e,
                };
            }
        },
        trandKeyword: async (_, { startDate, endDate, timeUnit, groupName, keywords, device, gender, ages, }, { dataSources }) => {
            try {
                const data = await dataSources.naverDataLabAPI.getDataLabSearch(startDate, endDate, timeUnit, groupName, keywords, device, gender, ages);
                return {
                    ok: true,
                    data,
                };
            }
            catch (e) {
                return {
                    ok: false,
                    error: e,
                };
            }
        },
        categoryKeywordAge: async (_, { startDate, endDate, timeUnit, category, keyword, device, gender, ages }, { dataSources }) => {
            try {
                console.log(startDate, endDate, timeUnit, category, keyword, device, gender, ages);
                const data = await dataSources.naverDataLabAPI.getShoppingCategoryKeywordAge(startDate, endDate, timeUnit, category, keyword, device, gender, ages);
                return {
                    ok: true,
                    data,
                };
            }
            catch (e) {
                return {
                    ok: false,
                    error: e,
                };
            }
        },
        categoryGender: async (_, { startDate, endDate, timeUnit, category, device, gender, ages }, { dataSources }) => {
            try {
                const data = await dataSources.naverDataLabAPI.getShoppingCategoryGender(startDate, endDate, timeUnit, category, device, gender, ages);
                return {
                    ok: true,
                    data,
                    error: "",
                };
            }
            catch (e) {
                return {
                    ok: false,
                    error: e,
                };
            }
        },
    },
};
export default resolvers;
