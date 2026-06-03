import mongoose from 'mongoose';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  return errorResponse(res, message, statusCode);
};
