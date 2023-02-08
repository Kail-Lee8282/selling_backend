import { PrismaClient } from "@prisma/client";
import { getCategoriesFormNaver } from "../../external/api/naver/url/naver.urlRequest";
import { Resolvers, State } from "../../types";
import { adminProtectedResolver } from "../user/user.utils";

const getCategories: Resolvers = (
  _,
  { cid },
  { dataSources: { productsDb: client } }
) =>
  client.category.findUnique({
    where: {
      cid,
    },
    include: {
      children: true,
    },
  });

const addCategory: Resolvers = async (
  _,
  { cid, name, pid },
  { dataSources: { productsDb: client } }
) => {
  try {
    let parentId = 0;
    if (pid) {
      parentId = pid;
    }

    const existCid = await client.category.findUnique({
      where: {
        cid,
      },
    });

    if (existCid) {
      throw new Error("Exist cid.");
    }

    const existPid = await client.category.findUnique({
      where: {
        cid: parentId,
      },
    });

    if (!existPid) {
      throw new Error("Not exsit pid.");
    }

    const data = await client.category.create({
      data: {
        cid,
        name,
        parent: {
          connect: {
            cid: parentId,
          },
        },
      },
    });

    return {
      ok: true,
      data,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      error: err.message,
    };
  }
};

const addManyCategory: Resolvers = async (
  _,
  { items },
  { dataSources: { productsDb: client } }
) => {
  console.log(items);

  const log = await client.category.createMany({
    data: items,
  });

  console.log(log);
  return {
    ok: true,
  };
};

const addCategoryFromNamver: Resolvers = async (
  _,
  { cid },
  { dataSources: { productsDb: client } }
) => {
  try {
    const cate = await getCategoriesFormNaver(cid);

    if (cate.data && cate.data.childList && cate.data.childList.length > 0) {
      const param = cate.data.childList.map((item) => {
        return {
          cid: item.cid,
          name: item.name,
          pid: item.pid,
        };
      });

      await client.category.createMany({
        data: param,
        skipDuplicates: true,
      });

      return {
        ok: true,
      };
    } else {
      return {
        ok: false,
        error: "not found childlist",
      };
    }
  } catch (e) {
    return {
      ok: false,
      error: e.message,
    };
  }
};

async function InsertCategory(cid: number, client: PrismaClient) {
  const root = await getCategoriesFormNaver(cid);
  if (root.data && root.data.childList && root.data.childList.length > 0) {
    const param = root.data.childList.map((item) => {
      return {
        cid: item.cid,
        name: item.name,
        pid: item.pid,
      };
    });
    console.log(param);

    await client.category.createMany({
      data: param,
      skipDuplicates: true,
    });

    await Promise.all(
      root.data.childList.map(async (item) => {
        await InsertCategory(item.cid, client);
      })
    );
  }
}

const addInnerCategory: Resolvers<State> = async (
  _,
  { cid },
  { dataSources: { productsDb: client } }
) => {
  try {
    await InsertCategory(cid, client);
    return {
      ok: true,
    };
  } catch (e) {
    console.error("addInnerCategory", e);
    return {
      ok: false,
      error: e.message,
    };
  }
};

const resolvers = {
  Query: {
    getCategories,
  },
  Mutation: {
    addCategory: adminProtectedResolver(addCategory),
    addCategoryFromNamver: adminProtectedResolver(addInnerCategory),
    addManyCategory: adminProtectedResolver(addManyCategory),
  },
};

export default resolvers;
