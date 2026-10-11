import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT, tokenStorage } from '../api/client';
import { authService } from '../api/services';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we verify a stored token on first load, so guards don't flash a redirect.
  const [initializing, setInitializing] = useState(() => Boolean(tokenStorage.get()));

  // Restore the session from a stored token
  useEffect(() => {
    if (!tokenStorage.get()) {
      setInitializing(false);
      return undefined;
    }

    let active = true;
    authService
      .me()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        // Token invalid/expired or API down: start logged out
        tokenStorage.remove();
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // The Axios interceptor announces rejected tokens; drop the user when it happens
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authService.login(credentials);
    tokenStorage.set(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const { token, user: newUser } = await authService.register(details);
    tokenStorage.set(token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: Boolean(user), login, register, logout }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
