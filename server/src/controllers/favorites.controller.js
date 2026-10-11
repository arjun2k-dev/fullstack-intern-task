import { Favorite } from '../models/Favorite.js';
import { Template, toTemplateJSON } from '../models/Template.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/validators.js';

/** GET /api/favorites - the logged-in user's favorited templates, newest first. */
export const listFavorites = asyncHandler(async (req, res) => {
  const favs = await Favorite.find({ user: req.user.id })
    .sort({ createdAt: -1, _id: -1 })
    .populate('template')
    .lean();

  // A favorite whose template was deleted populates to null; skip it.
  const templates = favs
    .filter((f) => f.template)
    .map((f) => ({
      ...toTemplateJSON(f.template, true),
      favorited_at: f.createdAt,
    }));

  res.json({ count: templates.length, templates });
});

/**
 * POST /api/favorites/:templateId
 * Idempotent: 201 when newly added, 200 if it was already a favorite.
 */
export const addFavorite = asyncHandler(async (req, res) => {
  const templateId = parseId(req.params.templateId, 'Template id');

  if (!(await Template.exists({ _id: templateId }))) {
    throw new AppError(404, 'Template not found');
  }

  let created;
  try {
    const result = await Favorite.updateOne(
      { user: req.user.id, template: templateId },
      { $setOnInsert: { user: req.user.id, template: templateId } },
      { upsert: true }
    );
    created = result.upsertedCount === 1;
  } catch (err) {
    // Two simultaneous upserts can race on the unique index; the loser means "already there".
    if (err.code !== 11000) throw err;
    created = false;
  }

  res.status(created ? 201 : 200).json({
    message: created ? 'Added to favorites' : 'Already in favorites',
    templateId,
    is_favorite: true,
  });
});

/**
 * DELETE /api/favorites/:templateId
 * Idempotent: always 200 so rapid double-clicks in the UI never surface an error.
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const templateId = parseId(req.params.templateId, 'Template id');

  const result = await Favorite.deleteOne({ user: req.user.id, template: templateId });

  res.json({
    message: result.deletedCount > 0 ? 'Removed from favorites' : 'Template was not in favorites',
    templateId,
    is_favorite: false,
  });
});
