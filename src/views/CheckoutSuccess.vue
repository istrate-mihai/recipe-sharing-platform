<template>
    <div class="success-wrap">
        <div v-if="loading" class="success-card">
            <p class="success-loading">Confirming your subscription…</p>
        </div>

        <div v-else class="success-card">
            <div class="success-icon">✓</div>
            <h1>Welcome to Premium!</h1>
            <p>Your subscription is active. All premium features are now unlocked.</p>
            <button @click="router.push({ name: 'home' })">Go to my recipes</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlan } from '../composables/usePlan';

const router  = useRouter();
const loading = ref(true);
const { refreshPlan } = usePlan();

onMounted(async () => {
    try {
        await refreshPlan();
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.success-wrap {
    min-height: 60vh;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
    background: #f5efe0;
}
.success-card {
    text-align: center; max-width: 400px;
    background: #fdf6e3;
    border: 1px solid #c9a84c;
    border-radius: 12px; padding: 2.5rem 2rem;
    font-family: 'Palatino Linotype', Palatino, serif;
}
.success-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: #e8f5e9; color: #2e7d32;
    font-size: 24px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
}
.success-card h1 { font-size: 22px; font-weight: 600; margin: 0 0 0.5rem; color: #3b2a1a; }
.success-card p  { color: #7a6045; margin: 0 0 1.5rem; }
.success-card button {
    padding: 0.6rem 1.5rem;
    background: #c9a84c; color: #3b2a1a;
    border: none; border-radius: 8px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: inherit;
}
.success-card button:hover { opacity: 0.85; }
.success-loading { color: #7a6045; }
</style>
