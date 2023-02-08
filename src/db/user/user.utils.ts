import * as jwt from "jsonwebtoken";
import { Context } from "vm";
import client from "../../client";
import { ContextValue, Resolvers } from "../../types";

export const getUser = async (token: string) => {
  try {
    if (!token) {
      return null;
    }
    const verifiedToken: any = await jwt.verify(token, process.env.SECRET_KEY);

    if ("id" in verifiedToken) {
      const user = await client.user.findUnique({
        where: {
          id: verifiedToken["id"],
        },
      });

      if (user) {
        return user;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export function protectedResovler(ourResolver: Resolvers) {
  return function (root: any, args: any, context: ContextValue, info: any) {
    if (!context.loginUser) {
      const query = info.operation.operation === "query";
      if (query) {
        return {
          state: {
            ok: false,
            error: "Please login to perform this action",
          },
        };
      } else {
        return {
          ok: false,
          error: "Please login to perform this action",
        };
      }
    }
    return ourResolver(root, args, context, info);
  };
}

export function adminProtectedResolver(ourResolver: Resolvers) {
  return function (root: any, args: any, context: ContextValue, info: any) {
    const query = info.operation.operation === "query";
    if (!context.loginUser) {
      if (query) {
        return null;
      } else {
        return {
          ok: false,
          error: "Please login to perform this action",
        };
      }
    } else {
      if (context.loginUser.gradeCode !== "999") {
        if (query) {
          return null;
        } else {
          return {
            ok: false,
            error: "is not using",
          };
        }
      }
    }
    return ourResolver(root, args, context, info);
  };
}
