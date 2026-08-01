const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = {
  get: async (endpoint: string, headers: Record<string, string> = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return { data: await res.json() };
  },

  post: async (endpoint: string, body: any, headers: Record<string, string> = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const isFormData = body instanceof FormData;
    const reqHeaders: Record<string, string> = isFormData ? { ...headers } : { 'Content-Type': 'application/json', ...headers };

    const res = await fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return { data: await res.json() };
  },
};
