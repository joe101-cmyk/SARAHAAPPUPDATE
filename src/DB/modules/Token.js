import mongoose from "mongoose";

const Tokenschema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    expiresIn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

Tokenschema.index(
  { expiresIn: 1 },
  { expireAfterSeconds: 0 }
);

const Tokenmodel = mongoose.model("Token", Tokenschema);

export default Tokenmodel;