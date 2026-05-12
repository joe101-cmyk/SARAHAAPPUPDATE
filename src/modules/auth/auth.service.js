import {
  Expire_Token,
  redis_host,
  refrash_expire,
  refresh_Secret_Key,
  Token_Access_Key,
} from "../../../config/config.service.js";

import { hashEnum } from "../../../utils/enum/security.enum.js";

import {
  badrequest,
  confilectexpetion,
  NotFoundException,
} from "../../../utils/response/Error.response.js";

import { successResponse } from "../../../utils/response/sucess.response.js";

import { encrypt } from "../../../utils/security/encruption.security.js";

import {
  comparehash,
  generatehash,
} from "../../../utils/security/Hash.security.js";

import {
  generateToken,
  verifyToken,
} from "../../../utils/token/token.js";

import {
  create,
  findbyid,
  findone,
} from "../../DB/modules/DB.reposistry.js";

import usermodel from "../../DB/modules/user.model.js";
import tokenmodel from "../../DB/modules/Token.js";

import { v4 as uuidv4 } from "uuid";
import { logoutTypeEnum } from "../../../utils/enum/user.enum.js";

export const signup = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, phone } = req.body;

    if (await findone({ model: usermodel, filter: { email } })) {
      throw confilectexpetion({ message: "User Already Exists" });
    }

    const encryptdata = await encrypt(phone);

    const hashpassword = await generatehash({
      plaintxt: password,
      Algo: hashEnum.Argon,
    });

    const user = await usermodel.create({
      firstname,
      lastname,
      email,
      password: hashpassword,
      phone: encryptdata,
    });

    return successResponse({
      res,
      statuscode: 201,
      message: "User Created",
      data: { user },
    });

  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findone({ model: usermodel, filter: { email } });

    if (!user) {
      throw NotFoundException({ message: "User Not Found" });
    }

    const isvalidpassword = await comparehash({
      plaintxt: password,
      ciphertxt: user.password,
      Algo: hashEnum.Argon,
    });

    if (!isvalidpassword) {
      throw badrequest({ message: "Invalid Password" });
    }

    const jti = uuidv4();

    const accesstoken = generateToken({
      payload: { id: user.id, email: user.email, jti },
      secretkey: Token_Access_Key,
      options: { expiresIn: Expire_Token },
    });

    const refreshtoken = generateToken({
      payload: { id: user.id, email: user.email, jti },
      secretkey: refresh_Secret_Key,
      options: { expiresIn: refrash_expire },
    });

    const decoded = verifyToken({
      token: refreshtoken,
      secretkey: refresh_Secret_Key,
    });

    await create({
      model: tokenmodel,
      data: [
        {
          jti,
          user_id: user.id,
          expiresIn: new Date(decoded.exp * 1000),
        },
      ],
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "Login Success",
      data: {
        accesstoken,
        refreshtoken,
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      },
    });

  } catch (error) {
    return next(error);
  }
};

export const refrashtoken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [Bearer, Token] = authorization?.split(" ") || [];

    if (Bearer !== "Bearer" || !Token) {
      throw badrequest({ message: "Invalid Token" });
    }

    const decoded = verifyToken({
      token: Token,
      secretkey: refresh_Secret_Key,
    });

    const tokenexist = await findone({
      model: tokenmodel,
      filter: {
        jti: decoded.jti,
        expiresIn: { $gt: new Date() },
      },
    });

    if (!tokenexist) {
      throw badrequest({ message: "Token Not Found or Expired" });
    }

    const user = await findbyid({ model: usermodel, id: decoded.id });

    if (!user) {
      throw NotFoundException({ message: "User Not Found" });
    }

    const accesstoken = generateToken({
      payload: {
        id: user.id,
        email: user.email,
        jti: decoded.jti,
      },
      secretkey: Token_Access_Key,
      options: { expiresIn: Expire_Token },
    });

    return successResponse({
      res,
      message: "Token Refresh Success",
      data: { accesstoken },
      statuscode: 200,
    });

  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [Bearer, Token] = authorization?.split(" ") || [];

    if (Bearer !== "Bearer" || !Token) {
      throw badrequest({ message: "Invalid or missing token" });
    }

    const decoded = verifyToken({
      token: Token,
      secretkey: Token_Access_Key,
    });

    const { logoutType } = req.body;

    if (logoutType === "logoutFromAll" || logoutType === "all") {
      await tokenmodel.deleteMany({ user_id: decoded.id });
    } else if (logoutType === "logoutFromCurrent" || logoutType === "current") {
      await tokenmodel.deleteOne({ jti: decoded.jti });
    } else {
      throw badrequest({
        message: "Invalid Logout Type. Allowed: 'logoutFromAll', 'logoutFromCurrent', 'all', 'current'",
      });
    }

    return successResponse({
      res,
      statuscode: 200,
      message: "Logout Success",
    });

  } catch (error) {
    return next(error);
  }
};

export const logoutwithredis = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [Bearer, Token] = authorization?.split(" ") || [];

    if (Bearer !== "Bearer" || !Token) {
      throw badrequest({ message: "Invalid or missing token" });
    }

    const decoded = verifyToken({
      token: Token,
      secretkey: Token_Access_Key,
    });

    const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);

    if (remainingTime <= 0) {
      throw badrequest({ message: "Token already expired" });
    }

    const redisClient = redis_host();
    const { logoutType } = req.body;

    if (
      logoutType === logoutTypeEnum.logoutFromAll ||
      logoutType === logoutTypeEnum.all
    ) {
      await redisClient.set(decoded.id, "logout", { EX: remainingTime });
    } else if (
      logoutType === logoutTypeEnum.logoutFromCurrent ||
      logoutType === logoutTypeEnum.current
    ) {
      await redisClient.set(decoded.jti, "logout", { EX: remainingTime });
    } else {
      throw badrequest({
        message: "Invalid Logout Type. Allowed: 'logoutFromAll', 'logoutFromCurrent', 'all', 'current'",
      });
    }

    return successResponse({
      res,
      statuscode: 200,
      message: "Logout Success",
    });

  } catch (error) {
    return next(error);
  }
};