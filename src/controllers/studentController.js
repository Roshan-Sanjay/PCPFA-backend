import { getStudentById, getStudents } from "../services/studentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

export const listStudents = asyncHandler(async (req, res) => {
  const result = await getStudents(req.query);
  return successResponse(res, "Students fetched successfully", result);
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await getStudentById(req.params.id);
  return successResponse(res, "Student fetched successfully", { student });
});
