export const successResponse = (res, message = 'Operation successful', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Error message', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
