import axios from 'axios';

const TOKEN_KEY = 'mst_token';

/** Thin wrapper so a blocked/unavailable localStorage never crashes the app. */
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  remove() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Fired when the API rejects a stored token, so AuthContext can sign the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 on a normal request means the token is expired or invalid.
// Login/register 401s are just "wrong credentials" and must not log anyone out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isCredentialCall && tokenStorage.get()) {
      tokenStorage.remove();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

export const isCanceled = axios.isCancel;

/** Normalises any Axios error into { message, fieldErrors } for the UI. */
export function getErrorInfo(error) {
  const data = error?.response?.data;

  if (data?.message) {
    return { message: data.message, fieldErrors: data.errors || {} };
  }
  if (error?.code === 'ECONNABORTED') {
    return { message: 'The request timed out. Please try again.', fieldErrors: {} };
  }
  if (error?.request) {
    return {
      message: 'Cannot reach the server. Check your connection and that the API is running.',
      fieldErrors: {},
    };
  }
  return { message: 'Something went wrong. Please try again.', fieldErrors: {} };
}

export default api;
