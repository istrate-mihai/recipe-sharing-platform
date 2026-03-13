<template>
    <div>
        <h1>Recipes worth cooking</h1>
        <p>A minimalistic recipe sharing platform for curious gourmets.</p>
    </div>

    <div>
        <input
            v-model="recipesStore.search"
            placeholder="Search recipes..."
            type="text"
            class="search-input"
        />

        <div class="filter-bar">
            <button
                @click="recipesStore.activeTag = ''"
                :class="{ active: recipesStore.activeTag === '' }"
            >All</button>

            <button
                v-for="category in recipesStore.categories"
                :key="category"
                @click="recipesStore.activeTag = category"
                :class="{ active: recipesStore.activeTag === category }"
            >
                {{ category }}
            </button>
        </div>

        <div v-if="recipesStore.isLoading" class="loading">
            Loading recipes…
        </div>

        <div v-else-if="recipesStore.error" class="error-msg">
            {{ recipesStore.error }}
        </div>

        <div v-else-if="recipesStore.filtered.length === 0">
            No recipes match your search.
        </div>

        <div v-else>
            <RecipeCard v-for="recipe in recipesStore.filtered" :key="recipe.id" :recipe="recipe" />
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRecipesStore } from '../stores/recipes';
import RecipeCard from '../components/RecipeCard.vue';

const recipesStore = useRecipesStore();

onMounted(() => {
    recipesStore.fetchRecipes();
});
</script>
