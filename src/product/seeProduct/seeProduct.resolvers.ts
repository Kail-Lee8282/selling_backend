import { Prisma } from ".prisma/client";
import { join } from "path";
import { Worker } from "worker_threads";
import client from "../../client";
import {
  NaverKeywordTrandByType,
  NaverShop,
  NaverKeywordTrandByTypeResult,
  NaverKeywordTrandResults,
} from "../../external/api/naver/datalab/NaverDataLabAPI";
import { getProductInfo } from "../../external/api/naver/url/naver.urlRequest";
import { ContextValue, Resolvers, State } from "../../types";
import {
  CalcNowDate,
  dateToString,
  nowKrDate,
  upDateToString,
} from "../../util";
import {
  fullPathCategory,
  Product,
  ProductCategory,
  ProductChartData,
} from "../product.resolvers";

type seeProductResult = {
  state: State;
  product?: Product;
};

/**
 * 연령별 키워드 비율 반환
 * @param TrandKeyword
 * @returns
 */
function MergeTrandKeywordByGroup(
  TrandKeyword: NaverKeywordTrandByType
): ProductChartData[] {
  if (TrandKeyword.results.length > 0) {
    // 나이별로 병합
    let totalRatio = 0;
    const byAge = TrandKeyword.results[0].data.reduce<
      NaverKeywordTrandByTypeResult[]
    >((acc, curr) => {
      totalRatio += Math.round(curr.ratio);
      const selectIdx = acc.findIndex((item) => item.group === curr.group);
      if (selectIdx === -1) {
        acc.push(curr);
      } else {
        acc[selectIdx].ratio += curr.ratio;
      }

      return acc;
    }, []);

    return byAge.map((item) => {
      const ratio = Math.round((item.ratio / totalRatio) * 100);
      return {
        series: item.group,
        value: ratio,
      };
    });
  } else {
    return null;
  }
}

