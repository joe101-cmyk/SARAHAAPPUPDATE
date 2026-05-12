import Joi from "joi";
import { badrequest } from "../../utils/response/Error.response.js";

export const generalfiled = {
  firstname: Joi.string().alphanum().min(3).max(35).messages({
    "any.required": "Firstname required",
  }).required(),

  lastname: Joi.string().alphanum().min(3).max(35).messages({
    "any.required": "Lastname required",
  }).required(),

  email: Joi.string().email().messages({
    "any.required": "Email required",
  }).required(),

  password: Joi.string().min(8).max(20).messages({
    "any.required": "Password required",
  }).required(),

  phone: Joi.string().min(10).max(15).messages({
    "any.required": "Phone required",
  }).required(),
};

export const validationmiddleware = (Schema) => {
  return (req, res, next) => {
    const validateError = [];

    for (const key of Object.keys(Schema)) {
      const validateresult = Schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validateresult.error) {
        validateError.push({
          key,
          details: validateresult.error.details,
        });
      }
    }

    if (validateError.length) {
      return next(
        badrequest({
          message: "Validation Error",
          details: validateError,
        })
      );
    }

    return next();
  };
};