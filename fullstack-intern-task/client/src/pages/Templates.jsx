import { useCallback, useEffect, useState } from 'react';
import { getErrorInfo, isCanceled } from '../api/client';
import { templateService } from '../api/services';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { SearchIcon } from '../components/icons';
import TemplateGrid, { TemplateGridSkeleton } from '../components/TemplateGrid';
import { useAuth } from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';
import useFavoriteToggle from '../hooks/useFavoriteToggle';

export default function Templates() {
  const { user } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounce(search.trim(), 300);

  // Category options for the dropdown (loaded once)
  useEffect(() => {
    templateService
      .categories()
      .then((data) => setCategories(data.categories))
      .catch(() => {
        /* the filter simply stays empty; the main list reports its own errors */
      });
  }, []);

  // Fetch whenever the filters change. Re-runs on login/logout so heart state stays accurate.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    templateService
      .list(
        {
          search: debouncedSearch || undefined,
          category: category !== 'All' ? category : undefined,
        },
        controller.signal
      )
      .then((data) => setTemplates(data.templates))
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(getErrorInfo(err).message);
      })
      .finally(() => {
        // An aborted request means a newer one is already running
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, category, user?.id, reloadKey]);

  const applyFavorite = useCallback((id, isFavorite) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, is_favorite: isFavorite } : t)));
  }, []);

  const { toggle, pendingIds, error: favoriteError, clearError } = useFavoriteToggle({
    onApply: applyFavorite,
  });

  const filtersActive = search.trim() !== '' || category !== 'All';
  const clearFilters = () => {
    setSearch('');
    setCategory('All');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Template Store</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          Production-ready SaaS templates for dashboards, landing pages, billing and more. Heart the
          ones you like and find them again in your favorites.
        </p>
      </section>

      <section aria-label="Search and filter" className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates by name or description..."
            aria-label="Search templates"
            className="input pl-11"
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
          className="input sm:w-56"
        >
          <option value="All">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </section>

      <Alert type="error" onClose={clearError}>
        {favoriteError}
      </Alert>

      <section aria-live="polite">
        {!error && (
          <p className="mb-4 text-sm text-slate-500">
            {loading && templates.length === 0
              ? 'Loading templates...'
              : `${templates.length} template${templates.length === 1 ? '' : 's'}${
                  filtersActive ? ' match your filters' : ''
                }`}
          </p>
        )}

        {error ? (
          <div className="space-y-4">
            <Alert type="error">{error}</Alert>
            <button type="button" className="btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        ) : loading && templates.length === 0 ? (
          <TemplateGridSkeleton />
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="No templates found"
            description="Try a different search term or choose another category."
          >
            {filtersActive && (
              <button type="button" className="btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </EmptyState>
        ) : (
          <TemplateGrid
            templates={templates}
            onToggleFavorite={toggle}
            pendingIds={pendingIds}
            dimmed={loading}
          />
        )}
      </section>
    </div>
  );
}
