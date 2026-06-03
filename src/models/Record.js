import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    sourceId: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

recordSchema.index({ type: 1, sourceId: 1 }, { unique: true });
recordSchema.index({ type: 1 });

export default mongoose.model('Record', recordSchema);
