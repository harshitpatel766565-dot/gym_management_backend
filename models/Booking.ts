import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  trainer: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;

  title: string;
  sessionType?: string;
  date: Date;
  startTime: string;
  endTime?: string;
  notes?: string;

  status: "pending" | "confirmed" | "completed" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    sessionType: {
      type: String,
      trim: true,
      default: "Personal Training",
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);

export default Booking;