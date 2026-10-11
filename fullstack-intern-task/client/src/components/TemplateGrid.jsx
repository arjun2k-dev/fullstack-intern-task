import TemplateCard, { TemplateCardSkeleton } from './TemplateCard';

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

export function TemplateGridSkeleton({ count = 6 }) {
  return (
    <div className={GRID} role="status" aria-label="Loading templates">
      {Array.from({ length: count }, (_, index) => (
        <TemplateCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function TemplateGrid({ templates, onToggleFavorite, pendingIds, dimmed = false }) {
  return (
    <div className={`${GRID} transition-opacity ${dimmed ? 'opacity-60' : 'opacity-100'}`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onToggleFavorite={onToggleFavorite}
          pending={pendingIds.has(template.id)}
        />
      ))}
    </div>
  );
}
