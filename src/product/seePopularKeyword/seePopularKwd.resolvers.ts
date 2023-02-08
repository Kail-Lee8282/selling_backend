import { CategoryPopularKwd, Prisma, PrismaClient } from "@prisma/client";
import {
  getRankKeywords,
  NaverKeywordRank,
} from "../../external/api/naver/url/naver.urlRequest";
import { ContextValue, Resolvers, State } from "../../types";
import { dateToString, nowKrDate, upDateToString } from "../../util";
import { finalCategory, Keywords, Product } from "../product.resolvers";
import {
  createSelectProductInfo,
  InsertProduct,
} from "../seeProduct/seeProduct.resolvers";
import { ProductCategory } from "../product.resolvers";

export type PopularKeyword = {
  rank: number;
  keyword: string;
  cid?: number;
  monthlyClickCnt?: number;
  productCnt?: number;
  kwdCategoryName?: string;
  info?: Product | null;
};

type seePopularKwdResult = {
  data?: PopularKeyword[];
  state: State;
};

/**
 * arr를 popularkwd 배열로 변경
 * @param arr
 * @param cid
 * @param client
 * @param naverAdAPI
 * @param naverDataLabAPI
 * @returns
 */
async function createPopularKwdArr(
  arr: { keyword: string; rank: number }[],
  cid: number,
  context: ContextValue,
  info: any
): Promise<PopularKeyword[]> {
  const result: PopularKeyword[] = [];

  if (!arr) return result;

  for (const item of arr) {
    const product = await createSelectProductInfo(item.keyword, context, info);

    // const product = await info.parentType._fields.seeProduct.resolve(
    //   undefined,
    //   { keyword: item.keyword },
    //   context,
    //   info
    // );

    result.push({
      ...item,
      cid,
      info: product,
    });
  }
  return result;
}

async function getPopularKwds(
  cid: number,
  context: ContextValue,
  info: any
): Promise<PopularKeyword[]> {
  try {
    // 한달 기준
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);

    let result: PopularKeyword[] = [];
    // DB 데이터 체크
    const findPopularKwd =
      await context.dataSources.productsDb.categoryPopularKwd.findMany({
        where: {
          date: dateToString(nowKrDate()),
          cid,
        },
        select: {
          keyword: true,
          cid: true,
          rank: true,
        },
      });

    if (findPopularKwd && findPopularKwd.length > 0) {
      // DB 데이터 존재
      result = await createPopularKwdArr(findPopularKwd, cid, context, info);
    } else {
      // 키워드 랭킹 조회
      const getPopularKwd = await getRankKeywords(
        cid,
        dateToString(beforMonth),
        dateToString(beforday)
      );

      const insertData = getPopularKwd.ranks.map<CategoryPopularKwd>((kwd) => {
        return {
          date: dateToString(nowKrDate()),
          keyword: kwd.keyword,
          cid,
          rank: kwd.rank,
        };
      });
      const keywordArr: Keywords[] = [];

      await Promise.all(
        insertData.map(async (item) => {
          const keywordInfo =
            await context.dataSources.productsDb.keywords.findFirst({
              where: {
                keyword: item.keyword,
              },
            });

          if (keywordInfo) {
            keywordArr.push({
              keyword: item.keyword,
              isAdult: keywordInfo.isAdult,
              isSeason: keywordInfo.isSeason,
              isLowSearchVolume: keywordInfo.isLowSearchVolume,
              isRestricted: keywordInfo.isRestricted,
              isSellProhibit: keywordInfo.isSellProhibit,
            });
          } else {
            const managedKwd =
              await context.dataSources.naverAdAPI.getManagedKeyword(
                item.keyword
              );
            console.log(managedKwd[0]?.managedKeyword);
            keywordArr.push({
              keyword: item.keyword,
              isAdult: managedKwd[0]?.managedKeyword.isAdult,
              isSeason: managedKwd[0]?.managedKeyword.isSeason,
              isLowSearchVolume:
                managedKwd[0]?.managedKeyword.isLowSearchVolume,
              isRestricted: managedKwd[0]?.managedKeyword.isRestricted,
              isSellProhibit: managedKwd[0]?.managedKeyword.isSellProhibit,
            });
          }
        })
      );
      // for (let item of insertData) {
      //   const managedKwd =
      //     await context.dataSources.naverAdAPI.getManagedKeyword(item.keyword);
      //   console.log(managedKwd);
      //   keywordArr.push({
      //     keyword: item.keyword,
      //     isAdult: managedKwd[0]?.managedKeyword.isAdult,
      //     isSeason: managedKwd[0]?.managedKeyword.isSeason,
      //     isLowSearchVolume: managedKwd[0]?.managedKeyword.isLowSearchVolume,
      //     isRestricted: managedKwd[0]?.managedKeyword.isRestricted,
      //     isSellProhibit: managedKwd[0]?.managedKeyword.isSellProhibit,
      //   });
      // }

      await context.dataSources.productsDb.keywords.createMany({
        data: keywordArr,
        skipDuplicates: true,
      });

      // DB 키워드 랭킹 저장
      await context.dataSources.productsDb.categoryPopularKwd.createMany({
        data: insertData,
        skipDuplicates: true,
      });

      result = await createPopularKwdArr(
        getPopularKwd?.ranks,
        cid,
        context,
        info
      );
    }

    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}

