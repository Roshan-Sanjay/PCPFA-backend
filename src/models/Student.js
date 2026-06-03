import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid student email']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      uppercase: true
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot be greater than 10']
    },
    skills: {
      type: [String],
      default: []
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2000, 'Graduation year is invalid']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please provide a valid phone number']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'placed', 'blocked'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

studentSchema.index({ department: 1, cgpa: -1 });
studentSchema.index({ status: 1 });

export default mongoose.model('Student', studentSchema);
