import jwt from "jsonwebtoken";
import {
  Expire_Token,
  Token_Access_Key,
  Token_Access_user_secret_key,
  Token_Refresh_user_secret_key,
  Token_Access_admin_secret_key,
  Token_Refresh_admin_secret_key
} from "../../config/config.service.js";
import { signtureenum } from "../enum/user.enum.js";
import { v4 as uuidv4 } from "uuid";

export const generateToken = ({
  payload,
  secretkey = Token_Access_Key,
  options = { expiresIn: Expire_Token }
}) => {
  return jwt.sign(payload, secretkey, options);
};

export const verifyToken = ({
  token,
  secretkey = Token_Access_Key
}) => {
  return jwt.verify(token, secretkey);
};

export const getsignture = ({ signturelevel = signtureenum.user }) => {
  let signture = { accesssignture: undefined, refreshsignture: undefined };

  switch (signturelevel) {
    case signtureenum.Admin:
      signture.accesssignture = Token_Access_admin_secret_key;
      signture.refreshsignture = Token_Refresh_admin_secret_key;
      break;

    case signtureenum.user:
      signture.accesssignture = Token_Access_user_secret_key;
      signture.refreshsignture = Token_Refresh_user_secret_key;
      break;

    default:
      signture.accesssignture = Token_Access_user_secret_key;
      signture.refreshsignture = Token_Refresh_user_secret_key;
  }

  return signture;
};

export const getnewlogincredenial = (user) => {
  const signture = getsignture({
    signturelevel: user.role !== "Admin" ? signtureenum.user : signtureenum.Admin
  });

  const jwtid = uuidv4();

  const accesstoken = generateToken({
    payload: { id: user.id, email: user.email },
    secretkey: signture.accesssignture,
    options: { expiresIn: Expire_Token, jwtid: jwtid },
  });

  const refreshtoken = generateToken({
    payload: { id: user.id, email: user.email },
    secretkey: signture.refreshsignture,
    options: { expiresIn: "7d", jwtid: jwtid }
  });

  return {
    accessToken: accesstoken,
    refreshToken: refreshtoken,
    jwtid: jwtid
  };
};