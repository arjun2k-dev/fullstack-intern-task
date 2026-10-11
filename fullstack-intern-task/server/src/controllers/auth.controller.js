import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { validateLogin, validateRegister } from '../utils/validators.js';

const SALT_ROUNDS = 12;

// Compared against when the email is unknown, so response time does not reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

const publicUser = (row) => ({ id: row.id, name: row.name, email: row.email });

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegister(req.body);

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new AppError(409, 'An account with this email already exists', {
      email: 'Email is already registered',
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  const user = { id: result.insertId, name, email };
  res.status(201).json({
    message: 'Registration successful',
    user,
    token: signToken(user.id),
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);

  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    [email]
  );
  const row = rows[0];

  const passwordMatches = await bcrypt.compare(password, row ? row.password_hash : DUMMY_HASH);
  if (!row || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  res.json({
    message: 'Login successful',
    user: publicUser(row),
    token: signToken(row.id),
  });
});

/** GET /api/auth/me - lets the client restore a session from a stored token. */
export const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [
    req.user.id,
  ]);
  if (rows.length === 0) {
    throw new AppError(401, 'User no longer exists');
  }
  res.json({ user: publicUser(rows[0]) });
});
