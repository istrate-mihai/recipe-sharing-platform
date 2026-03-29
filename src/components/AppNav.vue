<template>
    <nav class="navbar">
        <RouterLink class="brand" to="/">Recipe Sharing Platform</RouterLink>

        <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <div class="nav-links" :class="{ open: menuOpen }">
            <a @click.prevent="closeAndNavigate('/')">Feed</a>

            <template v-if="auth.isLoggedIn">
                <a @click.prevent="closeAndNavigate('/add-recipe')">Add Recipe</a>
                <a v-if="isPremium" @click.prevent="closeAndNavigate('/collections')">📚 Collections</a>

                <a @click.prevent="closeAndNavigate('/settings/billing')"
                   class="nav-billing"
                   :title="isPremium ? 'Premium account' : 'Upgrade to Premium'">
                    <span class="nav-avatar">{{ auth.user.avatar }}</span>
                    <span class="nav-billing-label">Profile</span>
                    <span v-if="isPremium" class="premium-crown">★</span>
                </a>

                <button @click="handleLogout">Logout</button>
            </template>

            <a v-else @click.prevent="closeAndNavigate('/login')">Login</a>
        </div>
    </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePlan } from '../composables/usePlan';

const router        = useRouter();
const auth          = useAuthStore();
const { isPremium } = usePlan();
const menuOpen      = ref(false);

async function closeAndNavigate(route) {
    menuOpen.value = false;
    await router.push(route);
}

async function handleLogout() {
    menuOpen.value = false;
    auth.logout();
    await router.push({ name: 'home' });
}
</script>

<style scoped>
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    position: relative;
}

/* Label hidden on desktop — avatar alone is enough */
.nav-billing-label {
    display: none;
}

.hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    box-shadow: none !important;
}

.hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: #fbe9c3;
    border-radius: 2px;
}

@media (max-width: 640px) {
    .hamburger {
        display: flex;
    }

    .nav-links {
        display: none;
        flex-direction: column;
        width: 100%;
        padding: 0.5rem 0 0.25rem;
        gap: 0;
    }

    .nav-links.open {
        display: flex;
    }

    /* Kill the global ::after dots */
    .nav-links > a::after,
    .nav-links > button::after {
        display: none !important;
    }

    .nav-links > a,
    .nav-links > button {
        display: flex;
        align-items: center;
        width: 100%;
        text-align: left;
        padding: 0.65rem 0.5rem;
        border-bottom: 1px solid rgba(251, 233, 195, 0.1);
        box-sizing: border-box;
        cursor: pointer;
    }

    .nav-links > a:last-child,
    .nav-links > button:last-child {
        border-bottom: none;
    }

    /* Avatar row aligned like other rows */
    .nav-billing {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        padding: 0.5rem !important;
        width: 100% !important;
        border-bottom: 1px solid rgba(251, 233, 195, 0.1) !important;
        background: none !important;
        box-shadow: none !important;
    }

    /* Show "Profile" label next to avatar on mobile */
    .nav-billing-label {
        display: inline;
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
        color: #fbe9c3;
        text-shadow: 1px 1px 0 #1f130a;
    }
}

.nav-billing {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 !important;
    background: none !important;
    box-shadow: none !important;
}

.nav-billing:hover {
    background: none !important;
    transform: translateY(-4px) !important;
    box-shadow: none !important;
}

.nav-avatar {
    background: #c9a03d;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1rem;
    color: #2c1e0e;
    border: 2px solid #fbe9c3;
    box-shadow: 0 4px 0 #5a3e1b;
    flex-shrink: 0;
}

.premium-crown {
    position: absolute;
    top: 2px;
    left: 26px;  /* sits on top-right of avatar, not the row */
    background: #c9a84c;
    color: #3b2a1a;
    font-size: 10px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #fbe9c3;
    line-height: 1;
}
</style>
