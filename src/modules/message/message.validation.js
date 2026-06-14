import joi from 'joi';
import generateValidation from '../../utils/validation.js';

const sendMessageSchema = joi.object({
    content: joi.string().required(),
    receiverId: joi.string().required()
});

body:joi.object({
    content: joi.string().required(),
    receiverId: joi.string().required()
})
