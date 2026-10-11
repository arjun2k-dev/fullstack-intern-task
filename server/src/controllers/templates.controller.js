import { Favorite } from '../models/Favorite.js';
import { Template, toTemplateJSON } from '../models/Template.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/validators.js';

// Escape regex metacharacters so user input is matched literally.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Returns the set of template ids (as strings) among `templateIds` that `userId` has favorited. */
async function favoriteIdSet(userId, templateIds) {
  if (!userId || templateIds.length === 0) return new Set();
  const favs = await Favorite.find({ user: userId, template: { $in: templateIds } })
    .select('template')
    .lean();
  return new Set(favs.map((f) => String(f.template)));
}

/**
 * GET /api/templates?search=&category=
 * Public. When a valid token is sent, each template also reports `is_favorite`.
 */
export const listTemplates = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

  const filter = {};
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: re }, { description: re }];
  }
  if (category && category.toLowerCase() !== 'all') {
    filter.category = category;
  }

  const docs = await Template.find(filter).sort({ position: 1, _id: 1 }).lean();
  const favorites = await favoriteIdSet(
    req.user?.id,
    docs.map((d) => d._id)
  );

  res.json({
    count: docs.length,
    templates: docs.map((d) => toTemplateJSON(d, favorites.has(String(d._id)))),
  });
});

/** GET /api/templates/categories */
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Template.distinct('category');
  categories.sort((a, b) => a.localeCompare(b));
  res.json({ categories });
});

/** GET /api/templates/:id */
export const getTemplate = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Template id');

  const doc = await Template.findById(id).lean();
  if (!doc) throw new AppError(404, 'Template not found');

  const favorites = await favoriteIdSet(req.user?.id, [doc._id]);
  res.json({ template: toTemplateJSON(doc, favorites.has(String(doc._id))) });
});
