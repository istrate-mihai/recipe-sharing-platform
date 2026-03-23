// const BASE_URL = 'https://api.recipe-sharing-platform.com/api';
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.recipe-sharing-platform.com/api';

function getToken() {
    return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        const message = data.message || data.errors
            ? (Object.values(data.errors || {})[0]?.[0] ?? data.message)
            : 'An error occurred.';
        throw new Error(message);
    }

    return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
    login:    (payload) => request('/auth/login',    { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    logout:   ()        => request('/auth/logout',   { method: 'POST' }),
    me:       ()        => request('/auth/me'),
};

// ── Recipes ───────────────────────────────────────────────────────────────
export const recipesApi = {
    index:   (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/recipes${query ? '?' + query : ''}`);
    },
    show:    (id)      => request(`/recipes/${id}`),
    store:   (payload) => request('/recipes',    { method: 'POST', body: payload }), // payload must be FormData
    destroy: (id)      => request(`/recipes/${id}`, { method: 'DELETE' }),
    update:  (id, payload) => request(`/recipes/${id}`, { method: 'POST', body: payload }),
    like:    (id)      => request(`/recipes/${id}/like`,      { method: 'POST' }),
    favourite: (id)    => request(`/recipes/${id}/favourite`, { method: 'POST' }),
};

// ── Favourites ────────────────────────────────────────────────────────────
export const favouritesApi = {
    index: () => request('/favourites'),
};

// ── Profile ───────────────────────────────────────────────────────────────
export const profileApi = {
    get:    ()        => request('/profile'),
    update: (payload) => request('/profile', { method: 'POST', body: JSON.stringify(payload) }),
};
