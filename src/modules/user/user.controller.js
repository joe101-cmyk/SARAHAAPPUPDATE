import { Router } from "express";
import * as userService from "./user.service.js";
import { Roleenum, Tokentype } from "../../../utils/enum/user.enum.js";
import {
    authentication,
    authehorizion
} from "../../middleware/auth.middleware.js";
import { localmulter } from "../../../utils/multer/local.multer.js";

const router = Router();

// Get My Profile
router.get(
    "/",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    userService.getProfile
);

// Get User Profile By Id
router.get(
    "/:id",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    userService.getProfile
);

// Upload Profile Picture
router.patch(
    "/profile-picture",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    localmulter({ custompath: "users" }).single("profilePic"),
    userService.uploadProfilePicture
);

// Delete Profile Picture
router.delete(
    "/profile-picture",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    userService.deleteProfilePicture
);

// Upload Cover Pictures
// router.patch(
//     "/cover-pictures",
//     authentication({ Tokentype: Tokentype.Acess }),
//     authehorizion({
//         accessrole: [Roleenum.Admin, Roleenum.user]
//     }),
//     localmulter({ custompath: "users" }).array("coverPic", 2),
//     userService.uploadCoverPictures
// );

// Update Profile
router.patch(
    "/update-profile",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    userService.updateProfile
);

// Upload Attachment
router.patch(
    "/uploads",
    authentication({ Tokentype: Tokentype.Acess }),
    authehorizion({
        accessrole: [Roleenum.Admin, Roleenum.user]
    }),
    localmulter({ custompath: "users" }).single("attachment"),
    userService.updateProfile
);

// Freeze Account
router.patch(
    "/freeze",
    authentication({ Tokentype: Tokentype.Acess }),
    userService.freezeUser
);

// Restore Account
router.patch(
    "/unfreeze",
    authentication({ Tokentype: Tokentype.Acess }),
    userService.unfreezeUser
);

// Hard Delete Account
router.delete(
    "/hard-delete",
    authentication({ Tokentype: Tokentype.Acess }),
    userService.hardDeleteUser
);

export default router;