import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: [true, "Application ID is required"],
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: [true, "Drive reference is required"],
    },
    driveId: {
      type: String,
      required: [true, "Drive ID is required"],
      trim: true,
    },
    currentRound: {
      type: String,
      required: [true, "Current round is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected", "withdrawn"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      required: [true, "Applied date is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Ensure no duplicate applications per student per drive
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ studentId: 1 });
applicationSchema.index({ driveId: 1 });

export default mongoose.model("Application", applicationSchema);
