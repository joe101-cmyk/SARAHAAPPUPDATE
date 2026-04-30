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