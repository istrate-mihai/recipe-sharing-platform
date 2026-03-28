<template>
    <div class="collection-detail-wrap">
        <button class="back-btn" @click="$router.back()">← Back</button>

        <div v-if="isLoading" class="recipe-book">
            <div class="book-cover book-cover--left"></div>
            <div class="book-spread">
                <div class="book-page book-page--left">
                    <div class="page-loading">Loading collection…</div>
                </div>
                <div class="book-spine">
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                </div>
                <div class="book-page book-page--right"></div>
            </div>
            <div class="book-cover book-cover--right"></div>
        </div>

        <div v-else-if="!collection" class="page-empty-outer">
            <p>Collection not found.</p>
            <button class="back-btn" @click="$router.push('/collections')">← Back to Collections</button>
        </div>

        <div v-else class="recipe-book">
            <div class="book-cover book-cover--left"></div>

            <div class="book-spread">

                <!-- ════ LEFT PAGE ════ -->
                <div class="book-page book-page--left">
                    <div class="page-header">
                        <span class="page-chapter">Collections</span>
                        <span class="page-num">p. 1</span>
                    </div>

                    <!-- Collection meta -->
                    <div class="collection-meta">
                        <div class="meta-title-row">
                            <h2 class="collection-title">{{ collection.name }}</h2>
                            <span v-if="!collection.is_public" class="badge-private">Private</span>
                        </div>
                        <p v-if="collection.description" class="collection-description">
                            {{ collection.description }}
                        </p>
                        <div class="meta-stats">
                            <span class="stat-pill">📖 {{ collection.recipes?.length ?? 0 }} recipes</span>
                            <span class="stat-pill">{{ collection.is_public ? '🌐 Public' : '🔒 Private' }}</span>
                        </div>
                    </div>

                    <div class="page-divider"></div>

                    <div class="page-section-title">Recipes in this collection</div>

                    <div v-if="!collection.recipes?.length" class="page-empty">
                        <p>No recipes in this collection yet.</p>
                        <RouterLink to="/" class="empty-cta">Browse recipes to save →</RouterLink>
                    </div>

                    <!-- Recipe rows — left page (first half) -->
                    <div class="recipe-list">
                        <div
                            v-for="recipe in leftPageRecipes"
                            :key="recipe.id"
                            class="recipe-row"
                        >
                            <span class="recipe-row-num"></span>
                            <RouterLink
                                :to="{ name: 'recipe-detail', params: { id: recipe.id } }"
                                class="recipe-row-title"
                            >{{ recipe.title }}</RouterLink>
                            <span v-if="recipe.category" class="recipe-row-category">{{ recipe.category }}</span>
                            <button class="remove-btn" @click="handleRemove(recipe.id)" title="Remove from collection">✕</button>
                        </div>
                    </div>

                    <div class="page-spacer"></div>
                    <div class="page-footer-rule"></div>
                </div>

                <!-- ── Spine ── -->
                <div class="book-spine">
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                </div>

                <!-- ════ RIGHT PAGE ════ -->
                <div class="book-page book-page--right">
                    <div class="page-header page-header--right">
                        <span class="page-num">p. 2</span>
                        <span class="page-chapter">Continued</span>
                    </div>

                    <div v-if="rightPageRecipes.length" class="recipe-list">
                        <div
                            v-for="recipe in rightPageRecipes"
                            :key="recipe.id"
                            class="recipe-row"
                        >
                            <span class="recipe-row-num"></span>
                            <RouterLink
                                :to="{ name: 'recipe-detail', params: { id: recipe.id } }"
                                class="recipe-row-title"
                            >{{ recipe.title }}</RouterLink>
                            <span v-if="recipe.category" class="recipe-row-category">{{ recipe.category }}</span>
                            <button class="remove-btn" @click="handleRemove(recipe.id)" title="Remove from collection">✕</button>
                        </div>
                    </div>

                    <div v-else class="page-empty">
                        <p style="font-style:italic; color:#a08060; font-size:.85rem;">
                            All recipes fit on the left page.
                        </p>
                    </div>

                    <div class="page-spacer"></div>

                    <!-- Edit collection shortcut -->
                    <button class="edit-collection-btn" @click="showEditModal = true">✏️ Edit Collection</button>

                    <div class="page-footer-rule"></div>
                </div>
            </div>

            <div class="book-cover book-cover--right"></div>
        </div>

        <!-- Edit modal -->
        <CollectionFormModal
            v-if="showEditModal"
            title="Edit Collection"
            :initial="collection"
            @save="handleEdit"
            @close="showEditModal = false"
        />

        <!-- Delete modal -->
        <ConfirmModal
            v-model="showRemoveModal"
            title="Remove from collection?"
            message="This recipe will be removed from the collection. You can always add it back."
            confirmLabel="Remove it"
            @confirm="confirmRemove"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCollections } from '../composables/useCollections';
