<template>
  <div>
    <button class="back" @click="router.back()">← Back</button>

    <div v-if="!recipe" class="empty">Recipe not found.</div>

    <article v-else class="recipe">
      <header class="recipe-header">
        <h1>{{ recipe.title }}</h1>

        <div class="meta">
          <span class="avatar">{{ recipe.authorAvatar }}</span>
          <div>
            <div class="author-name">{{ recipe.authorName }}</div>
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
        <button class="like-btn" @click="handleLike" :class="{ liked }">
          {{ liked ? '♥' : '♡' }} {{ recipe.likes }}
        </button>

        <!-- Only show delete button to the recipe's own author -->
        <button
          v-if="auth.user?.id === recipe.authorId"
          class="delete-btn"
          @click="handleDelete"
        >Delete recipe</button>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipesStore } from '../stores/recipes';
import { useAuthStore } from '../stores/auth';
import { useTimeAgo } from '../composables/useTimeAgo';

const route   = useRoute();
const router  = useRouter();
const recipes = useRecipesStore();
const auth    = useAuthStore();
const recipe  = computed(() => recipes.getById(route.params.id));
const timeAgo = useTimeAgo(computed(() => recipe.value?.createdAt));

const formattedDate = computed(() => {
    if (!recipe.value) return;
    return new Date(recipe.value.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
});

const paragraphs = computed(() => recipe.value?.description.split('\n').filter(Boolean) ?? []);

const liked = ref(false);
function handleLike() {
    if (liked.value) return;
    liked.value = true;
    recipes.likeRecipe(recipe.value.id);
}

function handleDelete() {
    if (!confirm('Delete this recipe')) return;
    recipes.deleteRecipe(recipe.value.id);
    router.push({name: 'home'});
}
</script>
