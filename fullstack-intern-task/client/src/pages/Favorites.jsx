import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorInfo, isCanceled } from '../api/client';
import { favoriteService } from '../api/services';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { HeartIcon } from '../components/icons';
import TemplateGrid, { TemplateGridSkeleton } from '../components/TemplateGrid';
import useFavoriteToggle from '../hooks/useFavoriteToggle';

export default function Favorites() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    favoriteService
      .list(controller.signal)
      .then((data) => setTemplates(data.templates))
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(getErrorInfo(err).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const applyFavorite = useCallback((id, isFavorite) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, is_favorite: isFavorite } : t)));
  }, []);

  // Once the server confirms a removal, the card leaves the list
  const handleRemoved = useCallback((id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { toggle, pendingIds, error: favoriteError, clearError } = useFavoriteToggle({
    onApply: applyFavorite,
    onRemoved: handleRemoved,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Favorites</h1>
        <p className="mt-2 text-slate-600">
          {loading || error
            ? 'Templates you have saved.'
            : `You have saved ${templates.length} template${templates.length === 1 ? '' : 's'}.`}
        </p>
      </header>

      <Alert type="error" onClose={clearError}>
        {favoriteError}
      </Alert>

      {error ? (
        <div className="space-y-4">
          <Alert type="error">{error}</Alert>
          <button type="button" className="btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <TemplateGridSkeleton count={3} />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-6 w-6" />}
          title="No favorites yet"
          description="Tap the heart on any template and it will show up here."
        >
          <Link to="/templates" className="btn-primary">
            Browse templates
          </Link>
        </EmptyState>
      ) : (
        <TemplateGrid templates={templates} onToggleFavorite={toggle} pendingIds={pendingIds} />
      )}
    </div>
  );
}