import CollectionFormModal from '../components/CollectionFormModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const route = useRoute();
const { fetchCollection, removeRecipe, updateCollection } = useCollections();

const collection      = ref(null);
const isLoading       = ref(true);
const showEditModal   = ref(false);
const showRemoveModal = ref(false);
const pendingRemoveId = ref(null);

onMounted(async () => {
    collection.value = await fetchCollection(route.params.id);
    isLoading.value  = false;
});

// Split recipes across two pages
const leftPageRecipes  = computed(() => collection.value?.recipes?.slice(0, 8)  ?? []);
const rightPageRecipes = computed(() => collection.value?.recipes?.slice(8)      ?? []);

function handleRemove(recipeId) {
    pendingRemoveId.value = recipeId;
    showRemoveModal.value = true;
}

async function confirmRemove() {
    await removeRecipe(collection.value.id, pendingRemoveId.value);
    collection.value.recipes = collection.value.recipes.filter(r => r.id !== pendingRemoveId.value);
    pendingRemoveId.value = null;
}

async function handleEdit(payload) {
    const updated = await updateCollection(collection.value.id, payload);
    collection.value = { ...collection.value, ...updated };
    showEditModal.value = false;
}
</script>

<style scoped>
.collection-detail-wrap { padding-bottom: 3rem; }

.back-btn {
    background: transparent;
    border: none;
    color: var(--accent-gold);
    font-family: var(--font-serif);
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1.2rem;
    box-shadow: none;
    display: inline-block;
}
.back-btn:hover {
    color: var(--accent-terracotta);
    background: transparent;
    box-shadow: none;
    transform: none;
}

/* ══ Book shell ══ */
.recipe-book {
    display: flex;
    align-items: stretch;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    max-width: 1200px;
    margin: 0 auto;
    overflow: visible;
}

.book-cover {
    width: 24px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.book-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 10px rgba(0,0,0,.5); }
.book-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset 4px 0 10px rgba(0,0,0,.5); }

.book-spread {
    display: flex;
    flex: 1;
    position: relative;
}

/* ══ Pages ══ */
.book-page {
    flex: 1;
    background: #fef7e9;
    padding: 2rem 2.2rem;
    display: flex;
    flex-direction: column;
    gap: .75rem;
    min-height: 600px;
    position: relative;
}

.book-page--left {
    background:
        repeating-linear-gradient(
            transparent,
            transparent 27px,
            #c9a03d22 27px,
            #c9a03d22 28px
        );
    background-color: #fef7e9;
}

.book-page--right {
    background:
        repeating-linear-gradient(
            transparent,
            transparent 27px,
            #c9a03d22 27px,
            #c9a03d22 28px
        );
    background-color: #fdf3e0;
}

/* ── Page header ── */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: .4rem;
    border-bottom: 2px solid #c9a03d44;
    flex-shrink: 0;
}
.page-header--right { flex-direction: row-reverse; }
.page-chapter {
    font-family: var(--font-serif);
    font-size: .7rem;
    color: #8b5a28;
    text-transform: uppercase;
    letter-spacing: .12em;
    font-weight: 700;
}
.page-num {
    font-family: var(--font-serif);
    font-size: .7rem;
    color: #a08060;
    font-style: italic;
}

/* ── Collection meta ── */
.collection-meta {
    display: flex;
    flex-direction: column;
    gap: .4rem;
    position: relative;
    z-index: 1;
}
.meta-title-row {
    display: flex;
    align-items: center;
    gap: .6rem;
    flex-wrap: wrap;
}
.collection-title {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    color: #3b2a1a;
    text-shadow: none;
    margin: 0;
}
.collection-description {
    font-size: .88rem;
    color: #5c3d1e;
    font-style: italic;
    line-height: 1.5;
    margin: 0;
}
.meta-stats {
    display: flex;
    gap: .6rem;
    flex-wrap: wrap;
}
.stat-pill {
    font-size: .72rem;
    font-family: var(--font-sans);
    color: #8b5a28;
    background: #f5e6c8;
    border: 1px solid #c9a03d44;
    border-radius: 20px;
    padding: .15rem .6rem;
}

