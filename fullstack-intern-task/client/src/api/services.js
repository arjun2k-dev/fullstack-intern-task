import api from './client';

const unwrap = (promise) => promise.then((response) => response.data);

export const authService = {
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  login: (payload) => unwrap(api.post('/auth/login', payload)),
  me: () => unwrap(api.get('/auth/me')),
};

export const templateService = {
  list: (params, signal) => unwrap(api.get('/templates', { params, signal })),
  categories: () => unwrap(api.get('/templates/categories')),
  getById: (id) => unwrap(api.get(`/templates/${id}`)),
};

export const favoriteService = {
  list: (signal) => unwrap(api.get('/favorites', { signal })),
  add: (templateId) => unwrap(api.post(`/favorites/${templateId}`)),
  remove: (templateId) => unwrap(api.delete(`/favorites/${templateId}`)),
};
