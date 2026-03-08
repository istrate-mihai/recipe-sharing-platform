import { ref, computed} from 'vue';
import { defineStore } from 'pinia';

const FAKE_USERS = [
  { id: 1, name: 'Ada Lovelace',   email: 'ada@example.com',   password: 'password', avatar: 'AL', bio: 'Mathematician & first programmer.' },
  { id: 2, name: 'Grace Hopper',   email: 'grace@example.com', password: 'password', avatar: 'GH', bio: 'Pioneer of computer programming.' },
];

export const useAuthStore = defineStore('auth', () => {

    const storedUser = localStorage.getItem('user');
    const user       = ref(storedUser ? JSON.parse(storedUser) : null);
    const loading    = ref(false);
    const error      = ref(null);

    const isLoggedIn = computed((() => !!user.value));
    const username   = computed(() => user.value ? user.value.name : '');

    async function login(email, password) {
        loading.value = true;
        error.value = null;

        // Simulate network delay
        await new Promise(r => setTimeout(r, 600));
        const found = FAKE_USERS.find(u => u.email === email && u.password === password);

        if (!found) {
            error.value = 'Invalid email or password';
            loading.value = false;
            return;
        }

        const { password: _, ...userData } = found; // Exclude password
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        loading.value = false;
        return true;
    }

    function logout() {
        user.value = null;
        localStorage.removeItem('user');
    }

    return {
        user,
        loading,
        error,
        isLoggedIn,
        username,
        login,
        logout,
    };
});
