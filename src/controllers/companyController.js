import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "../services/companyService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

export const addCompany = asyncHandler(async (req, res) => {
  const company = await createCompany(req.body);
  return successResponse(res, "Company created successfully", { company }, 201);
});

export const listCompanies = asyncHandler(async (req, res) => {
  const result = await getCompanies(req.query);
  return successResponse(res, "Companies fetched successfully", result);
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await getCompanyById(req.params.id);
  return successResponse(res, "Company fetched successfully", { company });
});

export const patchCompany = asyncHandler(async (req, res) => {
  const company = await updateCompany(req.params.id, req.body);
  return successResponse(res, "Company updated successfully", { company });
});

export const removeCompany = asyncHandler(async (req, res) => {
  const company = await deleteCompany(req.params.id);
  return successResponse(res, "Company deleted successfully", { company });
});
