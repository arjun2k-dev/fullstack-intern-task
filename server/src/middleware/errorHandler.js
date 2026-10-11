import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // body-parser errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON in request body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  // MongoDB duplicate-key error (E11000), e.g. two simultaneous registrations
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  // Mongoose rejected a malformed value (e.g. an invalid ObjectId) or failed schema validation
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  console.error(err);
  return res.status(500).json({
    message: 'Internal server error',
    ...(!env.isProd && { detail: err.message }),
  });
}
