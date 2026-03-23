import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.recipe-sharing-platform.com/api';

function getToken() {
    return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    const res  = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

export function usePlan() {
    const auth = useAuthStore();

    // ── Computed state ────────────────────────────────────────────────────────

    const isPremium = computed(() => auth.user?.plan === 'premium');
    const isPastDue = computed(() => auth.user?.subscription_status === 'past_due');
    const recipeCount = computed(() => auth.user?.recipe_count ?? 0);

    const atFreeLimit = computed(
        () => !isPremium.value && (auth.user?.remaining_free_recipes ?? 10) <= 0
    );

    const freeUsagePercent = computed(() => {
        if (isPremium.value) return 0;
        return Math.min(100, Math.round((recipeCount.value / 10) * 100));
    });

    // ── Actions ───────────────────────────────────────────────────────────────

    async function startCheckout(priceId) {
        const data = await apiRequest('/subscribe', {
            method: 'POST',
            body: JSON.stringify({ price_id: priceId }),
        });
        window.location.href = data.checkout_url;
    }

    async function openBillingPortal() {
        const data = await apiRequest('/billing-portal', { method: 'POST' });
        window.location.href = data.portal_url;
    }

    /**
     * Re-fetches plan from API and syncs both the Pinia store
     * and the localStorage cache that the auth store uses.
     */
    async function refreshPlan() {
        const data = await apiRequest('/subscription');
        if (auth.user) {
            auth.user.plan                   = data.plan;
            auth.user.subscription_status    = data.status;
            auth.user.remaining_free_recipes = data.remaining_free_recipes;
            // Keep localStorage in sync so plan survives a page refresh
            localStorage.setItem('user', JSON.stringify(auth.user));
        }
    }

    return {
        isPremium,
        isPastDue,
        atFreeLimit,
        freeUsagePercent,
        recipeCount,
        startCheckout,
        openBillingPortal,
        refreshPlan,
    };
}
