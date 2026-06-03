import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createNewApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplicationRecord,
  getApplicationsByStudentId,
  getApplicationsByDriveId,
} from "../controllers/applicationController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * POST /applications - Create a new application
 * Protected: Yes
 */
router.post("/", createNewApplication);

/**
 * GET /applications - Get all applications (with optional filters)
 * Protected: Yes
 */
router.get("/", listApplications);

/**
 * GET /applications/:id - Get a single application
 * Protected: Yes
 */
router.get("/:id", getApplication);

/**
 * PATCH /applications/:id - Update application status
 * Protected: Yes
 */
router.patch("/:id", updateApplication);

/**
 * DELETE /applications/:id - Delete an application
 * Protected: Yes
 */
router.delete("/:id", deleteApplicationRecord);

/**
 * GET /applications/student/:studentId - Get applications by student
 * Protected: Yes
 */
router.get("/student/:studentId", getApplicationsByStudentId);

/**
 * GET /applications/drive/:driveId - Get applications by drive
 * Protected: Yes
 */
router.get("/drive/:driveId", getApplicationsByDriveId);

export default router;
