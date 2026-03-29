<template>
    <Teleport to="body">
        <div v-if="modelValue" class="pricing-backdrop" @click.self="$emit('update:modelValue', false)">
            <div class="pricing-modal" role="dialog" aria-modal="true" aria-labelledby="pricing-title">

                <button class="pricing-close" @click="$emit('update:modelValue', false)" aria-label="Close">✕</button>

                <div class="pricing-header">
                    <h2 id="pricing-title">Unlock Premium</h2>
                    <p class="pricing-subtitle">Everything you need to grow your recipe collection</p>
                </div>

                <!-- Billing toggle -->
                <div class="pricing-toggle">
                    <span :class="{ active: interval === 'month' }" @click="interval = 'month'">Monthly</span>
                    <span :class="{ active: interval === 'year' }" @click="interval = 'year'">
                        Yearly
                        <em class="save-badge">Save 35%</em>
                    </span>
                </div>

                <!-- Price -->
                <div class="pricing-amount">
                    <span class="price-number">{{ interval === 'month' ? '€4.99' : '€3.25' }}</span>
                    <span class="price-period"> / month</span>
                </div>
                <p v-if="interval === 'year'" class="price-billed">Billed €39 / year</p>

                <!-- Features -->
                <ul class="pricing-features">
                    <li v-for="f in features" :key="f">{{ f }}</li>
                </ul>

                <!-- CTA -->
                <button class="pricing-cta" :disabled="loading" @click="handleUpgrade">
                    {{ loading ? 'Redirecting to Stripe…' : 'Start Premium' }}
                </button>

                <p class="pricing-fine">Cancel anytime · Secure payment via Stripe</p>

            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { usePlan } from '../composables/usePlan';

defineProps({ modelValue: Boolean });
defineEmits(['update:modelValue']);

const { startCheckout } = usePlan();

const PRICE_IDS = {
    // month: 'price_1TE26FKTCGC51Qif0g9kuqCf',
    // year:  'price_1TE26FKTCGC51QifgLJnyQV3',
    year:  'price_1TGKjSKTCGC51QifTihn7qqt',
    month: 'price_1TGKOJKTCGC51Qifj1Dw1IrQ',
};

const interval = ref('year');
const loading  = ref(false);

const features = [
    'Unlimited recipes',
    'Up to 5 photos per recipe',
    'Private / draft recipes',
    'Printable recipe cards (PDF)',
    'Nutritional info + serving calculator',
    'Ad-free experience',
    'Priority support',
];

async function handleUpgrade() {
    loading.value = true;
    try {
        await startCheckout(PRICE_IDS[interval.value]);
    } catch {
        loading.value = false;
        alert('Something went wrong. Please try again.');
    }
}
</script>

<style scoped>
.pricing-backdrop {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 1rem;
}
.pricing-modal {
    background: #fdf6e3;
    border: 1px solid #c9a84c;
    border-radius: 12px;
    padding: 2rem;
    width: 100%; max-width: 420px;
    position: relative;
    font-family: 'Palatino Linotype', Palatino, serif;
}
.pricing-close {
    position: absolute; top: 1rem; right: 1rem;
    background: none; border: none;
    font-size: 16px; cursor: pointer; color: #8b7355;
}
.pricing-header { text-align: center; margin-bottom: 1.5rem; }
.pricing-header h2 { font-size: 22px; font-weight: 600; margin: 0 0 0.25rem; color: #3b2a1a; }
.pricing-subtitle { color: #7a6045; font-size: 14px; margin: 0; }

.pricing-toggle {
    display: flex; border: 1px solid #c9a84c;
    border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem;
}
.pricing-toggle span {
    flex: 1; text-align: center; padding: 0.5rem;
    cursor: pointer; font-size: 14px; color: #7a6045;
    transition: background 0.15s;
}
.pricing-toggle span.active { background: #c9a84c; color: #3b2a1a; font-weight: 600; }
.save-badge {
    font-style: normal; font-size: 11px;
    background: #e8f5e9; color: #2e7d32;
    border-radius: 4px; padding: 1px 5px; margin-left: 4px;
}
.pricing-amount { text-align: center; margin-bottom: 0.25rem; }
.price-number { font-size: 36px; font-weight: 600; color: #3b2a1a; }
.price-period { font-size: 16px; color: #7a6045; }
.price-billed { text-align: center; font-size: 13px; color: #7a6045; margin: 0 0 1.5rem; }

.pricing-features { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.pricing-features li {
    font-size: 14px; padding: 0.4rem 0;
    border-bottom: 1px solid #e8d9b5; color: #3b2a1a;
}
.pricing-features li::before { content: '✓  '; color: #7a8c5e; font-weight: 700; }

.pricing-cta {
    width: 100%; padding: 0.75rem;
    background: #c9a84c; color: #3b2a1a;
    border: none; border-radius: 8px;
    font-size: 16px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: opacity 0.15s;
}
.pricing-cta:disabled { opacity: 0.6; cursor: not-allowed; }
.pricing-cta:hover:not(:disabled) { opacity: 0.85; }
.pricing-fine { text-align: center; font-size: 12px; color: #a08060; margin: 0.75rem 0 0; }
</style>
