<template>
    <div class="collections-page">
        <div class="page-header">
            <h1 class="page-title">My Collections</h1>
            <button v-if="!error" class="btn-create" @click="showCreateModal = true">
                + New Collection
            </button>
        </div>

        <div v-if="isLoading" class="loading-state">
            Loading collections…
        </div>

        <div v-else-if="error" class="error-state">
            {{ error.includes('Premium') ? 'Collections are a Premium feature.' : error }}

            <button v-if="!isPremium" class="btn-create" @click="showPricing = true">
                Upgrade to Premium
            </button>
        </div>

        <div v-else-if="collections.length === 0" class="empty-state">
            <p>No collections yet.</p>
            <button class="btn-create" @click="showCreateModal = true">
                Create your first collection
            </button>
        </div>

        <div v-else class="collections-grid">
            <div
                v-for="col in collections"
                :key="col.id"
                class="collection-card"
                @click="$router.push(`/collections/${col.id}`)"
            >
                <div class="card-cover">
                    <div class="recipe-thumbnails">
                        <img
                            v-for="recipe in (col.recipes ?? []).slice(0, 4)"
                            :key="recipe.id"
                            :src="recipe.primary_image ?? '/placeholder.jpg'"
                            class="thumb"
                            alt=""
                        />
                        <div
                            v-if="(col.recipe_count ?? 0) === 0"
                            class="thumb thumb--empty"
                        >
                            <span>📚</span>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="card-title-row">
                        <h2 class="card-title">{{ col.name }}</h2>
                        <span v-if="!col.is_public" class="badge-private">Private</span>
                    </div>
                    <p v-if="col.description" class="card-description">{{ col.description }}</p>
                    <span class="recipe-count">{{ col.recipe_count ?? 0 }} recipes</span>
                </div>

                <div class="card-actions" @click.stop>
                    <button class="btn-icon" title="Edit" @click="openEdit(col)">✏️</button>
                    <button class="btn-icon btn-danger" title="Delete" @click="confirmDelete(col)">🗑️</button>
                </div>
            </div>
        </div>

        <!-- Create modal -->
        <CollectionFormModal
            v-if="showCreateModal"
            title="New Collection"
            @save="handleCreate"
            @close="showCreateModal = false"
        />

        <!-- Edit modal -->
        <CollectionFormModal
            v-if="editTarget"
            title="Edit Collection"
            :initial="editTarget"
            @save="handleEdit"
            @close="editTarget = null"
        />
    </div>

    <PricingModal v-model="showPricing" />

    <ConfirmModal
        v-model="showDeleteModal"
        :title="`Delete &quot;${deleteTarget?.name}&quot;?`"
        message="This will permanently remove the collection and all its saved recipes. There's no going back."
        confirmLabel="Delete it"
        @confirm="handleDelete"
    />
</template>

<script setup>
import { ref, watch } from 'vue';
import { useCollections } from '../composables/useCollections';
import { usePlan } from '../composables/usePlan';
import CollectionFormModal from '../components/CollectionFormModal.vue';
import PricingModal from '../components/PricingModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const { collections, isLoading, error, createCollection, updateCollection, deleteCollection } = useCollections();

const { isPremium } = usePlan();

const showCreateModal  = ref(false);
const editTarget       = ref(null);
const showPricing      = ref(false);
const showDeleteModal  = ref(false);
const deleteTarget     = ref(null);

function openEdit(col) {
    editTarget.value = { ...col };
}

async function handleCreate(payload) {
    await createCollection(payload);
    showCreateModal.value = false;
}

async function handleEdit(payload) {
    await updateCollection(editTarget.value.id, payload);
    editTarget.value = null;
}

function confirmDelete(col) {
    deleteTarget.value    = col;
    showDeleteModal.value = true;
}

async function handleDelete() {
    await deleteCollection(deleteTarget.value.id);
    deleteTarget.value = null;
}
</script>

