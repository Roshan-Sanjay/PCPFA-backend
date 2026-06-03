import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    package: {
      type: Number,
      required: [true, 'Package is required'],
      min: [0, 'Package cannot be negative']
    },
    eligibleDepartments: {
      type: [String],
      required: [true, 'Eligible departments are required'],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one eligible department is required'
      }
    },
    minimumCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: [0, 'Minimum CGPA cannot be less than 0'],
      max: [10, 'Minimum CGPA cannot be greater than 10']
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required']
    },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'open', 'closed', 'cancelled', 'completed'],
      default: 'upcoming'
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ status: 1 });
companySchema.index({ eligibleDepartments: 1 });
companySchema.index({ driveDate: 1 });

export default mongoose.model('Company', companySchema);
