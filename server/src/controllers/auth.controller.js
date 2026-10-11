import bcrypt from 'bcryptjs';
import { User, publicUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { validateLogin, validateRegister } from '../utils/validators.js';

const SALT_ROUNDS = 12;

// Compared against when the email is unknown, so response time does not reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

const emailTaken = () =>
  new AppError(409, 'An account with this email already exists', {
    email: 'Email is already registered',
  });

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegister(req.body);

  if (await User.exists({ email })) throw emailTaken();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let created;
  try {
    created = await User.create({ name, email, passwordHash });
  } catch (err) {
    // Unique-index race: two simultaneous registrations with the same email
    if (err.code === 11000) throw emailTaken();
    throw err;
  }

  const user = publicUser(created);
  res.status(201).json({
    message: 'Registration successful',
    user,
    token: signToken(user.id),
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);

  const found = await User.findOne({ email });

  const passwordMatches = await bcrypt.compare(password, found ? found.passwordHash : DUMMY_HASH);
  if (!found || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  res.json({
    message: 'Login successful',
    user: publicUser(found),
    token: signToken(found.id),
  });
});

/** GET /api/auth/me - lets the client restore a session from a stored token. */
export const me = asyncHandler(async (req, res) => {
  const found = await User.findById(req.user.id);
  if (!found) {
    throw new AppError(401, 'User no longer exists');
  }
  res.json({ user: publicUser(found) });
});
