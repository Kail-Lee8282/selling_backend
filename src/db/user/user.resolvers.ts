import { Resolvers } from "../../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protectedResovler } from "./user.utils";

const createAccountFn: Resolvers = async (
  _,
  { email, password, userName, phoneNumber },
  { dataSources: { productsDb: client } }
) => {
  try {
    // 사용자 중복 체크
    const existingUser = await client.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("This email is already user");
    }

    // 패스워드 암호화
    const hashPwd = await bcrypt.hash(password, 10);

    // DB에 계정정보 저장
    await client.user.create({
      data: {
        email,
        password: hashPwd,
        userName,
        phoneNum: phoneNumber,
        gradeCode: "001",
      },
    });

    return {
      ok: true,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      error: err,
    };
  }
};

type LoginResult = {
  ok: boolean;
  error?: String;
  token?: String;
};

const login: Resolvers<LoginResult> = async (
  _,
  { email, password },
  { dataSources: { productsDb: client } }
) => {
  try {
    // 사용자 확인
    const user = await client.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // 패스워드 확인
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new Error("Incorrect password.");
    }

    // 토큰생성
    const token = await jwt.sign({ id: user.id }, process.env.SECRET_KEY);

    return {
      ok: true,
      token: token,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
    };
  }
};

const me: Resolvers = async (
  _,
  __,
  { dataSources: { productsDb: client }, loginUser }
) =>
  client.user.findUnique({
    where: {
      id: loginUser.id,
    },
    include: {
      grade: true,
    },
  });

const resolvers = {
  Mutation: {
    createAccount: createAccountFn,
    login,
  },
  Query: {
    me: protectedResovler(me),
  },
};

export default resolvers;
