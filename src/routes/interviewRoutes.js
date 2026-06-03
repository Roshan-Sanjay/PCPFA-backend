import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createNewInterview,
  listInterviews,
  getInterview,
  updateInterview,
  deleteInterviewRecord,
  getInterviewsByApplicationId,
  getInterviewsByRoundName,
  getPendingInterviewsList,
} from "../controllers/interviewController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * POST /interviews - Create a new interview
 * Protected: Yes (placement_officer/admin only)
 */
router.post("/", authorize("placement_officer", "admin"), createNewInterview);

/**
 * GET /interviews - Get all interviews (with optional filters)
 * Protected: Yes
 */
router.get("/", listInterviews);

/**
 * GET /interviews/status/pending - Get pending interviews
 * Protected: Yes
 * Note: Must be before /:id to avoid route conflicts
 */
router.get("/status/pending", getPendingInterviewsList);

/**
 * GET /interviews/:id - Get a single interview
 * Protected: Yes
 */
router.get("/:id", getInterview);

/**
 * PATCH /interviews/:id - Update interview result
 * Protected: Yes
 */
router.patch("/:id", updateInterview);

/**
 * DELETE /interviews/:id - Delete an interview
 * Protected: Yes
 */
router.delete("/:id", deleteInterviewRecord);

/**
 * GET /interviews/application/:applicationId - Get interviews by application
 * Protected: Yes
 */
router.get("/application/:applicationId", getInterviewsByApplicationId);

/**
 * GET /interviews/round/:round - Get interviews by round
 * Protected: Yes
 */
router.get("/round/:round", getInterviewsByRoundName);

export default router;
