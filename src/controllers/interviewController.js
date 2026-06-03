import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterviewResult,
  deleteInterview,
  getInterviewsByApplication,
  getInterviewsByRound,
  getPendingInterviews,
} from "../services/interviewService.js";

/**
 * POST /interviews
 * Create a new scheduled interview
 * Only placement_officer/admin allowed
 * Body: { applicationId, interviewer, round, scheduledAt }
 */
export const createNewInterview = asyncHandler(async (req, res) => {
  const { applicationId, interviewer, round, scheduledAt } = req.body;

  if (!applicationId || !interviewer || !round || !scheduledAt) {
    return res.status(400).json({
      success: false,
      message:
        "Application ID, interviewer, round, and scheduled date are required",
    });
  }

  const interview = await createInterview(
    { applicationId, interviewer, round, scheduledAt },
    req.user.role,
  );

  return successResponse(
    res,
    "Interview scheduled successfully",
    interview,
    201,
  );
});

/**
 * GET /interviews
 * Get all interviews with optional filters
 */
export const listInterviews = asyncHandler(async (req, res) => {
  const { result, round, applicationId } = req.query;

  const interviews = await getAllInterviews({
    result,
    round,
    applicationId,
  });

  return successResponse(res, "Interviews retrieved successfully", {
    total: interviews.length,
    interviews,
  });
});

/**
 * GET /interviews/:id
 * Get a single interview by ID
 */
export const getInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await getInterviewById(id);

  return successResponse(res, "Interview retrieved successfully", interview);
});

/**
 * PATCH /interviews/:id
 * Update interview result
 * Body: { result }
 * Allowed results: pending, pass, fail
 */
export const updateInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { result } = req.body;

  if (!result) {
    return res.status(400).json({
      success: false,
      message: "Result is required",
    });
  }

  const interview = await updateInterviewResult(id, result);

  return successResponse(res, "Interview updated successfully", interview);
});

/**
 * DELETE /interviews/:id
 * Delete an interview
 */
export const deleteInterviewRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await deleteInterview(id);

  return successResponse(res, "Interview deleted successfully", interview);
});

/**
 * GET /interviews/application/:applicationId
 * Get interviews by application
 */
export const getInterviewsByApplicationId = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const interviews = await getInterviewsByApplication(applicationId);

  return successResponse(res, "Interviews retrieved successfully", {
    total: interviews.length,
    interviews,
  });
});

/**
 * GET /interviews/round/:round
 * Get interviews by round
 */
export const getInterviewsByRoundName = asyncHandler(async (req, res) => {
  const { round } = req.params;

  const interviews = await getInterviewsByRound(round);

  return successResponse(res, "Interviews retrieved successfully", {
    total: interviews.length,
    interviews,
  });
});

/**
 * GET /interviews/status/pending
 * Get all pending interviews
 */
export const getPendingInterviewsList = asyncHandler(async (req, res) => {
  const interviews = await getPendingInterviews();

  return successResponse(res, "Pending interviews retrieved successfully", {
    total: interviews.length,
    interviews,
  });
});
