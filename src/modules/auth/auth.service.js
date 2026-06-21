import { v4 as uuidv4 } from "uuid";
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
  findoneandupdate,
  updateone,
} from "../../DB/modules/DB.reposistry.js";

import usermodel from "../../DB/modules/user.model.js";
import tokenmodel from "../../DB/modules/Token.js";


import { logoutTypeEnum } from "../../../utils/enum/user.enum.js";

import { GenerateOtp } from "../../../utils/OTP/generateotp.js";

import { emitter } from "../../../utils/event/event.email.js";
import { redisClient } from "../../DB/redis.connection.js";


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
    const otp = GenerateOtp();
      const hashotp = await generatehash({
      plaintxt: JSON.stringify(otp),
      Algo: hashEnum.Argon,
    });
    const user = await usermodel.create({
  firstname,
  lastname,
  email,
  password: hashpassword,
  phone: encryptdata,
  otp: hashotp,
  isVerified: false,
});
      emitter.emit("confirmEmail", {
    email,
    otp
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

    const user = await findone({
      model: usermodel,
      filter: {
        email,
        // isVerified: true,
        // isDeleted: false,
      },
    });

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




export const confirmemail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await findone({
      model: usermodel,
      filter: { email },
    });

    if (!user) {
      throw NotFoundException({
        message: "User Not Found",
      });
    }

    const isvalidotp = await comparehash({
      plaintxt: JSON.stringify(otp),
      ciphertxt: user.otp,
      Algo: hashEnum.Argon,
    });

    if (!isvalidotp) {
      throw badrequest({
        message: "Invalid OTP",
      });
    }

    await updateone({
      model: usermodel,
      filter: { email },
      data: {
        isVerified: true,
      },
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "Email Confirmed Successfully",
    });
  } catch (error) {
    return next(error);
  }
};


export const forgotpassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const otp = GenerateOtp();

    const hashotp = await generatehash({
      plaintxt: JSON.stringify(otp),
      Algo: hashEnum.Argon,
    });

    const user = await findoneandupdate({
      model: usermodel,
      filter: {
        email,
        isVerified: true,
      },
      data: {
        otp: hashotp,
      },
    });

    if (!user) {
      throw NotFoundException({
        message: "User Not Found",
      });
    }

    emitter.emit("forgotPassword", {
      email,
      otp,
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    return next(error);
  }
};


export const resetpassword = async (req, res, next) => {
  try {
    const { email, otp, newpassword } = req.body;

    const user = await findone({
      model: usermodel,
      filter: {
        email,
        isVerified: true,
      },
    });

    if (!user) {
      throw NotFoundException({
        message: "User Not Found",
      });
    }

    const isvalidotp = await comparehash({
      plaintxt: JSON.stringify(otp),
      ciphertxt: user.otp,
      Algo: hashEnum.Argon,
    });

    if (!isvalidotp) {
      throw badrequest({
        message: "Invalid OTP",
      });
    }

    const hashpassword = await generatehash({
      plaintxt: newpassword,
      Algo: hashEnum.Argon,
    });

    await findoneandupdate({
      model: usermodel,
      filter: { email },
      data: {
        password: hashpassword,
        $unset: {
          otp: 1,
        },
      },
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    return next(error);
  }
};



export const updatepassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await findone({
      model: usermodel,
      filter: { email },
    });

    if (!user) {
  throw NotFoundException({
    message: "User Not Found",
  });
}
    const isvalidpassword = await comparehash({
      plaintxt: currentPassword,
      ciphertxt: user.password,
      Algo: hashEnum.Argon,
    });
    if (!isvalidpassword) {
      throw badrequest({ message: "Invalid Current Password" });
    }
    const hashpassword = await generatehash({
      plaintxt: newPassword,
      Algo: hashEnum.Argon,
    });
    await findoneandupdate({
      model: usermodel,
      filter: { email },
      data: { password: hashpassword },
    });
    return successResponse({
      res,
      statuscode: 200,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return next(error);
  }

  }

  
export const freezeUser = async (req, res, next) => {
  try {

    await updateone({
      model: usermodel,
      filter: { _id: req.user._id },
      data: {
        isDeleted: true,
      },
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "User Frozen Successfully",
    });

  } catch (error) {
    return next(error);
  }
};


export const unfreezeUser = async (req, res, next) => {
  try {

    await updateone({
      model: usermodel,
      filter: { _id: req.user._id },
      data: {
        isDeleted: false,
      },
    });

    return successResponse({
      res,
      statuscode: 200,
      message: "User Restored Successfully",
    });

  } catch (error) {
    return next(error);
  }
};

