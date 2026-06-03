import { ApiError } from '../utils/errors.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
};
