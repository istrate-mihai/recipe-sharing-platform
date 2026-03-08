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
      <h2>Your Recipes <span class="count">{{ myRecipes.length }}</span></h2>

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
            <span>♥ {{ recipe.likes }}</span>
            <button class="del-btn" @click="deleteRecipe(recipe.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRecipesStore } from '../stores/recipes';

const auth = useAuthStore();
const recipesStore = useRecipesStore();

const myRecipes = computed(() => {
    return recipesStore.recipes.filter(r => r.authorId === auth.user.id);
});

function deleteRecipe(id) {
    if (confirm('Delete recipe')) recipesStore.deleteRecipe(id);
}
</script>
