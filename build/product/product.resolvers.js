/**
 * 전체 카테고리 경로 변경
 * @param category1
 * @param category2
 * @param category3
 * @param category4
 * @returns
 */
export const fullPathCategory = (category1, category2, category3, category4) => {
    let result = "";
    if (category1) {
        result += category1;
        if (category2) {
            result += `>${category2}`;
            if (category3) {
                result += `>${category3}`;
                if (category4) {
                    result += `>${category4}`;
                }
            }
        }
    }
    return result;
};
/**
 * 마지막 카테고리 명칭 반환
 * @param category
 * @returns
 */
export function finalCategory(category) {
    if (category) {
        return category.category4 && category.category4.length > 0
            ? category.category4
            : category.category3 && category.category3.length > 0
                ? category.category3
                : category.category2 && category.category2.length > 0
                    ? category.category2
                    : category.category1;
    }
    else {
        return "";
    }
}
const fullCategory = ({ category1, category2, category3, category4, }) => {
    return fullPathCategory(category1, category2, category3, category4);
};
const percent = ({ display, count }) => {
    return Math.round((count / display) * 100);
};
const categoryCid1 = async ({ category1 }, _, { dataSources: { productsDb: client } }) => {
    const { cid } = await client.category.findFirst({
        where: {
            name: category1,
        },
        select: {
            cid: true,
        },
    });
    return cid;
};
const categoryCid2 = async ({ category2 }, _, { dataSources: { productsDb: client } }) => {
    const { cid } = await client.category.findFirst({
        where: {
            name: category2,
        },
        select: {
            cid: true,
        },
    });
    return cid;
};
const categoryCid3 = async ({ category3 }, _, { dataSources: { productsDb: client } }) => {
    const { cid } = await client.category.findFirst({
        where: {
            name: category3,
        },
        select: {
            cid: true,
        },
    });
    return cid;
};
const categoryCid4 = async ({ category4 }, _, { dataSources: { productsDb: client } }) => {
    const { cid } = await client.category.findFirst({
        where: {
            name: category4,
        },
        select: {
            cid: true,
        },
    });
    return cid;
};
const getProductCid = async ({ category }, _, { dataSources: { productsDb: client } }) => {
    const info = category;
    if (info && info.length > 0) {
        const name = finalCategory(info[0]);
        const { cid } = await client.category.findFirst({
            where: {
                name,
            },
            select: {
                cid: true,
            },
        });
        return cid;
    }
    return 0;
};
const resolver = {
    ProductCategory: {
        fullCategory,
        percent,
        categoryCid1,
        categoryCid2,
        categoryCid3,
        categoryCid4,
    },
    Product: {
        cid: getProductCid,
    },
};
export default resolver;
