import express from "express";
import {
  addDrive,
  listDrives,
  getDrive,
  patchDrive,
  removeDrive,
  getDrivesByCompanyId,
} from "../controllers/driveController.js";

const router = express.Router();

/**
 * POST /drives - Create a new drive
 */
router.post("/", addDrive);

/**
 * GET /drives - Get all drives (with filtering and pagination)
 * Query parameters:
 * - status=open
 * - company=TechNova
 * - page=1
 * - limit=10
 */
router.get("/", listDrives);

/**
 * GET /drives/:id - Get a single drive
 */
router.get("/:id", getDrive);

/**
 * PATCH /drives/:id - Update a drive
 */
router.patch("/:id", patchDrive);

/**
 * DELETE /drives/:id - Delete a drive
 */
router.delete("/:id", removeDrive);

/**
 * GET /drives/company/:companyId - Get drives by company
 */
router.get("/company/:companyId", getDrivesByCompanyId);

export default router;
