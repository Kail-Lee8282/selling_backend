import { NaverAdAPI } from "./external/api/naver/ad/NaverAdAPI";
import { NaverDataLabAPI } from "./external/api/naver/datalab/NaverDataLabAPI";
import { PrismaClient, User } from "@prisma/client";
import { BaseContext } from "@apollo/server/";
export type ContextValue = BaseContext & {
  dataSources?: {
    naverDataLabAPI: NaverDataLabAPI;
    naverAdAPI: NaverAdAPI;
    productsDb: PrismaClient;
  };
  loginUser?: User;
};

export type Resolvers<T = any> = (
  root: any,
  args: any,
  context: ContextValue,
  info: any
) => Promise<T> | T;

export type State = {
  ok: boolean;
  error?: string;
};
