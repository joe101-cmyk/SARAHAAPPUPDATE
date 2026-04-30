import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { validationmiddleware } from "../../middleware/validation.middleware.js";
import { localmulter } from "../../../utils/multer/local.multer.js";

const router = Router();

router.post("/signup", validationmiddleware(authValidation.signupschema), authService.signup);
router.post("/login", validationmiddleware(authValidation.loginschema), authService.login);
router.post("/refresh-token", validationmiddleware(authValidation.refreshschema), authService.refrashtoken);

export default router;