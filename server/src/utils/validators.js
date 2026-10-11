import { AppError } from './AppError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

function failIfInvalid(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(400, 'Validation failed', errors);
  }
}

export function validateRegister(body = {}) {
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (name.length < 2 || name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters';
  }
  if (!EMAIL_RE.test(email) || email.length > 255) {
    errors.email = 'Please provide a valid email address';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (password.length > 72) {
    // bcrypt silently truncates beyond 72 bytes, so reject instead
    errors.password = 'Password must be at most 72 characters';
  }

  failIfInvalid(errors);
  return { name, email, password };
}

export function validateLogin(body = {}) {
  const email = asTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (!EMAIL_RE.test(email)) errors.email = 'Please provide a valid email address';
  if (!password) errors.password = 'Password is required';

  failIfInvalid(errors);
  return { email, password };
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Returns true for a 24-character hex MongoDB ObjectId string. */
export const isObjectId = (value) => OBJECT_ID_RE.test(String(value));

/** Validates a MongoDB ObjectId route param or throws 400. */
export function parseId(value, label = 'id') {
  if (!isObjectId(value)) {
    throw new AppError(400, `${label} is not a valid id`);
  }
  return String(value);
}
