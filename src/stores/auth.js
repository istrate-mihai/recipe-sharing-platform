import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { authApi } from '../services/api';

export const useAuthStore = defineStore('auth', () => {

    const storedUser = localStorage.getItem('user');
    const user       = ref(storedUser ? JSON.parse(storedUser) : null);
    const loading    = ref(false);
    const error      = ref(null);

    const isLoggedIn = computed(() => !!user.value);
    const username   = computed(() => user.value?.name ?? '');

    async function login(email, password) {
        loading.value = true;
        error.value   = null;
        try {
            const data = await authApi.login({ email, password });
            _setSession(data.user, data.token);
            return true;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function register(name, email, password, password_confirmation) {
        loading.value = true;
        error.value   = null;
        try {
            const data = await authApi.register({ name, email, password, password_confirmation });
            _setSession(data.user, data.token);
            return true;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        try {
            await authApi.logout();
        } finally {
            _clearSession();
        }
    }

    function _setSession(userData, token) {
        user.value = userData;
        localStorage.setItem('user',  JSON.stringify(userData));
        localStorage.setItem('token', token);
    }

    function _clearSession() {
        user.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    return {
        user,
        loading,
        error,
        isLoggedIn,
        username,
        login,
        register,
        logout,
    };
});