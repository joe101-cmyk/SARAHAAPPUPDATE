import { Router } from "express";
import * as userService from "./user.service.js";
import { Roleenum, Tokentype } from "../../../utils/enum/user.enum.js";
import { authehorizion, authentication } from "../../middleware/auth.middleware.js";
import { localmulter } from "../../../utils/multer/local.multer.js";



const router = Router();
router.get("/", authentication({ Tokentype: Tokentype.Acess }),
authehorizion({accessrole:[Roleenum.Admin,Roleenum.user]})
, userService.getProfile);

router.patch("/uploads",
    // authentication({ Tokentype: Tokentype.Acess }),
    // authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    localmulter({custompath:"users"}).single("attachment"),
    userService.updateprofille
);


router.patch(
  "/unfreeze",
    authentication(),
    userService.unfreezeUser
);


router.patch(
    "/freeze",
    authentication(),
    userService.freezeUser
);



export default router;