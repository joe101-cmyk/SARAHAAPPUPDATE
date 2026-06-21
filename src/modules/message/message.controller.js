import { Router } from "express";

import * as messageController from "./message.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { sendMessageSchema } from "./message.validation.js";
import {validationmiddleware } from "../../middleware/validation.middleware.js";
const router = Router();

router.post(
    "/send",
    authentication(),
    validationmiddleware(sendMessageSchema),
    messageController.sendMessage
);
router.get(
    "/",
    authentication(),
    messageController.getMessages
);

export default router;