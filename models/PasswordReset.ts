import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordReset extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  passwordResetSchema
);

export default PasswordReset;