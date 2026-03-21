import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
    },
    {
        path: '/recipe/:id',
        name: 'recipe-detail',
        component: () => import('../views/RecipeDetailView.vue'),
    },
    {
        path: '/recipe/:id/edit',
        name: 'edit-recipe',
        component: () => import('../views/EditRecipeView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/add-recipe',
        name: 'add-recipe',
        component: () => import('../views/AddRecipeView.vue'),
        meta: {  requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: {  requiresAuth: true },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
        meta: {  guestOnly: true },
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('../views/AboutView.vue'),
    },
    {
        path: '/contact',
        name: 'contact',
        component: () => import('../views/ContactView.vue'),
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: () => import('../views/PrivacyPolicyView.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/NotFoundView.vue'),
    },
];

const router = createRouter({
    routes,
    history: createWebHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta.guestOnly && auth.isLoggedIn) {
        return { name: 'home' };
    }
    return true;
});

export default router;
