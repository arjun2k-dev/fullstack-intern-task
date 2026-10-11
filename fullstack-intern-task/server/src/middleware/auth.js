import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

/** Rejects the request with 401 unless a valid Bearer token is supplied. */
export function requireAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return next(new AppError(401, 'Authentication required'));

  try {
    const payload = verifyToken(token);
    req.user = { id: Number(payload.sub) };
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

/** Attaches req.user when a valid token is present, but never blocks the request. */
export function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      req.user = { id: Number(verifyToken(token).sub) };
    } catch {
      // Ignore bad tokens on public endpoints; the user is simply treated as anonymous.
    }
  }
  next();
}
