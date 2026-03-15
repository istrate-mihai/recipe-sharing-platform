<template>
    <div>
        <button class="back" @click="router.back()">← Back</button>

        <div v-if="isLoading" class="loading">Loading…</div>
        <div v-else-if="!recipe" class="empty">Recipe not found.</div>

        <article v-else class="recipe">

            <!-- Image -->
            <div class="recipe-image-wrap" @click="imageModalOpen = true" :class="{ clickable: recipe.image_url }">
                <img
                    v-if="recipe.image_url"
                    :src="recipe.image_url"
                    :alt="recipe.title"
                    class="recipe-image"
                />
                <div v-else class="recipe-image-placeholder">
                    <span>{{ categoryIcon }}</span>
                    <p>{{ recipe.title }}</p>
                </div>
                <div v-if="recipe.image_url" class="zoom-hint">🔍 tap to expand</div>
            </div>

            <!-- Image lightbox modal -->
            <Teleport to="body">
                <div v-if="imageModalOpen" class="lightbox" @click.self="imageModalOpen = false">
                    <button class="lightbox-close" @click="imageModalOpen = false">✕</button>
                    <img :src="recipe.image_url" :alt="recipe.title" class="lightbox-img" />
                </div>
            </Teleport>

            <header class="recipe-header">
                <h1>{{ recipe.title }}</h1>
                <div class="meta">
                    <span class="avatar">{{ recipe.author.avatar }}</span>
                    <div>
                        <div class="author-name">{{ recipe.author.name }}</div>
                        <div class="date">{{ timeAgo }} · {{ formattedDate }}</div>
                    </div>
                </div>
            </header>

            <div class="body">
                <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
            </div>

            <div class="ingredients-grid">
                <span>Ingredients Needed</span>
                <p v-for="(ingredient, i) in recipe.ingredients" :key="i" class="ingredient-item">
                    <span>{{ ingredient.name }}</span>
                    <span>{{ ingredient.amount }}</span>
                </p>
            </div>

            <div class="steps-list">
                <span>Cooking Steps</span>
                <p v-for="(step, i) in recipe.steps" :key="i" class="step-item">
                    <span>Step {{ i + 1 }}. {{ step }}</span>
                </p>
            </div>

            <footer class="recipe-footer">
                <button class="like-btn" @click="handleLike" :class="{ liked: recipe.is_liked }">
                    {{ recipe.is_liked ? '♥' : '♡' }} {{ recipe.likes_count }}
                </button>

                <button
                    v-if="auth.isLoggedIn"
                    class="like-btn"
                    @click="handleFavourite"
                    :class="{ liked: recipe.is_favourited }"
                >
                    {{ recipe.is_favourited ? '★' : '☆' }} Favourite
                </button>

                <div v-if="recipe.is_owner" class="owner-actions">
                    <RouterLink
                        :to="{ name: 'edit-recipe', params: { id: recipe.id } }"
                        class="edit-btn"
                    >Edit recipe</RouterLink>
                    <button class="delete-btn" @click="showDeleteModal = true">Delete recipe</button>
                </div>
            </footer>

            <ConfirmModal
                v-model="showDeleteModal"
                title="Delete this recipe?"
                message="This will permanently remove the recipe from the pantry. There's no going back."
                confirmLabel="Delete it"
                @confirm="handleDelete"
            />
        </article>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@unhead/vue/legacy';
import { useRecipesStore } from '../stores/recipes';
import { useAuthStore } from '../stores/auth';
import { useTimeAgo } from '../composables/useTimeAgo';
import ConfirmModal from '../components/ConfirmModal.vue';

const route   = useRoute();
const router  = useRouter();
const recipes = useRecipesStore();
const auth    = useAuthStore();

const recipe          = ref(null);
const showDeleteModal = ref(false);
const isLoading       = ref(true);
const imageModalOpen  = ref(false);

onMounted(async () => {
    recipe.value    = await recipes.getById(route.params.id);
    isLoading.value = false;
});

