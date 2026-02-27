import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode ||
    err.status ||
    (err instanceof mongoose.Error.ValidationError ? 400 : 500);

  const payload = {
    success: false,
    message:
      err instanceof ApiError
        ? err.message
        : statusCode === 500
          ? "Internal Server Error"
          : err.message,
    data: null,
  };

  if (err instanceof mongoose.Error.ValidationError) {
    payload.details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.code === 11000) {
    payload.message = "Duplicate value detected";
    payload.details = err.keyValue;
  } else if (err instanceof ApiError && err.details) {
    payload.details = err.details;
  }

  console.error(
    JSON.stringify({
      level: "error",
      message: payload.message,
      statusCode,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?._id || null,
      timestamp: new Date().toISOString(),
    })
  );

  res.status(statusCode).json(payload);
};
