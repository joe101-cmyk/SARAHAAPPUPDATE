import mongoose from "mongoose";
import { gendernum, ProvideEnum, Roleenum } from "../../../utils/enum/user.enum.js";

const usersmodel = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Enter First name require"],
      minlength: 2,
      maxlength: 25,
    },

    lastname: {
      type: String,
      required: [true, "Enter Last name require"],
      minlength: 2,
      maxlength: 25,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === ProvideEnum.system;
      },
    },

    DOB: Date,

    phone: String,

    role: {
      type: Number,
      enum: Object.values(Roleenum),
      default: Roleenum.user,
    },

    gender: {
      type: Number,
      enum: Object.values(gendernum),
      default: gendernum.Male,
    },

    provider: {
      type: Number,
      enum: Object.values(ProvideEnum),
      default: ProvideEnum.system,
    },

    otp: String,

    isVerified: {
      type: Boolean,
      default: false,
    },
    
isDeleted: {
  type: Boolean,
  default: false,
},



    profilepublic: String,

    changeTimecredintals: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

usersmodel.virtual("usermodel")
  .set(function (value) {
    const [firstname, lastname] = value.split(" ") || [];
    this.set({ firstname, lastname });
  })
  .get(function () {
    return `${this.firstname} ${this.lastname}`;
  });

export default mongoose.model("users", usersmodel);