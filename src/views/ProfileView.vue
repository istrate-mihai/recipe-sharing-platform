<template>
    <div class="profile">
        <div class="profile-header">
            <div class="big-avatar">{{ auth.user.avatar }}</div>
            <div>
                <h1>{{ auth.user.name }}</h1>
                <p class="bio">{{ auth.user.bio }}</p>
                <p class="email">{{ auth.user.email }}</p>
            </div>
        </div>

        <div class="section">
            <div class="tabs">
                <button :class="{ active: tab === 'mine' }" @click="tab = 'mine'">
                    My Recipes <span class="count">{{ myRecipes.length }}</span>
                </button>
                <button :class="{ active: tab === 'favourites' }" @click="switchToFavourites">
                    Favourites <span class="count">{{ favourites.length }}</span>
                </button>
            </div>

            <div v-if="isLoading" class="loading">Loading…</div>

            <!-- My Recipes tab -->
            <template v-else-if="tab === 'mine'">
                <div v-if="myRecipes.length === 0" class="empty">
                    You haven't shared any recipes yet.
                    <RouterLink to="/add-recipe">Share your first recipe →</RouterLink>
                </div>
                <div v-else class="recipe-list">
                    <div v-for="recipe in myRecipes" :key="recipe.id" class="recipe-row">
                        <RouterLink :to="{ name: 'recipe-detail', params: { id: recipe.id } }" class="recipe-title">
                            {{ recipe.title }}
                        </RouterLink>
                        <div class="recipe-row-meta">
                            <span>♥ {{ recipe.likes_count }}</span>
                            <button class="del-btn" @click="deleteRecipe(recipe.id)">Delete</button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Favourites tab -->
            <template v-else>
                <div v-if="favourites.length === 0" class="empty">
                    You haven't favourited any recipes yet.
                    <RouterLink to="/">Browse recipes →</RouterLink>
                </div>
                <div v-else class="recipe-list">
                    <div v-for="recipe in favourites" :key="recipe.id" class="recipe-row">
                        <RouterLink :to="{ name: 'recipe-detail', params: { id: recipe.id } }" class="recipe-title">
                            {{ recipe.title }}
                        </RouterLink>
                        <div class="recipe-row-meta">
                            <span>♥ {{ recipe.likes_count }}</span>
                            <span class="author-meta">by {{ recipe.author.name }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <ConfirmModal
                v-model="showDeleteModal"
                title="Remove from the pantry?"
                message="Once deleted, this recipe is gone for good. Are you sure?"
                confirmLabel="Delete it"
                @confirm="confirmDelete"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRecipesStore } from '../stores/recipes';
import { favouritesApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal.vue';

const auth         = useAuthStore();
const recipesStore = useRecipesStore();
const tab             = ref('mine');
const showDeleteModal = ref(false);
const pendingDeleteId = ref(null);
const isLoading    = ref(false);
const favourites   = ref([]);

onMounted(async () => {
    isLoading.value = true;
    const [, favData] = await Promise.all([
        recipesStore.fetchRecipes(),
        favouritesApi.index(),
    ]);
    favourites.value = favData.data ?? favData;
    isLoading.value = false;
});

const myRecipes = computed(() =>
    recipesStore.recipes.filter(r => r.author?.id === auth.user.id)
);

function switchToFavourites() {
    tab.value = 'favourites';
}

function deleteRecipe(id) {
    pendingDeleteId.value = id;
    showDeleteModal.value = true;
}

async function confirmDelete() {
    await recipesStore.deleteRecipe(pendingDeleteId.value);
    pendingDeleteId.value = null;
}
</script>

<style scoped>
.section { margin-top: 2rem; }
.tabs { display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 2px solid #8b6b4160; padding-bottom: 0.5rem; }
.tabs button { background: none; border: none; font-size: 1rem; cursor: pointer; color: #d4b896; opacity: 0.5; padding: 0 0 6px 0; }
.tabs button.active { opacity: 1; color: #f0d9b5; font-weight: 700; border-bottom: 3px solid #c9a03d; margin-bottom: -3px; }
.tabs .count { font-size: 0.8rem; opacity: 0.8; }
.author-meta { color: #a08060; font-size: 0.85rem; }
</style>
