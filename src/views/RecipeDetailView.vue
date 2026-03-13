<template>
    <div>
        <button class="back" @click="router.back()">← Back</button>

        <div v-if="isLoading" class="loading">Loading…</div>
        <div v-else-if="!recipe" class="empty">Recipe not found.</div>

        <article v-else class="recipe">
            <div class="recipe-image-wrap">
                <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" class="recipe-image" />
                <div v-else class="recipe-image-placeholder">
                    <span>{{ categoryIcon }}</span>
                    <p>{{ recipe.title }}</p>
                </div>
            </div>

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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
const isLoading = ref(true);

onMounted(async () => {
    recipe.value    = await recipes.getById(route.params.id);
    isLoading.value = false;
});

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

const paragraphs = computed(() =>
    recipe.value?.description.split('\n').filter(Boolean) ?? []
);

async function handleLike() {
    if (!auth.isLoggedIn) return router.push({ name: 'login' });
    const updated = await recipes.likeRecipe(recipe.value.id);
    recipe.value = {
        ...recipe.value,
        is_liked:    updated.liked,
        likes_count: updated.likes_count,
    };
}

async function handleFavourite() {
    const updated = await recipes.favouriteRecipe(recipe.value.id);
    recipe.value = {
        ...recipe.value,
        is_favourited: updated.favourited,
    };
}

async function handleDelete() {
    await recipes.deleteRecipe(recipe.value.id);
    router.push({ name: 'home' });
}
</script>

<style scoped>
.recipe-image-wrap { width: 100%; height: 320px; overflow: hidden; border-radius: 16px; margin-bottom: 2rem; }
.recipe-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.recipe-image-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
    background: linear-gradient(135deg, #3a2810 0%, #5a3e20 50%, #3a2810 100%);
    font-size: 5rem;
}
.recipe-image-placeholder p { color: #c9a03d; font-size: 1.2rem; margin: 0; opacity: 0.7; }
</style>

<style scoped>
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
.edit-btn:hover { transform: translateY(-1px); }
.edit-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #8b6b1f; }
</style>
