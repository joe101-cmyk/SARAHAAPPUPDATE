import { Token_Access_Key, refresh_Secret_Key } from "../../config/config.service.js";
import { Tokentype as TokenTypeEnum } from "../../utils/enum/user.enum.js";
import { badrequest, globelmiddlewarehandelar } from "../../utils/response/Error.response.js";
import { verifyToken } from "../../utils/token/token.js";
import { findbyid } from "../DB/modules/DB.reposistry.js";
import userModel from "../DB/modules/user.model.js";


export const decodetoken = async ({
  authorizon,
  tokenType = TokenTypeEnum.Access
}) => {
  const [Bearer, Token] = authorizon?.split(" ") || [];

  if (Bearer !== "Bearer" || !Token) {
    throw badrequest({ message: "Invalid Token" });
  }

  const decode = verifyToken({
    token: Token,
    secretkey: tokenType === TokenTypeEnum.Access
      ? Token_Access_Key
      : refresh_Secret_Key
  });

  const user = await findbyid({ model: userModel, id: decode.id });

  if (!user) {
    throw badrequest({ message: "Invalid Token" });
  }

  return { user, decode };
};

export const authentication = ({ tokenType = TokenTypeEnum.Access } = {}) => {
  return async (req, res, next) => {
    try {
      const { user, decode } = await decodetoken({
        authorizon: req.headers.authorization,
        tokenType
      });

      req.user = user;
      req.decode = decode;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};


export const authehorizion = ({accessrole = []} = {}) => {
  return async (req, res, next) => {
  if(!accessrole.includes(req.user.role)){
    throw badrequest({message:"un authoroize Acess"})
  };
  
};
}