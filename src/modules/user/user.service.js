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


       
export const freezeUser = async (req, res, next) => {
  try {
    const user = await dbservice.findbyid({
        model: userModel,
        id: req.user._id,
    });

    if (!user) {
        throw new Error("User Not Found");
    }

    await dbservice.updateone({
        model: userModel,
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

    const user = await dbservice.findbyid({
        model: userModel,
        id: req.user._id,
    });

    if (!user) {
        throw new Error("User Not Found");
    }

    await dbservice.updateone({
        model: userModel,
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




