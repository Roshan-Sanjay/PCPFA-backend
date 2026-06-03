import jwt from 'jsonwebtoken';
import User, { allowedRoles } from '../models/User.js';
import { ApiError } from '../utils/errors.js';

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError('JWT_SECRET is required', 500);
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const registerUser = async ({ name, email, password, role = 'student' }) => {
  if (!name || !email || !password) {
    throw new ApiError('Name, email and password are required', 400);
  }

  if (!allowedRoles.includes(role)) {
    throw new ApiError('Invalid role', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError('User already exists with this email', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  return {
    user: user.toSafeObject(),
    token: signToken(user._id)
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid email or password', 401);
  }

  return {
    user: user.toSafeObject(),
    token: signToken(user._id)
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return user.toSafeObject();
};
