/**
 * 부모 카테고리 값 조회(재귀)
 * @param cid
 * @param client
 * @returns
 */
const getParentCategory = async (cid, client) => {
    if (cid === null)
        return [];
    const item = await client.category.findUnique({
        where: {
            cid,
        },
        select: {
            cid: true,
            name: true,
            pid: true,
        },
    });
    if (item.pid !== null && item.pid >= 0) {
        const arr = await getParentCategory(item.pid, client);
        return [...arr, item];
    }
    else {
        return [item];
    }
};
const parent = ({ pid }, _, { dataSources: { productsDb: client } }) => getParentCategory(pid, client);
const level = async ({ cid }, _, { dataSources: { productsDb: client } }) => {
    const res = (await getParentCategory(cid, client));
    if (res) {
        return res.length - 1;
    }
    return 0;
};
const resolvers = {
    Category: {
        parent,
        level,
    },
};
export default resolvers;