// Close lightbox on Escape key
function onKeydown(e) {
    if (e.key === 'Escape') imageModalOpen.value = false;
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

// Lock body scroll when lightbox is open
import { watch } from 'vue';
watch(imageModalOpen, (val) => {
    document.body.style.overflow = val ? 'hidden' : '';
});

useHead(computed(() => {
    if (!recipe.value) return { title: 'Recipe | Recipe Sharing Platform' };

    const title       = `${recipe.value.title} | Recipe Sharing Platform`;
    const description = recipe.value.description
        ? recipe.value.description.slice(0, 155).replace(/\n/g, ' ') + '…'
        : `A delicious ${recipe.value.category} recipe shared on Recipe Sharing Platform.`;
    const image = recipe.value.image_url ?? 'https://recipe-sharing-platform.com/og-default.jpg';
    const url   = `https://recipe-sharing-platform.com/recipe/${recipe.value.id}`;

    return {
        title,
        meta: [
            { name: 'description',        content: description },
            { property: 'og:title',       content: title },
            { property: 'og:description', content: description },
            { property: 'og:image',       content: image },
            { property: 'og:url',         content: url },
            { property: 'og:type',        content: 'article' },
            { property: 'og:site_name',   content: 'Recipe Sharing Platform' },
            { name: 'twitter:card',        content: 'summary_large_image' },
            { name: 'twitter:title',       content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image',       content: image },
        ],
    };
}));

const timeAgo = useTimeAgo(computed(() => recipe.value?.created_at));

const formattedDate = computed(() => {
    if (!recipe.value) return '';
    return new Date(recipe.value.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
});

const CATEGORY_ICONS = {
    breakfast: '🍳', pasta: '🍝', soup: '🍲',
    salad: '🥗', meat: '🥩', dessert: '🍰',
    vegetarian: '🥦', other: '🍽',
};
const categoryIcon = computed(() => CATEGORY_ICONS[recipe.value?.category] ?? '🍽');
const paragraphs   = computed(() => recipe.value?.description.split('\n').filter(Boolean) ?? []);

async function handleLike() {
    if (!auth.isLoggedIn) return router.push({ name: 'login' });
    const updated = await recipes.likeRecipe(recipe.value.id);
    recipe.value  = { ...recipe.value, is_liked: updated.liked, likes_count: updated.likes_count };
}

async function handleFavourite() {
    const updated = await recipes.favouriteRecipe(recipe.value.id);
    recipe.value  = { ...recipe.value, is_favourited: updated.favourited };
}

async function handleDelete() {
    await recipes.deleteRecipe(recipe.value.id);
    router.push({ name: 'home' });
}
</script>

<style scoped>
/* ── Narrower card ── */
.recipe {
    max-width: 780px;
    margin: 0 auto;
}

/* ── Image: full aspect ratio, no crop ── */
.recipe-image-wrap {
    width: 100%;
    border-radius: 16px;
    margin-bottom: 2rem;
    overflow: hidden;
    position: relative;
    background: #2b1b0e;
    line-height: 0; /* kills phantom gap below img */
}
.recipe-image-wrap.clickable {
    cursor: zoom-in;
}
.recipe-image {
    width: 100%;
    height: auto;        /* natural height — no crop at all */
    display: block;
    border-radius: 16px;
    transition: transform 0.25s ease;
}
.recipe-image-wrap.clickable:hover .recipe-image {
    transform: scale(1.015);
}
.zoom-hint {
    position: absolute;
    bottom: 0.8rem;
    right: 1rem;
    background: #00000070;
    color: #fbe9c3;
    font-size: 0.8rem;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
}
.recipe-image-wrap.clickable:hover .zoom-hint {
    opacity: 1;
}

.recipe-image-placeholder {
    width: 100%; height: 260px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
    background: linear-gradient(135deg, #3a2810 0%, #5a3e20 50%, #3a2810 100%);
    font-size: 5rem; border-radius: 16px;
}
.recipe-image-placeholder p { color: #c9a03d; font-size: 1.2rem; margin: 0; opacity: 0.7; }

/* ── Lightbox ── */
.lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.88);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fadeIn 0.18s ease;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
.lightbox-img {
    max-width: 100%;
    max-height: 90vh;
    width: auto;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    object-fit: contain;
    animation: zoomIn 0.2s ease;
}
@keyframes zoomIn {
    from { transform: scale(0.93); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
}
.lightbox-close {
    position: fixed;
    top: 1.2rem;
    right: 1.4rem;
    background: #fbe9c380;
    border: none;
    color: #2c1e0e;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    transition: background 0.15s;
    z-index: 1001;
    padding: 0;
}
.lightbox-close:hover {
    background: #fbe9c3;
    transform: none;
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
}

/* ── Owner actions ── */
.owner-actions { display: flex; gap: 0.8rem; align-items: center; }
.edit-btn {
    padding: 0.5rem 1.4rem;
    border-radius: 60px;
    background: #c9a03d;
    color: #2b1b0e;
    font-weight: 600;
    text-decoration: none;
    font-size: 0.95rem;
    box-shadow: 0 4px 0 #8b6b1f;
    transition: transform 0.1s;
}
.edit-btn:hover  { transform: translateY(-1px); }
.edit-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #8b6b1f; }

/* ── Mobile ── */
@media (max-width: 640px) {
    .recipe-image-placeholder { height: 180px; font-size: 3.5rem; }
    .lightbox { padding: 0.75rem; }
    .lightbox-img { border-radius: 8px; }
    .lightbox-close { top: 0.8rem; right: 0.8rem; width: 2.4rem; height: 2.4rem; font-size: 1rem; }
    /* always show zoom hint on touch */
    .zoom-hint { opacity: 1; }

    /* footer buttons: all same width, stacked */
    .recipe-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.8rem;
    }
    .recipe-footer .like-btn,
    .recipe-footer .owner-actions,
    .recipe-footer .owner-actions .edit-btn,
    .recipe-footer .owner-actions .delete-btn {
        width: 100%;
        text-align: center;
        justify-content: center;
        box-sizing: border-box;
    }
    .owner-actions {
        flex-direction: column;
        gap: 0.8rem;
    }
}
</style>