.badge-private {
    background: #8b5a28;
    color: #fbe9c3;
    font-size: .65rem;
    font-family: var(--font-sans);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: .2rem .6rem;
    border-radius: 20px;
}

/* ── Divider + section title ── */
.page-divider {
    height: 1px;
    background: #c9a03d33;
    flex-shrink: 0;
}
.page-section-title {
    font-family: var(--font-serif);
    font-size: .72rem;
    color: #8b5a28;
    text-transform: uppercase;
    letter-spacing: .1em;
    font-weight: 700;
    flex-shrink: 0;
}

/* ── Recipe rows ── */
.recipe-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 1;
}
.recipe-row {
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: .55rem 0;
    border-bottom: 1px dotted #c9a03d33;
}
.recipe-row:last-child { border-bottom: none; }

.recipe-row-num {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c9a03d88;
    flex-shrink: 0;
}
.recipe-row-title {
    flex: 1;
    font-family: var(--font-serif);
    font-size: .88rem;
    color: #2c1e0e;
    text-decoration: none;
    line-height: 1.3;
    transition: color .12s;
}
.recipe-row-title:hover {
    color: #8b5a28;
    text-decoration: underline wavy #c9a03d44 1px;
}
.recipe-row-category {
    font-size: .68rem;
    color: #a08060;
    font-style: italic;
    flex-shrink: 0;
    text-transform: capitalize;
}
.remove-btn {
    flex-shrink: 0;
    background: transparent;
    border: 1px solid #c0503066;
    border-radius: 20px;
    color: #c05030;
    font-size: .62rem;
    padding: .15rem .55rem;
    cursor: pointer;
    box-shadow: none;
    transition: background .12s;
}
.remove-btn:hover {
    background: #c0503018;
    transform: none;
    box-shadow: none;
}

/* ── Empty / loading ── */
.page-empty {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    color: #a08060;
    font-style: italic;
    font-size: .85rem;
    padding: .5rem 0;
}
.empty-cta {
    color: #c9a03d;
    font-size: .8rem;
    font-style: normal;
    text-decoration: none;
    font-weight: 600;
}
.empty-cta:hover { text-decoration: underline; }

.page-loading {
    color: #a08060;
    font-style: italic;
    font-size: .85rem;
}

.page-empty-outer {
    text-align: center;
    color: var(--text-light);
    padding: 3rem;
    font-family: var(--font-serif);
}

/* ── Footer ── */
.page-spacer { flex: 1; min-height: .5rem; }
.page-footer-rule {
    height: 1px;
    background: #c9a03d44;
    margin-top: .5rem;
    flex-shrink: 0;
}

.edit-collection-btn {
    align-self: flex-start;
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    border: none;
    font-family: var(--font-serif);
    font-size: .82rem;
    font-weight: 700;
    padding: .45rem 1.1rem;
    border-radius: 60px;
    box-shadow: 0 3px 0 #7a5a00;
    cursor: pointer;
    transition: transform .1s;
    position: relative;
    z-index: 1;
}
.edit-collection-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 0 #7a5a00;
    background: linear-gradient(180deg, #d4ae4a 0%, #b08830 100%);
}

/* ══ Spine ══ */
.book-spine {
    width: 20px;
    flex-shrink: 0;
    background: linear-gradient(to right, #4a2a0a 0%, #8b5a28 45%, #6b4020 55%, #4a2a0a 100%);
    box-shadow: 0 0 24px rgba(0,0,0,.65), inset 0 0 8px rgba(0,0,0,.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    z-index: 2;
}
.spine-line {
    width: 2px;
    height: 40px;
    background: rgba(255,210,120,.18);
    border-radius: 1px;
}

/* ══ Mobile ══ */
@media (max-width: 768px) {
    .recipe-book    { display: block; box-shadow: none; border-radius: 0; }
    .book-cover     { display: none; }
    .book-spine     { display: none; }
    .book-spread    { display: block; }
    .book-page      { background: transparent; padding: 0; min-height: unset; box-shadow: none; gap: 1rem; }
    .book-page::before { display: none; }
    .book-page--right  { margin-top: 2rem; }
    .page-header       { display: none; }
    .page-footer-rule  { display: none; }
    .page-spacer       { display: none; }
}
</style>
