const rawApiBase = (import.meta.env.VITE_API_BASE || '').trim();

export const API_BASE = rawApiBase ? rawApiBase.replace(/\/$/, '') : '/api';
export const AUTH_API = `${API_BASE}/auth`;