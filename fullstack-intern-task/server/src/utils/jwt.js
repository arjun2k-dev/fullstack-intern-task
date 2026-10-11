import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

/** Throws JsonWebTokenError / TokenExpiredError when the token is invalid. */
export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}
