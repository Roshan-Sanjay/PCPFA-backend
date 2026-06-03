import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getDrivesByCompany,
} from "../services/driveService.js";

/**
 * POST /drives
 * Create a new drive
 */
export const addDrive = asyncHandler(async (req, res) => {
  const drive = await createDrive(req.body);
  return successResponse(res, "Drive created successfully", drive, 201);
});

/**
 * GET /drives
 * List drives with filtering and pagination
 * Query parameters:
 * - status=open (filter by status: open, closed, cancelled, completed)
 * - company=TechNova (filter by company name)
 * - companyId=COMP001 (filter by company ID)
 * - search=Software (search by title or company name)
 * - page=1 (pagination page)
 * - limit=10 (items per page)
 */
export const listDrives = asyncHandler(async (req, res) => {
  const result = await getDrives(req.query);
  return successResponse(res, "Drives fetched successfully", result);
});

/**
 * GET /drives/:id
 * Get a single drive
 */
export const getDrive = asyncHandler(async (req, res) => {
  const drive = await getDriveById(req.params.id);
  return successResponse(res, "Drive fetched successfully", drive);
});

/**
 * PATCH /drives/:id
 * Update a drive
 */
export const patchDrive = asyncHandler(async (req, res) => {
  const drive = await updateDrive(req.params.id, req.body);
  return successResponse(res, "Drive updated successfully", drive);
});

/**
 * DELETE /drives/:id
 * Delete a drive
 */
export const removeDrive = asyncHandler(async (req, res) => {
  const drive = await deleteDrive(req.params.id);
  return successResponse(res, "Drive deleted successfully", drive);
});

/**
 * GET /drives/company/:companyId
 * Get all drives for a specific company
 */
export const getDrivesByCompanyId = asyncHandler(async (req, res) => {
  const drives = await getDrivesByCompany(req.params.companyId);
  return successResponse(res, "Drives fetched successfully", {
    total: drives.length,
    drives,
  });
});
