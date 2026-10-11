import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150, unique: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, maxlength: 50, index: true },
    // Stable display order (the seed list order), replaces relying on auto-increment ids.
    position: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Template = mongoose.model('Template', templateSchema);

/**
 * The shape the API exposes. Field names (thumbnail_url, is_favorite) are kept
 * identical to the old MySQL API so the React client needs no changes.
 */
export const toTemplateJSON = (doc, isFavorite = false) => ({
  id: String(doc._id),
  name: doc.name,
  description: doc.description,
  thumbnail_url: doc.thumbnailUrl,
  category: doc.category,
  is_favorite: isFavorite,
});
