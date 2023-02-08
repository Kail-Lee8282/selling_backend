// import { PopularityKeyword, PrismaClient } from "@prisma/client";
// import axios from "axios";
// import client from "../../../../client";
// import { ContextValue, Resolvers } from "../../../../types";
// import { fullPathCategory, getRankKeywords } from "./naver.DataLabAPI.util";
// import { NaverDataLabAPI } from "./NaverDataLabAPI";
// /**
//  * 날자 한국 포맷 변경
//  * @param date
//  * @returns
//  */
// function DateToString(date: Date) {
//   return (
//     date.getFullYear() +
//     "-" +
//     (date.getMonth() + 1).toString().padStart(2, "0") +
//     "-" +
//     date.getDate().toString().padStart(2, "0")
//   );
// }
// const findCategoryId = async (
//   category1: string,
//   category2: string,
//   category3: string,
//   category4: string,
//   client: PrismaClient
// ) => {
//   if (!category1) return -1;
//   const { cid: cate1Code } = await client.category.findFirst({
//     where: {
//       name: category1,
//     },
//     select: {
//       cid: true,
//     },
//   });
//   if (!category2) return cate1Code;
//   const { cid: cate2Code } = await client.category.findFirst({
//     where: {
//       name: category2,
//       pid: cate1Code,
//     },
//   });
//   if (!category3) return cate2Code;
//   const { cid: cate3Code } = await client.category.findFirst({
//     where: {
//       name: category3,
//       pid: cate2Code,
//     },
//   });
//   if (!category4) return cate3Code;
//   const { cid: cate4Code } = await client.category.findFirst({
//     where: {
//       name: category4,
//       pid: cate3Code,
//     },
//   });
//   return cate4Code;
// };
// const getKeywordInfo = async (
//   keyword: string,
//   naverDataLabAPI: NaverDataLabAPI
// ) => {
//   const shop = await naverDataLabAPI.getShop(keyword, 1);
//   const categoris = shop.items.filter(
//     (item, index, callback) =>
//       index ===
//       callback.findIndex(
//         (t) =>
//           fullPathCategory(
//             t.category1,
//             t.category2,
//             t.category3,
//             t.category4
//           ) ===
//           fullPathCategory(
//             item.category1,
//             item.category2,
//             item.category3,
//             item.category4
//           )
//       )
//   );
//   console.log(categoris);
//   return {
//     keyword,
//     productCount: shop.total,
//   };
// };
// const categoryPopularityKeyword: Resolvers = async (
//   _,
//   { cid },
//   { dataSources: { productsDb, naverDataLabAPI } }
// ) => {
//   try {
//     const kst = new Date();
//     //const strKstDate = DateToString(kst);
//     const yesterDay = DateToString(new Date(kst.setDate(kst.getDate() - 1)));
//     const twoDayAgo = DateToString(new Date(kst.setDate(kst.getDate() - 2)));
//     const popularity = await productsDb.popularityKeyword.findMany({
//       where: {
//         category: {
//           cid,
//         },
//         date: new Date(yesterDay),
//       },
//       select: {
//         rank: true,
//         keyword: true,
//       },
//       orderBy: {
//         rank: "asc",
//       },
//     });
//     // DB에 해당 카테고리에 대한 인기검색어 있을 경우.
//     if (popularity && popularity.length > 0) {
//       return {
//         ranks: popularity,
//         state: {
//           ok: true,
//         },
//       };
//     }
//     console.debug(`load naver rank : ${cid} , ${twoDayAgo}, ${yesterDay}`);
//     // DB 카테고리에 대한 인기 검색어 없을 경우 Naver DataLab에서 조회
//     const res = await getRankKeywords(cid, twoDayAgo, yesterDay);
//     if (res && res.data.ranks && res.data.ranks.length > 0) {
//       const ranks = res.data.ranks.map((rank) => {
//         return {
//           rank: rank.rank,
//           keyword: rank.keyword,
//         };
//       });
//       // const insertData = ranks.map((item) => {
//       //   return {
//       //     categoryCid: cid,
//       //     rank: item.rank,
//       //     keyword: item.keyword,
//       //     date: new Date(yesterDay),
//       //   };
//       // });
//       const keywords = ranks.map((rank) => rank.keyword);
//       for (var k in keywords) {
//         const keywordInfo = await getKeywordInfo(k, naverDataLabAPI);
//       }
//       console.log("end");
//       // await client.popularityKeyword.createMany({
//       //   data: insertData,
//       // });
//       return {
//         ranks,
//         state: {
//           ok: true,
//         },
//       };
//     } else {
//       return {
//         state: {
//           ok: false,
//           message: "not found data.",
//         },
//       };
//     }
//   } catch (e) {
//     console.error(e);
//     return {
//       state: {
//         ok: false,
//         error: `error : ${e.message}`,
//       },
//     };
//   }
// };
// type ProductCategory = {
//   category1?: String;
//   category2?: String;
//   category3?: String;
//   category4?: String;
//   fullPath?: string;
//   count?: number;
//   cid?: number;
// };
// type Product = {
//   keyword: String;
//   totalSeller: number;
//   productImg: String;
//   category: ProductCategory[];
// };
// // type CategoryCheck = {
// //   count?: number;
// //   category1?: string;
// //   category2?: string;
// //   category3?: string;
// //   category4?: string;
// //   fullPath?: string;
// //   cid?: number;
// // };
// /**
//  * 키워드 정보 조회
//  * @param _
//  * @param param1
//  * @param param2
//  * @returns
//  */
// const productInfo: Resolvers = async (
//   _,
//   { keyword },
//   { dataSources: { naverDataLabAPI, productsDb: client } }
// ) => {
//   try {
//     const products = await naverDataLabAPI.getShop(keyword, 100);
//     // const hiProduct = await naverDataLabAPI.getShop(
//     //   keyword,
//     //   1,
//     //   1,
//     //   "dsc",
//     //   "",
//     //   "used:rental:cbshop"
//     // );
//     // const lowProduct = await naverDataLabAPI.getShop(
//     //   keyword,
//     //   1,
//     //   1,
//     //   "asc",
//     //   "",
//     //   "used:rental:cbshop"
//     // );
//     // console.log(hiProduct);
//     // console.log(lowProduct);
//     let sortCategory = [];
//     let productImg = "";
//     if (products && products.items) {
//       productImg = products.items[0].image;
//       let hPrice = 0;
//       let lPriec = 0;
//       // 카테고리 그룹화 / 개수 체크
//       sortCategory = products.items.reduce<ProductCategory[]>((acc, curr) => {
//         //if(hPrice < curr.lprice) hPrice = curr.lprice;
//         const fullPath = fullPathCategory(
//           curr.category1,
//           curr.category2,
//           curr.category3,
//           curr.category4
//         );
//         // 이전 값에 동일 카테고리 있는지 확인
//         const findItem = acc.find((item) => item.fullPath === fullPath);
//         if (findItem) {
//           // 동일 값 있을 경우 카운팅
//           return acc.map((item) => {
//             if (item.fullPath === findItem.fullPath) {
//               item.count++;
//             }
//             return item;
//           });
//         } else {
//           // 동일 값 없을 경우 추가
//           acc.push({
//             count: 1,
//             category1: curr.category1,
//             category2: curr.category2,
//             category3: curr.category3,
//             category4: curr.category4,
//             fullPath,
//           });
//           return acc;
//         }
//       }, []);
//       // console.log(sortCategory);
//       // // 개수가 많은 아이템 선정
//       // const maxCountItem = sortCategory.reduce((max, curr) => {
//       //   if (max.count > curr.count) {
//       //     return max;
//       //   } else {
//       //     return curr;
//       //   }
//       // }, {});
//       // maxCountItem.cid = await findCategoryId(
//       //   maxCountItem.category1,
//       //   maxCountItem.category2,
//       //   maxCountItem.category3,
//       //   maxCountItem.category4,
//       //   client
//       // );
//       // selectItemInf = { ...maxCountItem };
//     }
//     const product = {
//       keyword,
//       totalSeller: products.total,
//       category: sortCategory,
//       productImg,
//     } as Product;
//     return {
//       product,
//       state: {
//         ok: true,
//       },
//     };
//   } catch (e) {
//     return {
//       state: {
//         ok: false,
//         error: e.message,
//       },
//     };
//   }
// };
// const resolvers = {
//   Query: {
//     productInfo,
//   },
// };
// export default resolvers;
