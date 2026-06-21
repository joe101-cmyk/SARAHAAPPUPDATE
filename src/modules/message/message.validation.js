import joi from "joi";

export const sendMessageSchema = {
    body: joi.object({
        content: joi.string().required(),
        receiverId: joi.string().required()
    })
};