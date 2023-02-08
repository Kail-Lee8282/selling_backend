import { State } from "../types";

export type StoreKeywordRank = {
  id: string;
  storeName: string;
  keyword: string;
  title: string;
  isAd: boolean;
  productId: string;
  productImg: string;
  productUrl: string;
  reviewCount: number;
  purchaseCount: number;
  rank: number;
  page: number;
  index: number;
  seleStart: string;
  updatedAt: string;
};

export type StoreKeywordResult = {
  state: State;
  data?: StoreKeywordRank[];
};
