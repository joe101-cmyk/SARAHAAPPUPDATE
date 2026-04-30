import userModel from "../../DB/modules/user.model.js";
import { successResponse } from "../../../utils/response/sucess.response.js";
import * as dbservice from "../../DB/modules/DB.reposistry.js";
import jwt from "jsonwebtoken";
import { Token_Access_Key } from "../../../config/config.service.js";
import { decrypt } from "../../../utils/security/encruption.security.js";
import { verifyToken } from "../../../utils/token/token.js";
export const getProfile = async (req, res) => {

        return successResponse({
            res,
            message: "done",
            statuscode: 200,
            data: { user: req.user } },
        )};

        export const updateprofille = async (req, res) => {

        return successResponse({
            res,
            message: "done",
            statuscode: 200,
            data: req.file,  
        },
        )};
