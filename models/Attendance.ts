import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  member: mongoose.Types.ObjectId;
  trainer: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId | null;
  date: Date;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: String,
    },
    checkOutTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
