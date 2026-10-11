import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      unique: true, // creates the unique index (replaces uq_users_email)
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model('User', userSchema);

/** The shape the API exposes (never includes the password hash). */
export const publicUser = (doc) => ({ id: doc.id, name: doc.name, email: doc.email });