const seePopularKwd: Resolvers<seePopularKwdResult> = async (
  _,
  { cid, keyword },
  context
) => {
  try {
    // 한달 기준
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);
    const searchDate = upDateToString(nowKrDate());
    const {
      dataSources: { productsDb: client, naverAdAPI: adApi },
    } = context;
    // 키워드 랭킹 조회
    let ranks: NaverKeywordRank[] = [];
    const dbKwdRank = await client.categoryPopularKwd.findMany({
      take: 20,
      skip: keyword ? 1 : 0,
      where: {
        date: searchDate,
        cid,
      },
      orderBy: {
        rank: "asc",
      },
      ...(keyword && {
        cursor: {
          date_keyword_cid: {
            cid,
            date: searchDate,
            keyword,
          },
        },
      }),
    });

    if (dbKwdRank && dbKwdRank.length > 0) {
      ranks = dbKwdRank.map((item) => {
        return {
          keyword: item.keyword,
          rank: item.rank,
        } as NaverKeywordRank;
      });
    } else {
      const rank = await client.categoryPopularKwd.findFirst({
        where: {
          date: searchDate,
          cid,
          keyword,
        },
      });

      let page = 0;
      if (rank) {
        page = Math.round(rank.rank / 20) + 1;
      }
      const getPopularKwd = await getRankKeywords(
        cid,
        dateToString(beforMonth),
        dateToString(beforday),
        page
      );

      ranks.push(...getPopularKwd.ranks);
      try {
        await Promise.all(
          ranks.map(async (item) => {
            const itemKeyword = item.keyword.toUpperCase();
            // keyword 등록 여부 확인
            const kwdInfo = await client.keywords.findUnique({
              where: { keyword: itemKeyword },
              select: {
                keyword: true,
              },
            });

            if (!kwdInfo) {
              // 키워드 등록 안되었을 경우.
              const managedKeyword = await adApi.getManagedKeyword(itemKeyword);

              await client.keywords.create({
                data: {
                  keyword: itemKeyword,
                  isSeason: managedKeyword.isSeason,
                  isAdult: managedKeyword.isAdult,
                  isRestricted: managedKeyword.isRestricted,
                  isLowSearchVolume: managedKeyword.isLowSearchVolume,
                },
              });
            }
          })
        );

        await client.categoryPopularKwd.createMany({
          data: ranks.map((item) => {
            const itemKeyword = item.keyword.toUpperCase();
            return {
              cid,
              date: searchDate,
              keyword: itemKeyword,
              rank: item.rank,
            };
          }),
          skipDuplicates: true,
        });
      } catch (e1) {
        console.error("insert popular kwd", e1);
      }
    }

    // const data = [] as PopularKeyword[];
    const data = await Promise.all(
      ranks.map(async (kwd) => {
        const keyword = kwd.keyword.toUpperCase();

        let product = await client.product.findUnique({
          where: {
            date_name: {
              date: searchDate,
              name: keyword,
            },
          },
          select: {
            totalSearch: true,
            totalSeller: true,
            category: true,
          },
        });

        if (product) {
          const categories = product.category as ProductCategory[];
          const categoryInfo = await getProductTopCategoryInfo(
            client,
            categories,
            cid
          );

          const item = {
            keyword: kwd.keyword,
            rank: kwd.rank,
            monthlyClickCnt: product.totalSearch,
            productCnt: product.totalSeller,
            ...categoryInfo,
          } as PopularKeyword;

          return item;
        } else {
          const addProduct = await InsertProduct(kwd.keyword, context);
          const categoryInfo = await getProductTopCategoryInfo(
            client,
            addProduct.category,
            cid
          );

          const item = {
            keyword: kwd.keyword,
            rank: kwd.rank,
            monthlyClickCnt: addProduct.totalSearch,
            productCnt: addProduct.totalSeller,
            ...categoryInfo,
          } as PopularKeyword;

          return item;
        }
      })
    );

    return {
      data,
      state: {
        ok: true,
      },
    };
  } catch (e) {
    console.error("seePopularKwd", cid, e);
    return {
      state: {
        ok: false,
        error: e.message,
      },
    };
  }
};

async function getProductTopCategoryInfo(
  client: PrismaClient,
  data: ProductCategory[],
  defaultCid: number
) {
  let itemCid = defaultCid;
  let itemCategoryName = "";
  if (data && data.length > 0) {
    const lastCategory = finalCategory(data[0]);
    itemCategoryName = lastCategory;
    const { cid: lastCid } = await client.category.findFirst({
      where: {
        name: lastCategory,
      },
      select: {
        cid: true,
      },
    });
    if (lastCid && lastCid > 0) {
      itemCid = lastCid;
    }
  }

  return {
    cid: itemCid,
    kwdCategoryName: itemCategoryName,
  };
}

const resolvers = {
  Query: {
    seePopularKwd,
  },
};

export default resolvers;
