import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import { ApiError } from "../utils/errors.js";

/**
 * Create a scheduled interview
 * Workflow Rules:
 * - Only placement_officer/admin is allowed to create
 * - Application must exist
 * - Interview date must be valid (future date)
 * - Rejected applications cannot receive interviews
 */
export const createInterview = async (interviewData, userRole) => {
  const { applicationId, interviewer, round, scheduledAt } = interviewData;

  // Validate user role (should be done in controller, but double-check here)
  if (!["placement_officer", "admin"].includes(userRole)) {
    throw new ApiError(
      "Only placement officer or admin can schedule interviews",
      403,
    );
  }

  // Validate application exists
  const application =
    await Application.findById(applicationId).populate("student drive");
  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  // Workflow Rule: Rejected applications cannot receive interviews
  if (application.status === "rejected") {
    throw new ApiError(
      "Cannot schedule interview for rejected application",
      400,
    );
  }

  // Workflow Rule: Interview date must be valid (future date)
  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    throw new ApiError("Interview date must be in the future", 400);
  }

  // Generate interview ID
  const interviewId = `INT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  // Create interview
  const interview = await Interview.create({
    interviewId,
    application: applicationId,
    applicationId: application.applicationId,
    interviewer,
    round,
    scheduledAt: scheduledDate,
    result: "pending",
  });

  return interview.populate("application");
};

/**
 * Get all interviews with optional filtering
 */
export const getAllInterviews = async (filters = {}) => {
  const query = Interview.find().populate("application");

  if (filters.result) {
    query.where("result", filters.result);
  }

  if (filters.round) {
    query.where("round", filters.round);
  }

  if (filters.applicationId) {
    query.where("applicationId", filters.applicationId);
  }

  const interviews = await query.lean();
  return interviews;
};

/**
 * Get interview by ID
 */
export const getInterviewById = async (interviewId) => {
  const interview =
    await Interview.findById(interviewId).populate("application");

  if (!interview) {
    throw new ApiError("Interview not found", 404);
  }

  return interview;
};

/**
 * Update interview result
 * Allowed results: pending, pass, fail
 * Workflow Rules:
 * - Rejected application cannot receive interviews
 * - Selected candidates cannot be rescheduled
 */
export const updateInterviewResult = async (interviewId, result) => {
  const validResults = ["pending", "pass", "fail"];

  if (!validResults.includes(result)) {
    throw new ApiError(
      `Invalid result. Must be one of: ${validResults.join(", ")}`,
      400,
    );
  }

  const interview =
    await Interview.findById(interviewId).populate("application");

  if (!interview) {
    throw new ApiError("Interview not found", 404);
  }

  const application = interview.application;

  // Workflow Rule: Rejected application cannot receive interviews
  if (application.status === "rejected") {
    throw new ApiError("Cannot update interview for rejected application", 400);
  }

  // Workflow Rule: Selected candidates cannot be rescheduled
  if (application.status === "selected" && result === "pending") {
    throw new ApiError(
      "Selected candidates cannot have interview result changed to pending",
      400,
    );
  }

  // Update interview
  interview.result = result;
  await interview.save();

  return interview.populate("application");
};

/**
 * Delete interview
 */
export const deleteInterview = async (interviewId) => {
  const interview = await Interview.findByIdAndDelete(interviewId);

  if (!interview) {
    throw new ApiError("Interview not found", 404);
  }

  return interview;
};

/**
 * Get interviews by application
 */
export const getInterviewsByApplication = async (applicationId) => {
  const interviews = await Interview.find({ application: applicationId })
    .populate("application")
    .lean();

  return interviews;
};

/**
 * Get interviews by round
 */
export const getInterviewsByRound = async (round) => {
  const interviews = await Interview.find({ round })
    .populate("application")
    .lean();

  return interviews;
};

/**
 * Get pending interviews
 */
export const getPendingInterviews = async () => {
  const interviews = await Interview.find({ result: "pending" })
    .populate("application")
    .lean();

  return interviews;
};
