import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByStudent,
  getApplicationsByDrive,
} from "../services/applicationService.js";

/**
 * POST /applications
 * Create a new application
 * Body: { studentId, driveId }
 */
export const createNewApplication = asyncHandler(async (req, res) => {
  const { studentId, driveId } = req.body;

  if (!studentId || !driveId) {
    return res.status(400).json({
      success: false,
      message: "Student ID and Drive ID are required",
    });
  }

  const application = await createApplication({ studentId, driveId });

  return successResponse(
    res,
    "Application created successfully",
    application,
    201,
  );
});

/**
 * GET /applications
 * Get all applications with filtering, pagination, and search
 * Query parameters:
 * - status=applied (filter by status)
 * - studentId=STU001 (filter by student ID)
 * - driveId=DRV001 (filter by drive ID)
 * - search=TechNova (search by company name, student name, or application ID)
 * - page=1 (pagination page)
 * - limit=10 (items per page)
 */
export const listApplications = asyncHandler(async (req, res) => {
  const { status, studentId, driveId, search, page, limit } = req.query;

  const result = await getAllApplications({
    status,
    studentId,
    driveId,
    search,
    page,
    limit,
  });

  return successResponse(res, "Applications retrieved successfully", result);
});

/**
 * GET /applications/:id
 * Get a single application by ID
 */
export const getApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const application = await getApplicationById(id);

  return successResponse(
    res,
    "Application retrieved successfully",
    application,
  );
});

/**
 * PATCH /applications/:id
 * Update application status
 * Body: { status }
 */
export const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  const application = await updateApplicationStatus(id, status);

  return successResponse(res, "Application updated successfully", application);
});

/**
 * DELETE /applications/:id
 * Delete an application
 */
export const deleteApplicationRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const application = await deleteApplication(id);

  return successResponse(res, "Application deleted successfully", application);
});

/**
 * GET /applications/student/:studentId
 * Get applications by student
 */
export const getApplicationsByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const applications = await getApplicationsByStudent(studentId);

  return successResponse(res, "Applications retrieved successfully", {
    total: applications.length,
    applications,
  });
});

/**
 * GET /applications/drive/:driveId
 * Get applications by drive
 */
export const getApplicationsByDriveId = asyncHandler(async (req, res) => {
  const { driveId } = req.params;

  const applications = await getApplicationsByDrive(driveId);

  return successResponse(res, "Applications retrieved successfully", {
    total: applications.length,
    applications,
  });
});
