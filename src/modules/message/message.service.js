import { successResponse } from "../../../utils/response/sucess.response.js";
import {
    create,
    find,
    findbyid
} from "../../DB/modules/DB.reposistry.js";

import userModel from "../../DB/modules/user.model.js";
import messageModel from "../../DB/modules/message.model.js";

export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user._id; // يأتي من الـ authentication middleware
        const { receiverId, content } = req.body;

        const sender = await findbyid({
            model: userModel,
            id: senderId
        });

        const receiver = await findbyid({
            model: userModel,
            id: receiverId
        });

        if (!sender || !receiver) {
            throw new Error("User Not Found");
        }

        const message = await create({
            model: messageModel,
            data: {
                content,
                sender_Id: senderId,
                receiver_Id: receiverId
            }
        });

        return successResponse({
            res,
            statusCode: 201,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {

        const receiverId = req.user._id;

        const receiver = await findbyid({
            model: userModel,
            id: receiverId
        });

        if (!receiver) {
            throw new Error("User Not Found");
        }

        const messages = await find({
            model: messageModel,
            filter: {
                receiver_Id: receiverId
            },
            populate: [
                {
                    path: "sender_Id",
                    select: "firstname lastname email"
                }
            ]
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "Messages fetched successfully",
            data: messages
        });

    } catch (error) {
        next(error);
    }
};