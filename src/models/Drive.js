import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema(
  {
    driveId: {
      type: String,
      required: [true, 'Drive ID is required'],
      unique: true,
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required']
    },
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Drive mode is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required']
    },
    rounds: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'cancelled', 'completed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

driveSchema.index({ company: 1 });
driveSchema.index({ status: 1 });

export default mongoose.model('Drive', driveSchema);
