<template>
    <RouterLink class="book-recipe-card" :to="{ name: 'recipe-detail', params: { id: recipe.id } }">
        <div class="brc-image-wrap">
            <img
                v-if="recipe.images[0].path"
                :src="recipe.images[0].path"
                :alt="recipe.title"
                class="brc-image"
                :loading="priority ? 'eager' : 'lazy'"
                :fetchpriority="priority ? 'high' : 'auto'"
                width="400"
                height="300"
            />
            <div v-else class="brc-image-ph">
                <span>{{ categoryIcon }}</span>
            </div>
        </div>

        <div class="brc-body">
            <div class="brc-meta">
                <span class="brc-avatar">{{ recipe.author.avatar }}</span>
                <span class="brc-author">{{ recipe.author.name }}</span>
                <span class="brc-sep">·</span>
                <span class="brc-time">{{ timeAgo }}</span>
            </div>
            <h2 class="brc-title">{{ recipe.title }}</h2>
            <p class="brc-desc">{{ recipe.description }}</p>
            <div class="brc-foot">
                <span class="brc-cat">{{ recipe.category }}</span>
                <span class="brc-likes">♥ {{ recipe.likes_count }}</span>
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { useTimeAgo } from '../composables/useTimeAgo';

const props = defineProps({
    recipe:   { type: Object,  required: true },
    priority: { type: Boolean, default: false }, // true for first visible card (LCP)
});

const timeAgo = useTimeAgo(computed(() => props.recipe.created_at));

const CATEGORY_ICONS = {
    breakfast: '🍳', pasta: '🍝', soup: '🍲',
    salad: '🥗', meat: '🥩', dessert: '🍰',
    vegetarian: '🥦', other: '🍽',
};
const categoryIcon = computed(() => CATEGORY_ICONS[props.recipe.category] ?? '🍽');

console.log(props.recipe);
</script>

<style scoped>
.book-recipe-card {
    display: flex !important;
    flex-direction: row !important;
    background: #fffdf4 !important;
    border: 1px solid #d4a85438 !important;
    border-radius: 4px !important;
    border-top: none !important;
    overflow: hidden !important;
    text-decoration: none !important;
    cursor: pointer !important;
    padding: 0 !important;
    transform: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,.1) !important;
    transition: transform .18s ease, box-shadow .18s ease !important;
    flex: 1 !important;        /* fill exactly half page height */
    min-height: 0 !important; /* let flex do the sizing */
}
.book-recipe-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,.18) !important;
    border-color: #c9a03d66 !important;
}

/* Image on the left, fixed width, stretches full card height */
.brc-image-wrap {
    width: 40%;
    flex-shrink: 0;
    overflow: hidden;
    background: linear-gradient(135deg, #3a2810, #5a3e20);
    /* No aspect-ratio — height driven by card flex */
}
.brc-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    transition: transform .35s ease;
}
.book-recipe-card:hover .brc-image {
    transform: scale(1.05);
}
.brc-image-ph {
    width: 100%; height: 100%;
    min-height: 160px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.4rem;
}

/* Text on the right */
.brc-body {
    flex: 1;
    padding: .85rem 1rem .9rem;
    display: flex;
    flex-direction: column;
    gap: .22rem;
    position: relative;
}
.brc-body::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(transparent, transparent 22px, #d4a85412 23px);
}

.brc-meta {
    display: flex;
    align-items: center;
    gap: .28rem;
    font-size: .7rem;
}
.brc-avatar  { font-size: .82rem; }
.brc-author  { color: #6b4f2f; font-weight: 600; font-size: .7rem; }
.brc-sep,
.brc-time    { color: #a08060; font-size: .7rem; }

.brc-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    line-height: 1.25;
    color: #2c1e0e;
    letter-spacing: -.01em;
    text-shadow: none;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.brc-desc {
    font-size: .78rem;
    color: #7a5a35;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1; /* push footer to bottom */
}

.brc-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: .4rem;
}
.brc-cat {
    font-size: .65rem;
    background: #8b6b4115;
    color: #8b6b41;
    padding: 2px 9px;
    border-radius: 20px;
    border: 1px solid #b78c5a44;
    text-transform: uppercase;
    letter-spacing: .05em;
}
.brc-likes { color: #b86b3f; font-size: .75rem; }

/* Mobile: vertical stack */
@media (max-width: 680px) {
    .book-recipe-card {
        flex-direction: column !important;
        min-height: unset !important;
    }
    .brc-image-wrap {
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
    }
    .brc-body {
        padding: .7rem .85rem .85rem !important;
    }
    .brc-title { font-size: .95rem !important; }
    .brc-desc  { -webkit-line-clamp: 2 !important; }
}
</style>
