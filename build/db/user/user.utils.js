import * as jwt from "jsonwebtoken";
import client from "../../client";
export const getUser = async (token) => {
    try {
        if (!token) {
            return null;
        }
        const verifiedToken = await jwt.verify(token, process.env.SECRET_KEY);
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
    }
    catch {
        return null;
    }
};
export function protectedResovler(ourResolver) {
    return function (root, args, context, info) {
        if (!context.loginUser) {
            const query = info.operation.operation === "query";
            if (query) {
                return {
                    state: {
                        ok: false,
                        error: "Please login to perform this action",
                    },
                };
            }
            else {
                return {
                    ok: false,
                    error: "Please login to perform this action",
                };
            }
        }
        return ourResolver(root, args, context, info);
    };
}
export function adminProtectedResolver(ourResolver) {
    return function (root, args, context, info) {
        const query = info.operation.operation === "query";
        if (!context.loginUser) {
            if (query) {
                return null;
            }
            else {
                return {
                    ok: false,
                    error: "Please login to perform this action",
                };
            }
        }
        else {
            if (context.loginUser.gradeCode !== "999") {
                if (query) {
                    return null;
                }
                else {
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
