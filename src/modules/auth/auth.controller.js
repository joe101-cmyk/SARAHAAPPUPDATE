import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { validationmiddleware } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", validationmiddleware(authValidation.signupschema), authService.signup);
router.post("/login", validationmiddleware(authValidation.loginschema), authService.login);
router.post("/refresh-token", validationmiddleware(authValidation.refreshschema), authService.refrashtoken);
router.post("/logout", authentication(), authService.logout);
    router.post("/logout-redis", authentication(), authService.logoutwithredis);
    router.post("/forgot-password", validationmiddleware(authValidation.forgotpasswordschema), authService.forgotpassword);
    router.post("/reset-password", validationmiddleware(authValidation.resetpasswordschema), authService.resetpassword);
router.patch("/update-password", authentication(), authService.updatepassword);
// router.post(
// "/confirm-email",
// validationmiddleware(authVa),
// authService.confirmemail
// );

router.patch(
"/freeze-user",
authentication(),
authService.freezeUser
);

router.patch(
"/unfreeze-user",
authentication(),
authService.unfreezeUser
);



    export default router;



