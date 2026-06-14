import { Router } from "express";
import * as messageController from "./message.service.js";
import { authentication } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/send",
    authentication(),
    messageController.sendMessage
);

router.get(
    "/",
    authentication(),
    messageController.getMessages
);

export default router;