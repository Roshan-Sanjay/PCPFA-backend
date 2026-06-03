import Student from "../models/Student.js";
import { ApiError } from "../utils/errors.js";

/**
 * Get students with filtering and pagination
 * Query parameters:
 * - department: filter by department (e.g., CSE, ECE, ME)
 * - cgpaMin: filter by minimum CGPA (e.g., 8.0)
 * - cgpaMax: filter by maximum CGPA
 * - status: filter by status (active, inactive, placed, blocked)
 * - page: pagination page number (default: 1)
 * - limit: items per page (default: 10)
 */
export const getStudents = async (query) => {
  const filter = {};
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10)); // Cap at 100
  const skip = (page - 1) * limit;

  // Department filter
  if (query.department) {
    filter.department = query.department.toUpperCase();
  }

  // CGPA minimum filter
  if (query.cgpaMin) {
    const cgpaMin = parseFloat(query.cgpaMin);
    if (!isNaN(cgpaMin)) {
      filter.cgpa = { ...filter.cgpa, $gte: cgpaMin };
    }
  }

  // CGPA maximum filter
  if (query.cgpaMax) {
    const cgpaMax = parseFloat(query.cgpaMax);
    if (!isNaN(cgpaMax)) {
      filter.cgpa = { ...filter.cgpa, $lte: cgpaMax };
    }
  }

  // Status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Search by name or student ID
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { studentId: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  // Get total count for pagination metadata
  const total = await Student.countDocuments(filter);

  // Fetch paginated results
  const students = await Student.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    students,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getStudentById = async (id) => {
  const student = await Student.findOne({
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
      { studentId: id },
    ].filter((condition) => Object.values(condition)[0]),
  });

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  return student;
};
