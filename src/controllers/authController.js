import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { getUserById, loginUser, registerUser } from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);
  return successResponse(res, 'User registered successfully', data, 201);
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  return successResponse(res, 'Login successful', data);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  return successResponse(res, 'Current user fetched successfully', { user });
});
