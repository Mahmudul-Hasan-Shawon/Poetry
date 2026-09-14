const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export const apiAuth = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const apiWritings = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/writings${query ? `?${query}` : ''}`);
  },
  get: (id) => api.get(`/writings/${id}`),
  getBySlug: (slug) => api.get(`/writings/slug/${slug}`),
  create: (data) => api.post('/writings', data),
  update: (id, data) => api.put(`/writings/${id}`, data),
  delete: (id) => api.delete(`/writings/${id}`),
  featured: () => api.get('/writings/featured'),
  random: () => api.get('/writings/random'),
  daily: () => api.get('/writings/daily'),
  admin: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.get(`/writings/admin/list${query ? `?${query}` : ''}`);
    },
    setDaily: (id) => api.post(`/writings/${id}/set-daily`),
    toggleFeatured: (id) => api.post(`/writings/${id}/toggle-featured`),
    setStatus: (id, status) => api.put(`/writings/${id}/status`, { status }),
    bulkAction: (data) => api.post('/writings/bulk', data),
    duplicate: (id) => api.post(`/writings/${id}/duplicate`),
    import: (data) => api.post('/writings/import', data),
  },
};

export const apiAuthors = {
  list: () => api.get('/authors'),
  get: (slug) => api.get(`/authors/${slug}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`),
};

export const apiCategories = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const apiCollections = {
  list: () => api.get('/collections'),
  get: (slug) => api.get(`/collections/${slug}`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  addWriting: (collectionId, writingId) =>
    api.post(`/collections/${collectionId}/writings`, { writing_id: writingId }),
  removeWriting: (collectionId, writingId) =>
    api.delete(`/collections/${collectionId}/writings/${writingId}`),
};

export const apiSearch = {
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/search${query ? `?${query}` : ''}`);
  },
};

export const apiAnalytics = {
  overview: () => api.get('/analytics/overview'),
  popular: () => api.get('/analytics/popular'),
};

export const apiExport = {
  exportJSON: () => api.get('/export/json'),
  exportCSV: () => api.get('/export/csv'),
};
