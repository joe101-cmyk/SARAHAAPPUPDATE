import { Router } from "express";
import * as userService from "./user.service.js";
import { Roleenum, Tokentype } from "../../../utils/enum/user.enum.js";
import { authehorizion, authentication } from "../../middleware/auth.middleware.js";
import { localmulter } from "../../../utils/multer/local.multer.js";

const router = Router();

router.get(
    "/",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    userService.getProfile
);

router.get(
    "/:id",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    userService.getProfile
);

router.patch(
    "/profile-picture",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    localmulter({ custompath: "users" }).single("profilePic"),
    userService.uploadProfilePicture
);

router.delete(
    "/profile-picture",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    userService.deleteProfilePicture
);

router.patch(
    "/cover-pictures",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({ accessrole: [Roleenum.Admin, Roleenum.user] }),
    localmulter({ custompath: "users" }).array("coverPic", 2),
    userService.uploadCoverPictures
);

router.patch(
    "/uploads",
    localmulter({ custompath: "users" }).single("attachment"),
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

router.delete(
    "/hard-delete",
    authentication(),
    userService.hardDeleteUser
);

export default router;