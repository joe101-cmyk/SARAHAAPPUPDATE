import userModel from "../../DB/modules/user.model.js";
import * as dbservice from "../../DB/modules/DB.reposistry.js";
import { successResponse } from "../../../utils/response/sucess.response.js";
import { badrequest } from "../../../utils/response/Error.response.js";
import { deleteFile } from "../../../utils/file/file.utils.js";
import { Roleenum } from "../../../utils/enum/user.enum.js";

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.params?.id || req.user._id;

        const user = await dbservice.findbyid({
            model: userModel,
            id: userId,
        });

        if (!user) {
            throw badrequest({ message: "User Not Found" });
        }

        if (req.params?.id && req.params.id !== req.user._id.toString()) {
            await dbservice.updateone({
                model: userModel,
                filter: { _id: userId },
                data: {
                    $inc: {
                        visitCount: 1,
                    },
                },
            });
        }

        let profileData = user.toObject();

        if (req.user.role !== Roleenum.Admin) {
            delete profileData.visitCount;
        }

        return successResponse({
            res,
            statusCode: 200,
            message: "done",
            data: {
                user: profileData,
            },
        });
    } catch (error) {
        next(error);
    }
};

// export const updateProfile = async (req, res) => {
//     return successResponse({
//         res,
//         statusCode: 200,
//         message: "done",
//         data: req.file,
//     });
// };

export const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            throw badrequest({
                message: "No file uploaded",
            });
        }

        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({
                message: "User Not Found",
            });
        }

        const newProfilePicPath = req.file.path.replace(/\\/g, "/");

        const updateData = {
            profilePic: newProfilePicPath,
            gallery: user.gallery || [],
        };

        if (user.profilePic) {
            updateData.gallery.push(user.profilePic);
        }

        await dbservice.updateone({
            model: userModel,
            filter: {
                _id: req.user._id,
            },
            data: updateData,
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "Profile picture uploaded successfully",
            data: {
                profilePic: newProfilePicPath,
            },
        });
    } catch (error) {
        if (req.file) {
            try {
                deleteFile(req.file.path);
            } catch (e) {
                console.error(e);
            }
        }

        next(error);
    }
};

export const deleteProfilePicture = async (req, res, next) => {
    try {
        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({
                message: "User Not Found",
            });
        }

        if (!user.profilePic) {
            throw badrequest({
                message: "No profile picture to delete",
            });
        }

        try {
            deleteFile(user.profilePic);
        } catch (error) {
            console.error(error);
        }

        await dbservice.updateone({
            model: userModel,
            filter: {
                _id: req.user._id,
            },
            data: {
                profilePic: null,
            },
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "Profile picture deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const freezeUser = async (req, res, next) => {
    try {
        await dbservice.updateone({
            model: userModel,
            filter: {
                _id: req.user._id,
            },
            data: {
                isDeleted: true,
            },
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "User Frozen Successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const unfreezeUser = async (req, res, next) => {
    try {
        await dbservice.updateone({
            model: userModel,
            filter: {
                _id: req.user._id,
            },
            data: {
                isDeleted: false,
            },
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "User Restored Successfully",
        });
    } catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({
                message: "User Not Found",
            });
        }

        await dbservice.updateone({
            model: userModel,
            filter: {
                _id: req.user._id,
            },
            data: req.body,
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "Profile Updated Successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const hardDeleteUser = async (req, res, next) => {
    try {
        await dbservice.deletebyid({
            model: userModel,
            id: req.user._id,
        });

        return successResponse({
            res,
            statusCode: 200,
            message: "User Deleted Successfully",
        });
    } catch (error) {
        next(error);
    }
};