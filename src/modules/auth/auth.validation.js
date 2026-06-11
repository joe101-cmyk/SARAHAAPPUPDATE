import Joi from "joi";
import { generalfiled } from "../../middleware/validation.middleware.js";

export const signupschema = {
  body: Joi.object({
    firstname: generalfiled.firstname,
    lastname: generalfiled.lastname,
    email: generalfiled.email,
    password: generalfiled.password,
    phone: generalfiled.phone,
  }),
};

export const loginschema = {
  body: Joi.object({
    email: generalfiled.email,
    password: generalfiled.password,
  }),
};

export const refreshschema = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }),
};

export const logoutschema = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }),
  body: Joi.object({
    logoutType: Joi.string().valid("logoutFromAll", "logoutFromCurrent", "all", "current").required(),
  }),
};


export const resetpasswordschema = {
  body: Joi.object({
    email: generalfiled.email,
    newPassword: generalfiled.password,
    confirmPassword: generalfiled.password,
    token: Joi.string().required(),
  }),
};