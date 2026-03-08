<template>
    <RouterLink class="recipe-card" :to="{ name: 'recipe-detail', params: { id: recipe.id } }">
        <div>
            <span>{{ recipe.authorAvatar }}</span>
            <span>{{ recipe.authorName }}</span>
            <span>{{ timeAgo }}</span>
        </div>

        <h2>{{ recipe.title }}</h2>
        <p>{{ recipe.description }}</p>

        <div>
            <!-- This should be a tag -->
            <span>{{ recipe.category }}</span>
        </div>
        <span>♥ {{ recipe.likes }}</span>
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
const timeAgo = useTimeAgo(computed(() => props.recipe.createdAt))
</script>