<style scoped>
/* ── Page header ──────────────────────────────────────────────────── */
.collections-page {
    padding-bottom: 4rem;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.page-title {
    font-family: var(--font-serif);
    font-size: 2.8rem;
    color: var(--text-light);
    text-shadow: 2px 2px 0 #00000030;
    margin: 0;
}

/* ── Buttons ──────────────────────────────────────────────────────── */
.btn-create {
    background: var(--accent-terracotta);
    color: #fef0d7;
    border: 1px solid #d68a5c;
    border-radius: 50px;
    padding: 0.6rem 1.6rem;
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 6px 0 #6b3f2a;
    cursor: pointer;
    transition: 0.1s ease;
    letter-spacing: 0.5px;
}
.btn-create:hover {
    background: var(--accent-gold);
    box-shadow: 0 4px 0 #7f6139;
    transform: translateY(2px);
}

.btn-secondary {
    background: #8b7a64;
    color: #fef0d7;
    border: 1px solid #a08060;
    border-radius: 50px;
    padding: 0.6rem 1.6rem;
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 6px 0 #5f4f3a;
    cursor: pointer;
    transition: 0.1s ease;
}
.btn-secondary:hover {
    background: #a08060;
    transform: translateY(2px);
    box-shadow: 0 4px 0 #5f4f3a;
}

.btn-icon {
    background: #fbe9c3;
    color: var(--text-dark);
    border: 1px solid #c9a03d;
    border-radius: 50px;
    padding: 0.4rem 0.9rem;
    font-size: 0.95rem;
    box-shadow: 0 4px 0 #9c7c5b;
    cursor: pointer;
    transition: 0.1s ease;
}
.btn-icon:hover {
    background: var(--accent-gold);
    transform: translateY(2px);
    box-shadow: 0 2px 0 #9c7c5b;
}
.btn-danger {
    background: #a14545;
    color: #fef0d7;
    border-color: #c05555;
    box-shadow: 0 4px 0 #632b2b;
}
.btn-danger:hover {
    background: #c05555;
    box-shadow: 0 2px 0 #632b2b;
}

/* ── States ───────────────────────────────────────────────────────── */
.loading-state,
.empty-state,
.error-state {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    color: var(--text-light);
    background: #4f3a22cc;
    border: 2px dashed var(--accent-gold);
    border-radius: 40px;
    padding: 2.5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    margin-top: 2rem;
}

.error-state {
    border-color: #a14545;
    background: #3a1a1acc;
}

/* ── Collections grid ─────────────────────────────────────────────── */
.collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 1rem;
}

/* ── Collection card — wooden plaque style ────────────────────────── */
.collection-card {
    background: var(--bg-card);
    border: 3px solid #8b6b41;
    border-radius: 50px 20px 50px 20px;
    overflow: hidden;
    box-shadow: 8px 8px 0 #4f3a22;
    cursor: pointer;
    transition: 0.2s ease;
    display: flex;
    flex-direction: column;
    color: var(--text-dark);
}
.collection-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0 #4d7a4d;
}

/* ── Card cover — thumbnail grid ─────────────────────────────────── */
.card-cover {
    background: #e8d5b0;
    border-bottom: 2px solid #c9a03d44;
    padding: 0.75rem;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.recipe-thumbnails {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    width: 100%;
    max-width: 200px;
    aspect-ratio: 1;
}

.thumb {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #c9a03d44;
}

.thumb--empty {
    background: #fbe9c3;
    border: 2px dashed #c9a03d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    border-radius: 8px;
    grid-column: span 2;
    aspect-ratio: 2 / 1;
}

/* ── Card body ────────────────────────────────────────────────────── */
.card-body {
    padding: 1rem 1.2rem 0.5rem;
    flex: 1;
}

.card-title-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 0.3rem;
}

.card-title {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.badge-private {
    background: #8b5a28;
    color: #fbe9c3;
    font-size: 0.65rem;
    font-family: var(--font-sans);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    border: 1px solid #c9a03d44;
}

.card-description {
    font-size: 0.85rem;
    color: #5c3d1e;
    margin-bottom: 0.4rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.recipe-count {
    font-size: 0.78rem;
    font-family: var(--font-sans);
    color: #8b6b41;
    font-style: italic;
}

/* ── Card actions ─────────────────────────────────────────────────── */
.card-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.2rem 1rem;
    border-top: 1px dashed #c9a03d44;
    margin-top: 0.5rem;
}
</style>
