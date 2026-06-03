import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('Authorization token is required', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError('User linked to this token no longer exists', 401);
  }

  req.user = user.toSafeObject();
  return next();
});

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to access this resource', 403));
    }

    return next();
  };
};
