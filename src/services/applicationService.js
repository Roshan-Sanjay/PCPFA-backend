import Application from "../models/Application.js";
import Student from "../models/Student.js";
import Drive from "../models/Drive.js";
import Company from "../models/Company.js";
import { ApiError } from "../utils/errors.js";

/**
 * Create a new application with workflow validation
 * Validates:
 * - Student CGPA meets company minimum CGPA
 * - Student department is eligible for the company
 * - No duplicate applications from same student for same drive
 */
export const createApplication = async (applicationData) => {
  const { studentId, driveId } = applicationData;

  // Validate student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Validate drive exists and get company details
  const drive = await Drive.findById(driveId).populate("company");
  if (!drive) {
    throw new ApiError("Drive not found", 404);
  }

  const company = await Company.findById(drive.company);
  if (!company) {
    throw new ApiError("Company not found", 404);
  }

  // Workflow Rule 1: Student CGPA must satisfy company minimum CGPA
  if (student.cgpa < company.minimumCgpa) {
    throw new ApiError(
      `Student CGPA (${student.cgpa}) does not meet company minimum CGPA (${company.minimumCgpa})`,
      400,
    );
  }

  // Workflow Rule 2: Student department must be eligible
  if (!company.eligibleDepartments.includes(student.department)) {
    throw new ApiError(
      `Student department (${student.department}) is not eligible for this drive. Eligible departments: ${company.eligibleDepartments.join(", ")}`,
      400,
    );
  }

  // Workflow Rule 3: Duplicate applications not allowed
  const existingApplication = await Application.findOne({
    student: studentId,
    drive: driveId,
  });

  if (existingApplication) {
    throw new ApiError("Student has already applied for this drive", 409);
  }

  // Generate application ID
  const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  // Create application
  const application = await Application.create({
    applicationId,
    student: studentId,
    studentId: student.studentId,
    drive: driveId,
    driveId: drive.driveId,
    currentRound: drive.rounds?.[0] || "round-1",
    appliedAt: new Date(),
    status: "applied",
  });

  return application.populate("student drive");
};

/**
 * Get all applications with filtering, pagination, and search
 * Query parameters:
 * - status: filter by application status (applied, shortlisted, rejected, selected, withdrawn)
 * - studentId: filter by student ID
 * - driveId: filter by drive ID
 * - search: search by company name, student name, or application ID
 * - page: pagination page number (default: 1)
 * - limit: items per page (default: 10)
 */
export const getAllApplications = async (filters = {}) => {
  const filter = {};
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit) || 10)); // Cap at 100
  const skip = (page - 1) * limit;

  // Status filter
  if (filters.status) {
    filter.status = filters.status;
  }

  // Student ID filter
  if (filters.studentId) {
    filter.studentId = filters.studentId;
  }

  // Drive ID filter
  if (filters.driveId) {
    filter.driveId = filters.driveId;
  }

  // Search by company name, student name, or application ID
  if (filters.search) {
    // For search, we need to do a text search across multiple fields
    // This is a simple regex search implementation
    filter.$or = [
      { applicationId: { $regex: filters.search, $options: "i" } },
      { studentId: { $regex: filters.search, $options: "i" } },
      { driveId: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Get total count for pagination metadata
  const total = await Application.countDocuments(filter);

  // Fetch paginated results with populated data
  const applications = await Application.find(filter)
    .populate({
      path: "student",
      select: "name studentId email department cgpa",
    })
    .populate({
      path: "drive",
      select: "driveId title company",
      populate: {
        path: "company",
        select: "name companyId",
      },
    })
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    applications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get application by ID
 */
export const getApplicationById = async (applicationId) => {
  const application =
    await Application.findById(applicationId).populate("student drive");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  return application;
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (applicationId, status) => {
  const validStatuses = [
    "applied",
    "shortlisted",
    "rejected",
    "selected",
    "withdrawn",
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400,
    );
  }

  const application = await Application.findByIdAndUpdate(
    applicationId,
    { status },
    { new: true, runValidators: true },
  ).populate("student drive");

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  return application;
};

/**
 * Delete application
 */
export const deleteApplication = async (applicationId) => {
  const application = await Application.findByIdAndDelete(applicationId);

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  return application;
};

/**
 * Get applications by student
 */
export const getApplicationsByStudent = async (studentId) => {
  const applications = await Application.find({ student: studentId })
    .populate("student drive")
    .lean();

  return applications;
};

/**
 * Get applications by drive
 */
export const getApplicationsByDrive = async (driveId) => {
  const applications = await Application.find({ drive: driveId })
    .populate("student drive")
    .lean();

  return applications;
};
