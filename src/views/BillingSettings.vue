<template>
    <div class="billing-wrap">
        <div class="billing-book">

            <div class="page-header">
                <span class="page-chapter">Account</span>
                <span class="page-num">Billing</span>
            </div>

            <!-- Free tier -->
            <div v-if="!isPremium">
                <div class="plan-row">
                    <span class="plan-label">Current plan</span>
                    <span class="plan-badge plan-badge--free">Free</span>
                </div>

                <div class="free-usage">
                    <div class="usage-label">
                        Recipes: {{ auth.user?.recipe_count ?? 0 }} / 10
                    </div>
                    <div class="usage-track">
                        <div class="usage-fill" :style="{ width: freeUsagePercent + '%' }" />
                    </div>
                    <p class="usage-hint" v-if="atFreeLimit">
                        You've reached the free limit. Upgrade to add more recipes.
                    </p>
                </div>

                <button class="billing-btn billing-btn--upgrade" @click="showPricing = true">
                    Upgrade to Premium
                </button>
            </div>

            <!-- Premium tier -->
            <div v-else>
                <div class="plan-row">
                    <span class="plan-label">Current plan</span>
                    <span class="plan-badge plan-badge--premium">Premium</span>
                    <span v-if="isPastDue" class="plan-badge plan-badge--warning">Payment issue</span>
                </div>

                <p v-if="isPastDue" class="past-due-msg">
                    Your last payment failed. Please update your payment method to keep Premium access.
                </p>

                <p class="billing-note">
                    Manage your subscription, update payment details, or cancel via the Stripe portal.
                </p>

                <button class="billing-btn" :disabled="portalLoading" @click="handlePortal">
                    {{ portalLoading ? 'Opening portal…' : 'Manage billing' }}
                </button>
            </div>

        </div>

        <PricingModal v-model="showPricing" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePlan } from '../composables/usePlan';
import PricingModal from '../components/PricingModal.vue';

const auth = useAuthStore();
const { isPremium, isPastDue, atFreeLimit, freeUsagePercent, openBillingPortal } = usePlan();

const showPricing   = ref(false);
const portalLoading = ref(false);

async function handlePortal() {
    portalLoading.value = true;
    try {
        await openBillingPortal();
    } catch {
        portalLoading.value = false;
        alert('Could not open billing portal. Please try again.');
    }
}
</script>

<style scoped>
.billing-wrap {
    padding: 2rem 1rem;
    background: #f5efe0;
    min-height: 60vh;
    display: flex; justify-content: center; align-items: flex-start;
}
.billing-book {
    background: #fdf6e3;
    border: 1px solid #c9a84c;
    border-radius: 8px;
    padding: 2rem;
    width: 100%; max-width: 480px;
    font-family: 'Palatino Linotype', Palatino, serif;
}
.page-header {
    display: flex; justify-content: space-between;
    font-size: 12px; letter-spacing: .06em; text-transform: uppercase;
    color: #a08060; border-bottom: 1px solid #e8d9b5;
    padding-bottom: .5rem; margin-bottom: 1.5rem;
}
.plan-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 1.25rem;
}
.plan-label { font-size: 15px; color: #3b2a1a; }
.plan-badge {
    font-size: 12px; border-radius: 4px; padding: 2px 8px; font-weight: 600;
}
.plan-badge--free    { background: #f0e6cc; color: #7a6045; }
.plan-badge--premium { background: #c9a84c; color: #3b2a1a; }
.plan-badge--warning { background: #fff3cd; color: #856404; }

.free-usage { margin-bottom: 1.25rem; }
.usage-label { font-size: 14px; color: #3b2a1a; margin-bottom: 6px; }
.usage-track {
    height: 6px; background: #e8d9b5;
    border-radius: 3px; overflow: hidden;
}
.usage-fill {
    height: 100%; background: #c9a84c;
    border-radius: 3px; transition: width 0.3s;
}
.usage-hint { font-size: 13px; color: #b85c2a; margin: 6px 0 0; }

.billing-note { font-size: 14px; color: #7a6045; margin: 0 0 1rem; }
.past-due-msg { font-size: 14px; color: #856404; margin: 0 0 1rem; }

.billing-btn {
    width: 100%; padding: 0.65rem;
    background: #c9a84c; color: #3b2a1a;
    border: none; border-radius: 8px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: opacity 0.15s;
}
.billing-btn--upgrade { background: #3b2a1a; color: #fdf6e3; }
.billing-btn:hover:not(:disabled) { opacity: 0.85; }
.billing-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
