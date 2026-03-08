<template>
    <RouterLink class="brand" to="/">Recipe Sharing Platform</RouterLink>

    <div class="nav-links">
        <RouterLink to="/">Feed</RouterLink>

        <template v-if="auth.isLoggedIn">
            <RouterLink to="/add-recipe">Add Recipe</RouterLink>
            <RouterLink to="/profile">
                <span>{{ auth.user.avatar }}</span>
            </RouterLink>
            <button @click="handleLogout">Logout</button>

        </template>
        <RouterLink to="/login" v-else>Login</RouterLink>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

function handleLogout() {
    auth.logout();
    router.push({name: 'home'});
}
</script>
