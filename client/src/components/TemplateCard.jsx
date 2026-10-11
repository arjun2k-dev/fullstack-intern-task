import { useState } from 'react';
import { HeartIcon } from './icons';

// Full class names are listed literally so Tailwind can detect them at build time.
const BADGE_STYLES = {
  Dashboard: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'Landing Page': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Admin: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Billing: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CRM: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  Support: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Productivity: 'bg-teal-50 text-teal-700 ring-teal-600/20',
};
const DEFAULT_BADGE = 'bg-slate-100 text-slate-700 ring-slate-500/20';

export default function TemplateCard({ template, onToggleFavorite, pending = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { name, description, thumbnail_url: thumbnail, category, is_favorite: isFavorite } = template;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl font-bold text-indigo-400">
            {name.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={`${name} preview`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}

        <button
          type="button"
          onClick={() => onToggleFavorite(template)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${
            isFavorite ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
          } ${pending ? 'opacity-70' : ''}`}
        >
          <HeartIcon filled={isFavorite} className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span
          className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            BADGE_STYLES[category] || DEFAULT_BADGE
          }`}
        >
          {category}
        </span>
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </article>
  );
}

export function TemplateCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
      aria-hidden="true"
    >
      <div className="aspect-[16/10] bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