function createSearchVolume(
  keyword: string,
  searchCnt: number,
  results: NaverKeywordTrandResults[]
) {
  const searchVolumeByMonth: ProductChartData[] = [];
  // 24개월 serier 생성
  for (let i = 24; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);
    searchVolumeByMonth.push({
      series: `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      value: 0,
    });
  }
  try {
    const { data } = results.find((item) => item.title === keyword);

    let total_ratio = 0;
    const laster30Data = data.filter((item) => {
      if (new Date(item.period) >= new Date(CalcNowDate(0, 0, -31))) {
        total_ratio += item.ratio;
        return item;
      }
    });

    const oneRatio = searchCnt / total_ratio;

    data.forEach((item, index) => {
      const period = new Date(item.period);
      const date = `${period.getFullYear()}-${(period.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const cnt = Math.round(item.ratio);
      const find = searchVolumeByMonth?.find((aitem) => aitem.series === date);
      if (find) {
        find.value += Math.round(cnt * oneRatio);
      }
    });
  } catch (e) {
    console.error("createSearchVolume", keyword, e);
  }

  return searchVolumeByMonth;
}
/**
 * 제품 등록 및 생성
 * @param keyword
 * @param client
 * @param naverAdAPI
 * @returns
 */
export async function createSelectProductInfo(
  keyword: string,
  context: ContextValue,
  info: any
): Promise<Product> {
  try {
    const {
      dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
    } = context;
    if (!keyword || keyword.length <= 0) throw "not exist keyword";

    const date = upDateToString(nowKrDate());
    const upperKwd = keyword.toUpperCase();
    const findProduct = await client.product.findFirst({
      where: {
        date,
        name: upperKwd,
      },
      include: {
        keywordInfo: {
          select: {
            isAdult: true,
            isLowSearchVolume: true,
            isRestricted: true,
            isSeason: true,
            isSellProhibit: true,
          },
        },
      },
    });

    // DB 데이터 있을 경우
    if (findProduct) {
      console.log(findProduct.date, info.fieldName, "find", upperKwd);

      return {
        date: findProduct.date,
        name: findProduct.name,
        totalSeller: findProduct.totalSeller,
        totalSearch: findProduct.totalSearch,
        productImg: findProduct.productImg,
        loPrice: findProduct.loPrice,
        hiPrice: findProduct.hiPrice,
        avgPrice: findProduct.avgPrice,
        competitionRate: findProduct.competitionRate,
        brandPercent: findProduct.brandPercent,
        isAdult: findProduct.keywordInfo.isAdult,
        isLowSearchVolume: findProduct.keywordInfo.isLowSearchVolume,
        isRestricted: findProduct.keywordInfo.isRestricted,
        isSeason: findProduct.keywordInfo.isSeason,
        isSellProhibit: findProduct.keywordInfo.isSellProhibit,
        category: findProduct.category as ProductCategory[],
        // trandKwdByAge: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByAge
        // ),
        // trandKwdByDevice: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByDevice
        // ),
        // trandKwdByGender: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByGender
        // ),
      };
    }

    // DB 데이터 없을 경우
    // const searchVolumeByMonth: ProductChartData[] = [];
    // for (let i = 24; i >= 0; i--) {
    //   const date = CalcNowDate(0, -i, 0);
    //   searchVolumeByMonth.push({
    //     series: `${date.getFullYear()}-${(date.getMonth() + 1)
    //       .toString()
    //       .padStart(2, "0")}`,
    //     value: 0,
    //   });
    // }

    // const trandKwdByAge: ProductChartData[] = [];
    // for (let i = 1; i <= 6; i++) {
    //   trandKwdByAge.push({
    //     series: `${i * 10}`,
    //     value: 0,
    //   });
    // }
    // let KeywordTrandbyGender = [];
    // let KeywordTrandByDevice = [];

    // // 데이터 없을 경우 리턴
    // if (
    //   mergeProduct &&
    //   mergeProduct.category &&
    //   mergeProduct.category.length > 0
    // ) {
    //   const { category1 } = mergeProduct.category[0];

    //   const { cid } = await client.category.findFirst({
    //     where: {
    //       name: category1,
    //     },
    //     select: {
    //       cid: true,
    //     },
    //   });

    //   // 금일 - 한달 전
    //   const beforMonth = nowKrDate();
    //   const beforday = nowKrDate();
    //   beforMonth.setMonth(beforMonth.getMonth() - 1);
    //   beforday.setDate(beforday.getDate() - 1);

    //   // 연령별 트랜드 키워드 조회
    //   const KeywordTrandbyAge = await naverDataLabAPI.getShoppingKeywordTrand(
    //     "age",
    //     dateToString(beforMonth),
    //     dateToString(beforday),
    //     "month",
    //     cid.toString(),
    //     upperKwd
    //   );

    //   MergeTrandKeywordByGroup(KeywordTrandbyAge).forEach((item) => {
    //     const findItem = trandKwdByAge.find(
    //       (info) => info.series === item.series
    //     );
    //     if (findItem) {
    //       findItem.value = item.value;
    //     }
    //   });

    //   // 성별 트랜드 키워드 조회
    //   const searchKeywordTrandbyGender =
    //     await naverDataLabAPI.getShoppingKeywordTrand(
    //       "gender",
    //       dateToString(beforMonth),
    //       dateToString(beforday),
    //       "month",
    //       cid.toString(),
    //       upperKwd
    //     );

    //   MergeTrandKeywordByGroup(searchKeywordTrandbyGender).forEach((item) => {
    //     KeywordTrandbyGender.push({ ...item });
    //   });

    //   // 장비별 트랜드 키워드 조회
    //   const searchKeywordTrandByDevice =
    //     await naverDataLabAPI.getShoppingKeywordTrand(
    //       "device",
    //       dateToString(beforMonth),
    //       dateToString(beforday),
    //       "month",
    //       cid.toString(),
    //       upperKwd
    //     );

    //   MergeTrandKeywordByGroup(searchKeywordTrandByDevice).forEach((item) => {
    //     KeywordTrandByDevice.push({ ...item });
    //   });
    // }

    // 키워드 검색량
    // const keywordtool = relKeyword?.keywordList.find(
    //   (item) => item.relKeyword.toUpperCase() === upperKwd.toUpperCase()
    // );

    // const pcQcCnt = Number(keywordtool?.monthlyPcQcCnt);
    // const moQcCnt = Number(keywordtool?.monthlyMobileQcCnt);

    // const totalSearch =
    //   (!Number.isNaN(pcQcCnt) ? pcQcCnt : 5) +
    //   (!Number.isNaN(moQcCnt) ? moQcCnt : 5);

    // const yesterday = dateToString(CalcNowDate(0, 0, -1));

    // // 30일 데이터 조회
    // const later30totalKwdTrand =
    //   await naverDataLabAPI.getTotalKeywordTrandSearch(
    //     dateToString(CalcNowDate(0, 0, -30)),
    //     yesterday,
    //     "date",
    //     { groupName: keyword }
    //   );

    // const lastMonth = later30totalKwdTrand.results.find(
    //   (item) => item.title === keyword
    // );

    // // 전체 검색량 조회
    // const totalRatio = lastMonth.data?.reduce((acc, curr) => {
    //   acc += curr?.ratio ? curr?.ratio : 100;
    //   return acc;
    // }, 0);

    // // 어제 데이터 찾기
    // const yesterdayData = lastMonth.data?.find(
    //   (item) => item.period === yesterday
    // );

    // // 어제 검색량
    // // 데이터 없을 경우 1 처리
    // const yesterdayRatio = yesterdayData?.ratio ? yesterdayData?.ratio : 1;

    // let yesterdaySearchCnt = Math.round(
    //   (totalSearch / (totalRatio <= 0 ? 100 : totalRatio)) * yesterdayRatio
    // );

    // yesterdaySearchCnt =
    //   yesterdaySearchCnt <= 0 || Number.isNaN(yesterdaySearchCnt)
    //     ? 1
    //     : yesterdaySearchCnt;

    // // 2년치 일별 데이터 조회
    // const later2YtotalKwdTrand =
    //   await naverDataLabAPI.getTotalKeywordTrandSearch(
    //     dateToString(CalcNowDate(-2, 0, 0)),
    //     dateToString(CalcNowDate(0, 0, -1)),
    //     "date",
    //     { groupName: keyword }
    //   );

    // const last2Y = later2YtotalKwdTrand.results.find(
    //   (item) => item.title === keyword
    // );

    // // 어제 데이터 찾기
    // const lasyDayData = last2Y.data.find((item) => item.period === yesterday);
    // const lasyDayRatio = lasyDayData?.ratio ? lasyDayData?.ratio : 1;
    // const onePerSearchCnt = yesterdaySearchCnt / lasyDayRatio;

    // last2Y.data.forEach((item, index) => {
    //   const period = new Date(item.period);
    //   const date = `${period.getFullYear()}-${(period.getMonth() + 1)
    //     .toString()
    //     .padStart(2, "0")}`;
    //   const cnt = Math.round(item.ratio);
    //   const find = searchVolumeByMonth?.find((aitem) => aitem.series === date);
    //   if (find) {
    //     find.value += Math.round(cnt * onePerSearchCnt);
    //   }
    // });

    const product = await InsertProduct(keyword, context);

    return product;
  } catch (e) {
    console.error(keyword, e);
    return null;
  }
}

const t_insertProduct = new Worker(
  "./src/product/seeProduct/insert.product.worker.ts"
);

export async function InsertProduct(
  kwd: string,
  { dataSources: { naverAdAPI, naverDataLabAPI } }: ContextValue
): Promise<Product> {
  try {
    const keyword = kwd.toUpperCase();

    const date = upDateToString(nowKrDate());
    const product = await client.product.findUnique({
      where: {
        date_name: {
          date,
          name: keyword,
        },
      },
    });

    if (!product) {
      const res = await naverAdAPI.getRelKwdStat(keyword, 0, 0, 1);
      const find = res.keywordList.find((item) => item.relKeyword === keyword);
      const pcQcCnt = Number.isNaN(Number(find?.monthlyPcQcCnt))
        ? 5
        : Number(find?.monthlyPcQcCnt);
      const moQcCnt = Number.isNaN(Number(find?.monthlyMobileQcCnt))
        ? 5
        : Number(find?.monthlyMobileQcCnt);
      const DISPLAY = 100;
      const shop = await naverDataLabAPI.getShop(keyword, DISPLAY);

      const managedKwd = await naverAdAPI.getManagedKeyword(keyword);

      let lowPrice = 0;
      let hiPrice = 0;
      let totalPrice = 0;
      let brandCnt = 0;
      let categories = shop.items.reduce<ProductCategory[]>((acc, item) => {
        const curPrice = Number(item.lprice);
        // 평균가
        totalPrice += curPrice;
        //최저가
        if (lowPrice === 0 || lowPrice > curPrice) lowPrice = curPrice;
        //최고가
        if (hiPrice === 0 || hiPrice < curPrice) hiPrice = curPrice;

        // 브랜드 점유율
        if (item.brand) {
          brandCnt++;
        }

        const idx = acc.findIndex(
          (accItem) =>
            fullPathCategory(
              accItem.category1,
              accItem.category2,
              accItem.category3,
              accItem.category4
            ) ===
            fullPathCategory(
              item.category1,
              item.category2,
              item.category3,
              item.category4
            )
        );

        if (idx >= 0) {
          acc[idx].count++;
        } else {
          acc.push({
            category1: item.category1,
            category2: item.category2,
            category3: item.category3,
            category4: item.category4,
            display: shop.items.length,
            count: 1,
          });
        }
        return acc;
      }, []);

      // 정렬
      categories = categories.sort((a, b) => b.count - a.count);

      const itemCount = shop.items?.length > 0 ? shop.items.length : 0;
      const productImg = shop.items.length > 0 && shop.items[0].image;
      const avgPrice = Math.round(totalPrice / itemCount);
      const brandPercent = Math.round((brandCnt / itemCount) * 100);

      const productData = {
        totalSeller: shop.total,
        totalSearch: pcQcCnt + moQcCnt,
        loPrice: lowPrice,
        hiPrice,
        avgPrice,
        brandPercent,
        competitionRate: find.compIdx,
        productImg,
        category: categories,
      } as Product;

      const insertData = {
        keyword,
        create: {
          date,
          ...productData,
          category: categories as Prisma.JsonArray,
          keywordInfo: {
            connectOrCreate: {
              create: {
                keyword: keyword,
                isAdult: managedKwd?.isAdult,
                isSeason: managedKwd?.isSeason,
                isLowSearchVolume: managedKwd?.isLowSearchVolume,
                isRestricted: managedKwd?.isRestricted,
                isSellProhibit: managedKwd?.isSellProhibit,
              },
              where: {
                keyword: keyword,
              },
            },
          },
        },
      };

      t_insertProduct.postMessage(insertData);

      return {
        date: insertData.create.date,
        name: kwd,
        ...productData,
      };
    } else {
      return {
        date: product.date,
        name: product.name,
        totalSeller: product.totalSeller,
        totalSearch: product.totalSearch,
        productImg: product.productImg,
        loPrice: product.loPrice,
        hiPrice: product.hiPrice,
        avgPrice: product.avgPrice,
        competitionRate: product.competitionRate,
        brandPercent: product.brandPercent,
      };
    }
  } catch (e) {
    console.error("SearchNInsertProduct", kwd, e);
  }
}

const seeProduct: Resolvers<seeProductResult> = async (
  _,
  { keyword: kwd },
  context,
  info
) => {
  try {
    if (kwd.length <= 0) throw "not exist keyword";

    const keyword = (kwd as string).toUpperCase();
    // DB에 금일 검색 결과 있는지 체크
    const findProduct = await createSelectProductInfo(keyword, context, info);

    // 2년 검색량
    let searchVolume: ProductChartData[] = [];
    if (findProduct) {
      if (!findProduct.searchVolumeByMonth) {
        const before2Y = CalcNowDate(-2, 0, 0);

        // 2년치 일별 데이터 조회

        const { results } =
          await context.dataSources.naverDataLabAPI.getTotalKeywordTrandSearch(
            `${before2Y.getFullYear()}-${(before2Y.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-01`,
            upDateToString(nowKrDate()),
            "date",
            { groupName: keyword }
          );
        searchVolume = createSearchVolume(
          keyword,
          findProduct.totalSearch,
          results
        );

        await client.product.update({
          where: {
            date_name: {
              date: findProduct.date,
              name: findProduct.name,
            },
          },
          data: {
            searchVolumeByMonth: searchVolume as Prisma.JsonArray,
          },
        });
      }

      return {
        state: {
          ok: true,
        },
        product: { ...findProduct, searchVolumeByMonth: searchVolume },
      };
    }

    return {
      state: {
        ok: false,
        message: "not found data.",
      },
    };
  } catch (e) {
    console.error("seeProduct", e);
    return {
      state: {
        ok: false,
        error: e.message,
      },
    };
  }
};

const test: Resolvers = async (
  _,
  { test, cid },
  { dataSources: { productsDb: client, naverAdAPI } }
) => {
  console.log((test as string).replace(" ", ""));

  return {
    ok: true,
  };
};

const resolver = {
  Query: {
    seeProduct,
    test,
  },
};

export default resolver;
