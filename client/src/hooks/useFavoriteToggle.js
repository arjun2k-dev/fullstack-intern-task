import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorInfo } from '../api/client';
import { favoriteService } from '../api/services';
import { useAuth } from './useAuth';

/**
 * Optimistic favorite toggling shared by the Templates and Favorites pages.
 *
 * onApply(templateId, isFavorite)  - update the page's local state immediately
 * onRemoved(templateId)            - optional; called after a successful removal
 *
 * On failure the optimistic change is rolled back and `error` is set.
 */
export default function useFavoriteToggle({ onApply, onRemoved } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const inFlight = useRef(new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [error, setError] = useState('');

  const toggle = useCallback(
    async (template) => {
      // Guests are sent to log in, then returned to the page they were on
      if (!user) {
        navigate('/login', {
          state: { from: location, notice: 'Log in to save templates to your favorites.' },
        });
        return;
      }

      const { id } = template;
      if (inFlight.current.has(id)) return; // ignore rapid double-clicks

      const next = !template.is_favorite;
      inFlight.current.add(id);
      setPendingIds(new Set(inFlight.current));
      setError('');
      onApply?.(id, next); // optimistic update

      try {
        if (next) {
          await favoriteService.add(id);
        } else {
          await favoriteService.remove(id);
          onRemoved?.(id);
        }
      } catch (err) {
        onApply?.(id, !next); // roll back
        setError(getErrorInfo(err).message);
      } finally {
        inFlight.current.delete(id);
        setPendingIds(new Set(inFlight.current));
      }
    },
    [user, navigate, location, onApply, onRemoved]
  );

  const clearError = useCallback(() => setError(''), []);

  return { toggle, pendingIds, error, clearError };
}
