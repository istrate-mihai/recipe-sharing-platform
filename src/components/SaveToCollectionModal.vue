<template>
    <div class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-box">
            <h2 class="modal-title">Save to Collection</h2>

            <div v-if="isLoading" class="loading-state">Loading…</div>

            <div v-else-if="collections.length === 0" class="empty-state">
                <p>No collections yet.</p>
                <button class="btn-primary" @click="$router.push('/collections')">
                    Create a collection
                </button>
            </div>

            <ul v-else class="collection-list">
                <li
                    v-for="col in collections"
                    :key="col.id"
                    class="collection-list-item"
                    :class="{ 'is-saved': savedIds.has(col.id) }"
                    @click="toggle(col.id)"
                >
                    <span class="col-name">{{ col.name }}</span>
                    <span class="col-count">{{ col.recipe_count ?? 0 }} recipes</span>
                    <span class="col-check">{{ savedIds.has(col.id) ? '✓' : '+' }}</span>
                </li>
            </ul>

            <div class="modal-actions">
                <button class="btn-secondary" @click="$emit('close')">Done</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCollections } from '../composables/useCollections';

const props = defineProps({
    recipeId: { type: Number, required: true },
});

const emit = defineEmits(['close']);

const { collections, isLoading, fetchCollections, addRecipe, removeRecipe } = useCollections();

// Track which collections already contain this recipe
const savedIds = ref(new Set());

onMounted(async () => {
    await fetchCollections();
    // Build initial saved state from recipe lists loaded in index
    // (recipe lists on index are cover thumbnails only — 4 items —
    //  so for accuracy we check by recipe_id presence)
    collections.value.forEach(col => {
        if (col.recipes?.some(r => r.id === props.recipeId)) {
            savedIds.value.add(col.id);
        }
    });
});

async function toggle(collectionId) {
    if (savedIds.value.has(collectionId)) {
        await removeRecipe(collectionId, props.recipeId);
        savedIds.value.delete(collectionId);
    } else {
        await addRecipe(collectionId, props.recipeId);
        savedIds.value.add(collectionId);
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
    max-width: 440px;
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
    padding-bottom: 0.5rem;
    border-bottom: 2px dashed #c9a03d44;
}

.loading-state,
.empty-state {
    font-family: var(--font-serif);
    font-size: 0.95rem;
    color: #8b6b41;
    font-style: italic;
    text-align: center;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
}

/* ── Collection list ── */
.collection-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.collection-list-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.5rem;
    border-bottom: 1px dotted #c9a03d33;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.12s;
}
.collection-list-item:last-child {
    border-bottom: none;
}
.collection-list-item:hover {
    background: #f5e6c8;
}
.collection-list-item.is-saved {
    background: #f0ead0;
}

.col-name {
    flex: 1;
    font-family: var(--font-serif);
    font-size: 0.95rem;
    color: #2c1e0e;
    font-weight: 600;
}

.col-count {
    font-size: 0.72rem;
    color: #a08060;
    font-style: italic;
    flex-shrink: 0;
}

.col-check {
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    border: 2px solid #c9a03d;
    background: #fef7e9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #8b5a28;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}
.is-saved .col-check {
    background: #4d7a4d;
    border-color: #2b4a2b;
    color: #fbe9c3;
}

/* ── Actions ── */
.modal-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.25rem;
}

.btn-secondary {
    background: #8b7a64;
    color: #fef0d7;
    border: 1px solid #a08060;
    border-radius: 50px;
    padding: 0.6rem 1.6rem;
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
</style>
