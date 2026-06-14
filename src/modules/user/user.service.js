import userModel from "../../DB/modules/user.model.js";
import { successResponse } from "../../../utils/response/sucess.response.js";
import * as dbservice from "../../DB/modules/DB.reposistry.js";
import jwt from "jsonwebtoken";
import { Token_Access_Key } from "../../../config/config.service.js";
import { decrypt } from "../../../utils/security/encruption.security.js";
import { verifyToken } from "../../../utils/token/token.js";
import { deleteFile, getUploadPath } from "../../../utils/file/file.utils.js";
import { badrequest, ErrorResponse } from "../../../utils/response/Error.response.js";
import path from "path";
import { Roleenum } from "../../../utils/enum/user.enum.js";

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.params?.id || req.user._id;
        
        let query = dbservice.findbyid({
            model: userModel,
            id: userId,
        });

        const user = await query;

        if (!user) {
            throw badrequest({ message: "User Not Found" });
        }

        // If requesting another user's profile, increment visitCount
        if (req.params?.id && req.params.id !== req.user._id.toString()) {
            await dbservice.updateone({
                model: userModel,
                filter: { _id: userId },
                data: { $inc: { visitCount: 1 } },
            });
        }

        // Remove visitCount from response for non-admin users
        let profileData = user.toObject ? user.toObject() : user;
        if (req.user.role !== Roleenum.Admin) {
            delete profileData.visitCount;
        }

        return successResponse({
            res,
            message: "done",
            statuscode: 200,
            data: { user: profileData },
        });
    } catch (error) {
        return next(error);
    }
};

export const updateprofille = async (req, res) => {
    return successResponse({
        res,
        message: "done",
        statuscode: 200,
        data: req.file,  
    });
};

export const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            throw badrequest({ message: "No file uploaded" });
        }

        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({ message: "User Not Found" });
        }

        const newProfilePicPath = req.file.path.replace(/\\/g, "/");

        let updateData = {
            profilePic: newProfilePicPath,
        };

        // If user has existing profile picture, move it to gallery
        if (user.profilePic) {
            if (!updateData.gallery) {
                updateData.gallery = user.gallery || [];
            }
            updateData.gallery.push(user.profilePic);
        }

        await dbservice.updateone({
            model: userModel,
            filter: { _id: req.user._id },
            data: updateData,
        });

        return successResponse({
            res,
            message: "Profile picture uploaded successfully",
            statuscode: 200,
            data: {
                profilePic: newProfilePicPath,
            },
        });
    } catch (error) {
        // Delete uploaded file if error occurs
        if (req.file) {
            try {
                deleteFile(req.file.path);
            } catch (e) {
                console.error("Error deleting uploaded file:", e);
            }
        }
        return next(error);
    }
};

export const deleteProfilePicture = async (req, res, next) => {
    try {
        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({ message: "User Not Found" });
        }

        if (!user.profilePic) {
            throw badrequest({ message: "No profile picture to delete" });
        }

        // Delete file from disk
        try {
            deleteFile(user.profilePic);
        } catch (error) {
            console.error("Error deleting file from disk:", error);
        }

        // Remove profilePic from database
        await dbservice.updateone({
            model: userModel,
            filter: { _id: req.user._id },
            data: {
                profilePic: null,
            },
        });

        return successResponse({
            res,
            message: "Profile picture deleted successfully",
            statuscode: 200,
            data: {},
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadCoverPictures = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw badrequest({ message: "No files uploaded" });
        }

        const user = await dbservice.findbyid({
            model: userModel,
            id: req.user._id,
        });

        if (!user) {
            throw badrequest({ message: "User Not Found" });
        }

        const existingCount = user.coverPic?.length || 0;
        const uploadedCount = req.files.length;
        const totalCount = existingCount + uploadedCount;

        
        if (totalCount !== 2) {
            
            if (req.files) {
                req.files.forEach(file => {
                    try {
                        deleteFile(file.path);
                    } catch (e) {
                        console.error("Error deleting file:", e);
                    }
                });
            }

            throw badrequest({
                message: `Invalid cover picture count. Existing: ${existingCount}, Uploaded: ${uploadedCount}, Total: ${totalCount}. Total must equal 2.`,
                extra: {
                    existingCount,
                    uploadedCount,
                    totalCount,
                }
            });
        }

        const newCoverPics = req.files.map(file => file.path.replace(/\\/g, "/"));
        const updatedCoverPics = [...(user.coverPic || []), ...newCoverPics];

        await dbservice.updateone({
            model: userModel,
            filter: { _id: req.user._id },
            data: {
                coverPic: updatedCoverPics,
            },
        });

        return successResponse({
            res,
            message: "Cover pictures uploaded successfully",
            statuscode: 200,
            data: {
                coverPic: updatedCoverPics,
                count: updatedCoverPics.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const freezeUser = async (req, res, next) => {
    try {
    const user = await dbservice.findbyid({
        model: userModel,
        id: req.user._id,
    });

    if (!user) {
        throw new Error("User Not Found");
    }

    await dbservice.updateone({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
        isDeleted: true,
        },
    });

    return successResponse({
        res,
        statuscode: 200,
        message: "User Frozen Successfully",
    });
    } catch (error) {
    return next(error);
    }
};

export const unfreezeUser = async (req, res, next) => {
    try {

    const user = await dbservice.findbyid({
        model: userModel,
        id: req.user._id,
    });

    if (!user) {
        throw new Error("User Not Found");
    }

    await dbservice.updateone({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
        isDeleted: false,
        },
    });

    return successResponse({
        res,
        statuscode: 200,
        message: "User Restored Successfully",
    });

    } catch (error) {
    return next(error);
    }
};

export const hardDeleteUser = async (req, res, next) => {
    try {

    const user = await dbservice.deletebyid({
        model: usermodel,
        id: req.user._id,
    });

    return successResponse({
        res,
        statuscode: 200,
        message: "User Deleted Successfully",
    });

    } catch (error) {
    return next(error);
    }
};



