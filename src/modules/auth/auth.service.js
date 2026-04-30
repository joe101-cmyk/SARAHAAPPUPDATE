import { model } from "mongoose";
import {
  Expire_Token,
  refrash_expire,
  refresh_Secret_Key,
  Token_Access_Key,
  CLIENT_ID
} from "../../../config/config.service.js";
import { hashEnum } from "../../../utils/enum/security.enum.js";
import { ProvideEnum } from "../../../utils/enum/user.enum.js";
import {
  badrequest,
  confilectexpetion,
  NotFoundException
} from "../../../utils/response/Error.response.js";
import { successResponse } from "../../../utils/response/sucess.response.js";
import { encrypt } from "../../../utils/security/encruption.security.js";
import { comparehash, generatehash } from "../../../utils/security/Hash.security.js";
import { generateToken, verifyToken } from "../../../utils/token/token.js";
import { findbyid, findone } from "../../DB/modules/DB.reposistry.js";
import usermodel from "../../DB/modules/user.model.js";
  import {OAuth2Client}  from'google-auth-library';
import Joi from "joi";
import { signupschema } from "./auth.validation.js";



// export const signup = async (req, res, next) => {
//   try {
//     const { firstname, lastname, email, password, Phone } = req.body;
//     const validaterules = signupschema.validate(req.body)

//     // if (await findone({ model: usermodel, filter: { email } }))
//     //   throw confilectexpetion({ message: "User Already Exists" });

//     // const encryptdata = await encrypt(Phone);
//     // const hashpassword = await generatehash({ plaintxt: password, Algo: hashEnum.Argon });

//     // const user = await usermodel.create({
//     //   firstname,
//     //   lastname,
//     //   email,
//     //   password: hashpassword,
//     //   Phone: encryptdata
//     // });

//     return successResponse({ res, statuscode: 201, message: "User Created", data: { user } });
//   } catch (error) {
//     return next(error);
//   }
// };
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
    if (!user)
      throw NotFoundException({ message: "User Not Found" });

    const isvalidpassword = await comparehash({
      plaintxt: password,
      ciphertxt: user.password,
      Algo: hashEnum.Argon
    });
    if (!isvalidpassword)
      throw badrequest({ message: "Invalid Password" });

    const accesstoken = generateToken({
      payload: { id: user.id, email: user.email },
      secretkey: Token_Access_Key,
      options: { expiresIn: Expire_Token }
    });

    const refreshtoken = generateToken({
      payload: { id: user.id, email: user.email },
      secretkey: refresh_Secret_Key,
      options: { expiresIn: refrash_expire }
    });

    return res.status(200).json({
      success: true,
      message: "Login Success",
      token: accesstoken,
      data: {
        refreshtoken,
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const refrashtoken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [Bearer, Token] = authorization?.split(" ") || [];

    if (Bearer !== "Bearer" || !Token)
      throw badrequest({ message: "Invalid Token" });

    const decoded = verifyToken({ token: Token, secretkey: refresh_Secret_Key });

    const user = await findbyid({ model: usermodel, id: decoded.id });
    if (!user)
      throw NotFoundException({ message: "User Not Found" });

    const accesstoken = generateToken({
      payload: { id: user.id, email: user.email },
      secretkey: Token_Access_Key,
      options: { expiresIn: Expire_Token }
    });

    return successResponse({
      res,
      message: "Token Refresh Success",
      data: { accesstoken },
      statuscode: 200
    });
    } catch (error) {
    return next(error);
    }
};



// async function verifygoogleaccount({idToken}) {
//     const client = new OAuth2Client()
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience:CLIENT_ID,
//     })
//     const payload = ticket.getPayload();
//     return payload;

// }




// export const loginwithgoogle = async(req,res,next)=>{ 
//     const {idToken} = req.body;
// const {email,picture,given_name,family_name,email_verified}= await verifyToken({idToken})
//   if(!email_verified)throw badrequest({message:"Not Varified"})
//     const user = findone({model:usermodel,filter:{email}});
//   if(user){
//     if(user.provider === ProvideEnum.Google){
//       const credintial = await getnewlogincredenial(!user);
//       return successResponse({
//       res,
//       message: "Token Refresh Success",
//       data: { accesstoken },
//       statuscode: 200
//     });
//     } 
//     }
//     const newuser = await create({model:usermodel,data:[{
//       firstname:given_name,
//       lastname:family_name,
//       email,
//       profillepicture:picture,
//         provider:ProvideEnum.Google,
//         }]})

 // }

  // return successResponse({
  //     res,
  //     message: "Token Refresh Success",
  //     data: { accesstoken },
  //     statuscode: 200
  //   });
    
    
  



  // const signupschema = Joi.object({
  //   firstname:Joi.string().alphanum().min(3).max(35).message({"any.required":"Firstname required",}).required(),
  //   lastname:Joi.string().alphanum().min(3).max(35).message({"any.required":"Lastname required",}).required(),
  //   email:Joi.string().email().message({"any.required":"Email required",}).required(),
  //   password:Joi.string().min(8).max(20).message({"any.required":"Password required",}).required(),
  //   Phone:Joi.string().min(10).max(15).message({"any.required":"Phone required",}).required(),

  // })