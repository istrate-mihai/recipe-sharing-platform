<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
                <div class="modal-box" role="dialog" aria-modal="true">

                    <div class="modal-icon">🍂</div>

                    <h2 class="modal-title">{{ title }}</h2>
                    <p class="modal-message">{{ message }}</p>

                    <div class="modal-actions">
                        <button class="modal-btn cancel" @click="$emit('update:modelValue', false)">
                            Cancel
                        </button>
                        <button class="modal-btn confirm" @click="handleConfirm">
                            {{ confirmLabel }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
defineProps({
    modelValue:   { type: Boolean, required: true },
    title:        { type: String, default: 'Are you sure?' },
    message:      { type: String, default: 'This action cannot be undone.' },
    confirmLabel: { type: String, default: 'Delete' },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

function handleConfirm() {
    emit('confirm');
    emit('update:modelValue', false);
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: #0d0704cc;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: 1rem;
}

.modal-box {
    background: #fef7e9;
    border-radius: 24px;
    padding: 2.5rem 2rem 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 8px 0 #3f2e1b, 0 20px 60px #00000080;
    border: 3px solid #b78c5a;
    position: relative;
}

/* Parchment texture lines */
.modal-box::before {
    content: '';
    position: absolute;
    inset: 12px;
    border: 1px solid #c9a03d40;
    border-radius: 16px;
    pointer-events: none;
}

.modal-icon {
    font-size: 2.8rem;
    margin-bottom: 0.8rem;
    display: block;
}

.modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    color: #3f2e1b;
    margin: 0 0 0.6rem;
}

.modal-message {
    color: #7a5c3a;
    font-size: 0.95rem;
    margin: 0 0 2rem;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.modal-btn {
    padding: 0.65rem 1.8rem;
    border-radius: 60px;
    border: none;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.1s, box-shadow 0.1s;
}

.modal-btn:active { transform: translateY(2px); }

.modal-btn.cancel {
    background: #e8dcc8;
    color: #5a3e20;
    box-shadow: 0 4px 0 #b8a080;
}
.modal-btn.cancel:hover { background: #ddd0b8; }

.modal-btn.confirm {
    background: #a14545;
    color: #fef7e9;
    box-shadow: 0 4px 0 #632b2b;
}
.modal-btn.confirm:hover { background: #8b3535; }

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92) translateY(12px); }
</style>
