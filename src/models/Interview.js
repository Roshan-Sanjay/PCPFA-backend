import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    interviewId: {
      type: String,
      required: [true, 'Interview ID is required'],
      unique: true,
      trim: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required']
    },
    applicationId: {
      type: String,
      required: [true, 'Application ID is required'],
      trim: true
    },
    interviewer: {
      type: String,
      required: [true, 'Interviewer is required'],
      trim: true
    },
    round: {
      type: String,
      required: [true, 'Round is required'],
      trim: true
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    result: {
      type: String,
      enum: ['pass', 'fail', 'pending', 'selected', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

interviewSchema.index({ application: 1 });
interviewSchema.index({ result: 1 });

export default mongoose.model('Interview', interviewSchema);
