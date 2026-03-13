<template>
    <RouterLink class="recipe-card" :to="{ name: 'recipe-detail', params: { id: recipe.id } }">
        <div class="card-image-wrap">
            <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" class="card-image" />
            <div v-else class="card-image-placeholder">
                <span class="placeholder-icon">{{ categoryIcon }}</span>
            </div>
        </div>

        <div class="card-body">
            <div class="card-meta">
                <span class="card-avatar">{{ recipe.author.avatar }}</span>
                <span class="card-author">{{ recipe.author.name }}</span>
                <span class="card-sep">·</span>
                <span class="card-time">{{ timeAgo }}</span>
            </div>

            <h2>{{ recipe.title }}</h2>
            <p>{{ recipe.description }}</p>

            <div class="card-footer">
                <span class="card-category">{{ recipe.category }}</span>
                <span class="card-likes">♥ {{ recipe.likes_count }}</span>
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { useTimeAgo } from '../composables/useTimeAgo';

const props = defineProps({
    recipe: {
        type: Object,
        required: true,
    }
});

const timeAgo = useTimeAgo(computed(() => props.recipe.created_at));

const CATEGORY_ICONS = {
    breakfast: '🍳', pasta: '🍝', soup: '🍲',
    salad: '🥗', meat: '🥩', dessert: '🍰',
    vegetarian: '🥦', other: '🍽',
};
const categoryIcon = computed(() => CATEGORY_ICONS[props.recipe.category] ?? '🍽');
</script>

<style scoped>
.card-image-wrap { width: 100%; height: 180px; overflow: hidden; border-radius: 12px 12px 0 0; flex-shrink: 0; }
.card-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-image-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #3a2810 0%, #5a3e20 50%, #3a2810 100%);
    font-size: 4rem;
}
.card-body  { padding: 1rem 1.2rem 1.2rem; }
.card-meta  { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; }
.card-sep   { color: #a08060; font-size: 0.8rem; }
.card-time  { color: #a08060; font-size: 0.85rem; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; }
.card-category { font-size: 0.8rem; background: #8b6b4130; color: #c9a03d; padding: 2px 10px; border-radius: 20px; }
.card-likes { color: #a08060; font-size: 0.9rem; }
</style>
