import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Same guarantee as the old composite primary key (user_id, template_id): no duplicates.
favoriteSchema.index({ user: 1, template: 1 }, { unique: true });
// Speeds up "newest favorites first" for one user.
favoriteSchema.index({ user: 1, createdAt: -1 });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
