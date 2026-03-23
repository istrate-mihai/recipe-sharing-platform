<template>
    <RouterLink class="brand" to="/">Recipe Sharing Platform</RouterLink>

    <div class="nav-links">
        <RouterLink to="/">Feed</RouterLink>

        <template v-if="auth.isLoggedIn">
            <RouterLink to="/add-recipe">Add Recipe</RouterLink>
            <RouterLink to="/profile">Profile</RouterLink>

            <RouterLink to="/settings/billing" class="nav-billing" :title="isPremium ? 'Premium account' : 'Upgrade to Premium'">
                <span class="nav-avatar">{{ auth.user.avatar }}</span>
                <span v-if="isPremium" class="premium-crown">★</span>
            </RouterLink>

            <button @click="handleLogout">Logout</button>
        </template>

        <RouterLink to="/login" v-else>Login</RouterLink>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePlan } from '../composables/usePlan';

const router = useRouter();
const auth   = useAuthStore();
const { isPremium } = usePlan();

function handleLogout() {
    auth.logout();
    router.push({ name: 'home' });
}
</script>

<style scoped>
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
}

.premium-crown {
    position: absolute;
    top: -6px;
    right: -6px;
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
