const errorMiddleware = (err, req, res, next) => {
  try {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
      statusCode = 404;
      message = `Resource not found (invalid ${err.path}: ${err.value})`;
    }

    // Duplicate key (e.g. email already in use)
    if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0];
      message = field
        ? `${field} already exists.`
        : "Duplicate field value entered.";
    }

    // Mongoose validation errors
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
    }

    // JWT errors (in case they bubble up past auth middleware)
    if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token.";
    }
    if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired.";
    }

    console.error(`[${statusCode}] ${message}`, err.stack);

    res.status(statusCode).json({
      success: false,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
