<template>
    <div class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-box">
            <h2 class="modal-title">{{ title }}</h2>

            <div class="form-group">
                <label>Name</label>
                <input v-model="form.name" maxlength="100" placeholder="Collection name" />
                <span v-if="nameError" class="field-error">{{ nameError }}</span>
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea v-model="form.description" maxlength="500" rows="3" placeholder="Optional description" />
            </div>

            <div class="form-group form-group--inline">
                <label>
                    <input type="checkbox" v-model="form.is_public" />
                    Make this collection public
                </label>
            </div>

            <div class="modal-actions">
                <button class="btn-secondary" @click="$emit('close')">Cancel</button>
                <button class="btn-primary" :disabled="isSaving" @click="submit">
                    {{ isSaving ? 'Saving…' : 'Save' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    title:   { type: String,  default: 'Collection' },
    initial: { type: Object,  default: null },
});

const emit = defineEmits(['save', 'close']);

const form = ref({
    name:        props.initial?.name        ?? '',
    description: props.initial?.description ?? '',
    is_public:   props.initial?.is_public   ?? false,
});

const isSaving   = ref(false);
const nameError  = computed(() => {
    console.log(form.value.name.length);
    if (!form.value.name.trim()) return 'Name is required.';
    if (form.value.name.length > 100) return 'Name must be 100 characters or less.';
    return null;
});

async function submit() {
    if (nameError.value) return;
    isSaving.value = true;

    try {
        await emit('save', { ...form.value });
    }
    finally {
        isSaving.value = false;
    }
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(30, 15, 5, 0.75);
    backdrop-filter: blur(3px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-box {
    background: var(--bg-card);
    border: 3px solid #8b6b41;
    border-radius: 40px 20px 40px 20px;
    box-shadow: 10px 10px 0 #4f3a22;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    color: var(--text-dark);
}

.modal-title {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    color: #5a3e1b;
    text-shadow: none;
    margin: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-group label {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 600;
    color: #5a3e1b;
    text-shadow: none;
}

.form-group input,
.form-group textarea {
    background: #fff5e6;
    border: 2px solid #8b6b41;
    border-radius: 20px;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    color: var(--text-dark);
    font-family: var(--font-sans);
    width: 100%;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    transition: 0.2s;
}
.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 3px #4d7a4d40;
}

.form-group--inline {
    flex-direction: row;
    align-items: center;
}
.form-group--inline label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
}
.form-group--inline input[type="checkbox"] {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 4px;
    padding: 0;
    box-shadow: none;
    accent-color: var(--accent-terracotta);
}

.field-error {
    color: #a14545;
    font-size: 0.82rem;
    font-style: italic;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

.btn-secondary {
    background: #8b7a64;
    color: #fef0d7;
    border: 1px solid #a08060;
    border-radius: 50px;
    padding: 0.6rem 1.4rem;
    font-family: var(--font-serif);
    font-size: 0.95rem;
    font-weight: 600;
    box-shadow: 0 5px 0 #5f4f3a;
    cursor: pointer;
    transition: 0.1s ease;
}
.btn-secondary:hover {
    background: #a08060;
    transform: translateY(2px);
    box-shadow: 0 3px 0 #5f4f3a;
}

.btn-primary {
    background: var(--accent-terracotta);
    color: #fef0d7;
    border: 1px solid #d68a5c;
    border-radius: 50px;
    padding: 0.6rem 1.4rem;
    font-family: var(--font-serif);
    font-size: 0.95rem;
    font-weight: 600;
    box-shadow: 0 5px 0 #6b3f2a;
    cursor: pointer;
    transition: 0.1s ease;
}
.btn-primary:hover {
    background: var(--accent-gold);
    box-shadow: 0 3px 0 #7f6139;
    transform: translateY(2px);
}
.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}
</style>
