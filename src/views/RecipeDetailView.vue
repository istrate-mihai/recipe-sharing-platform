<template>
    <div>
        <button class="back" @click="router.back()">← Back</button>

        <!-- ══ Loading: open book with oven in center ══ -->
        <div v-if="isLoading" class="loading-book">
            <div class="recipe-book-cover recipe-book-cover--left"></div>
            <div class="loading-spread">
                <div class="loading-page loading-page--left"></div>
                <div class="recipe-book-spine">
                    <div class="rspine-line"></div>
                    <div class="rspine-line"></div>
                    <div class="rspine-line"></div>
                </div>
                <div class="loading-page loading-page--right"></div>
                <!-- Oven centered over the spine -->
                <div class="loading-oven">
                    <div class="oven-body">
                        <div class="oven-window">
                            <div class="oven-glow"></div>
                            <div class="oven-rack"></div>
                            <div class="oven-heat-bar"></div>
                            <div class="oven-heat-bar" style="animation-delay:.3s"></div>
                            <div class="oven-heat-bar" style="animation-delay:.6s"></div>
                        </div>
                        <div class="oven-knobs">
                            <div class="oven-knob"></div>
                            <div class="oven-knob oven-knob--on"></div>
                            <div class="oven-knob"></div>
                        </div>
                    </div>
                    <div class="oven-steam">
                        <span class="steam-puff"></span>
                        <span class="steam-puff" style="animation-delay:.4s"></span>
                        <span class="steam-puff" style="animation-delay:.8s"></span>
                    </div>
                    <p class="oven-label">Heating up recipe…</p>
                </div>
            </div>
            <div class="recipe-book-cover recipe-book-cover--right"></div>
        </div>

        <div v-else-if="!recipe" class="empty">
            <p>This recipe doesn't exist or isn't available.</p>
            <button class="back" @click="router.push({ name: 'home' })">← Back to recipes</button>
        </div>

        <!-- ══ DESKTOP: open book layout ══ -->
        <article v-else class="recipe">

            <!-- ── Book wrapper (desktop only) ── -->
            <div class="recipe-book">
                <div class="recipe-book-cover recipe-book-cover--left"></div>

                <div class="recipe-book-spread">

                    <!-- ════ LEFT PAGE ════ -->
                    <div class="recipe-page recipe-page--left">
                        <div class="rpage-header">
                            <span class="rpage-chapter">{{ recipe.category }}</span>
                            <span class="rpage-num">p. 1</span>
                        </div>

                        <!-- Image: top half -->
                        <div
                            class="rpage-image-wrap"
                            @click="imageModalOpen = true"
                            :class="{ clickable: recipe.image_url }"
                        >
                            <img
                                v-if="recipe.image_url"
                                :src="recipe.image_url"
                                :alt="recipe.title"
                                class="rpage-image"
                                fetchpriority="high"
                                width="600" height="400"
                            />
                            <div v-else class="rpage-image-ph">
                                <span>{{ categoryIcon }}</span>
                            </div>
                            <div v-if="recipe.image_url" class="zoom-hint">🔍 click to expand</div>
                        </div>

                        <!-- Author + title under image -->
                        <div class="rpage-title-block">
                            <div class="rpage-meta">
                                <span class="rpage-avatar">{{ recipe.author.avatar }}</span>
                                <div>
                                    <div class="rpage-author">{{ recipe.author.name }}</div>
                                    <div class="rpage-date">{{ timeAgo }} · {{ formattedDate }}</div>
                                </div>
                            </div>
                            <h1 class="rpage-title">{{ recipe.title }}</h1>
                        </div>

                        <!-- Description -->
                        <div class="rpage-description">
                            <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
                        </div>

                        <!-- Ingredients -->
                        <div class="rpage-ingredients">
                            <h3 class="rpage-section-title">Ingredients</h3>
                            <ul class="ingredients-list">
                                <li
                                    v-for="(ingredient, i) in recipe.ingredients"
                                    :key="i"
                                    class="ingredient-row"
                                >
                                    <span class="ing-name">{{ ingredient.name }}</span>
                                    <span class="ing-dots"></span>
                                    <span class="ing-amount">{{ ingredient.amount }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- ── Spine ── -->
                    <div class="recipe-book-spine">
                        <div class="rspine-line"></div>
                        <div class="rspine-line"></div>
                        <div class="rspine-line"></div>
                    </div>

                    <!-- ════ RIGHT PAGE ════ -->
                    <div class="recipe-page recipe-page--right">
                        <div class="rpage-header rpage-header--right">
                            <span class="rpage-num">p. 2</span>
                            <span class="rpage-chapter">Cooking Steps</span>
                        </div>

                        <!-- Steps -->
                        <div class="rpage-steps">
                            <h3 class="rpage-section-title">Method</h3>
                            <ul class="steps-list">
                                <li
                                    v-for="(step, i) in recipe.steps"
                                    :key="i"
                                    class="step-item"
                                >
                                    <span class="step-num">{{ i + 1 }}</span>
                                    <p class="step-text">{{ step }}</p>
                                </li>
                            </ul>
                        </div>

                        <!-- Spacer pushes footer to bottom -->
                        <div class="rpage-spacer"></div>

                        <!-- Action buttons — all in one row -->
                        <footer class="rpage-footer">
                            <button class="action-btn action-btn--like" @click="handleLike" :class="{ liked: recipe.is_liked }">
                                {{ recipe.is_liked ? '♥' : '♡' }} {{ recipe.likes_count }}
                            </button>

                            <button
                                v-if="auth.isLoggedIn"
                                class="action-btn action-btn--fav"
                                @click="handleFavourite"
                                :class="{ liked: recipe.is_favourited }"
                            >{{ recipe.is_favourited ? '★' : '☆' }} Favourite</button>

                            <button
                                v-if="isPremium"
                                class="action-btn action-btn--pdf"
                                @click="handleExportPdf"
                            >⬇ Recipe Card</button>

                            <RouterLink
                                v-if="recipe.is_owner"
                                :to="{ name: 'edit-recipe', params: { id: recipe.id } }"
                                class="action-btn action-btn--edit"
                            >Edit</RouterLink>

                            <button
                                v-if="recipe.is_owner"
                                class="action-btn action-btn--delete"
                                @click="showDeleteModal = true"
                            >Delete</button>
                        </footer>

                        <!-- Page footer line -->
                        <div class="rpage-footer-line"></div>
                    </div>
                </div>

                <div class="recipe-book-cover recipe-book-cover--right"></div>
            </div>

            <!-- Image lightbox -->
            <Teleport to="body">
                <div v-if="imageModalOpen" class="lightbox" @click.self="imageModalOpen = false">
                    <button class="lightbox-close" @click="imageModalOpen = false">✕</button>
                    <img :src="recipe.image_url" :alt="recipe.title" class="lightbox-img" />
                </div>
            </Teleport>

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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@unhead/vue/legacy';
import { useRecipesStore } from '../stores/recipes';
import { useAuthStore } from '../stores/auth';
import { useTimeAgo } from '../composables/useTimeAgo';
import { usePlan } from '../composables/usePlan';
import ConfirmModal from '../components/ConfirmModal.vue';

const route         = useRoute();
const router        = useRouter();
const recipes       = useRecipesStore();
const auth          = useAuthStore();
const { isPremium } = usePlan();

const recipe          = ref(null);
const showDeleteModal = ref(false);
const isLoading       = ref(true);
const imageModalOpen  = ref(false);

onMounted(async () => {
    try {
        recipe.value = await recipes.getById(route.params.id);
    }
    catch (err) {
        recipe.value = null;
    }
    isLoading.value = false;
});

function onKeydown(e) { if (e.key === 'Escape') imageModalOpen.value = false; }
onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

watch(imageModalOpen, (val) => { document.body.style.overflow = val ? 'hidden' : ''; });

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

const timeAgo       = useTimeAgo(computed(() => recipe.value?.created_at));
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

    auth.decrementRecipeCount();

    router.push({ name: 'home' });
}

async function handleExportPdf() {
    const token = localStorage.getItem('token');
    const res   = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.recipe-sharing-platform.com/api'}/recipes/${recipe.value.id}/export-pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) { alert('Could not generate PDF.'); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = recipe.value.title.toLowerCase().replace(/\s+/g, '-') + '-recipe-card.pdf';
    a.click();
    URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* ══════════════════════════════════════
   LOADING: book shell with oven
   ══════════════════════════════════════ */
.loading-book {
    display: flex;
    align-items: stretch;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 520px;
}

.loading-spread {
    display: flex;
    flex: 1;
    position: relative;
}

.loading-page {
    flex: 1;
    background: #fef7e9;
    min-height: 520px;
    position: relative;
}
.loading-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(transparent, transparent 32px, #d4a85410 33px);
    pointer-events: none;
}
.loading-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.07); }
.loading-page--right { box-shadow: inset 8px 0 20px rgba(0,0,0,.07); }

/* Oven centered over the spine */
.loading-oven {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .8rem;
    z-index: 10;
}

/* ── Oven body ── */
.oven-body {
    width: 130px;
    background: #3a2510;
    border: 3px solid #6b4020;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,.45), inset 0 2px 4px rgba(0,0,0,.3);
}
.oven-window {
    width: 100%;
    height: 80px;
    background: #1a0f06;
    border: 2px solid #4a2e10;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;
}
.oven-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 80%, #f97316 0%, #c2410c 35%, transparent 70%);
    animation: ovenPulse 1.8s ease-in-out infinite;
}
@keyframes ovenPulse {
    0%, 100% { opacity: .55; }
    50%       { opacity: 1;   }
}
.oven-rack {
    position: absolute;
    top: 50%;
    left: 6px; right: 6px;
    height: 2px;
    background: repeating-linear-gradient(90deg, #6b4020 0, #6b4020 6px, transparent 6px, transparent 10px);
    transform: translateY(-50%);
    opacity: .7;
}
.oven-heat-bar {
    position: absolute;
    bottom: 6px;
    left: 10%;
    width: 80%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #f97316aa, #fb923ccc, #f97316aa, transparent);
    border-radius: 2px;
    animation: heatRise 1.2s ease-in-out infinite;
}
.oven-heat-bar:nth-child(3) { bottom: 16px; left: 20%; width: 60%; }
.oven-heat-bar:nth-child(4) { bottom: 26px; left: 30%; width: 40%; }
@keyframes heatRise {
    0%   { opacity: 0;   transform: scaleX(.8) translateY(0); }
    40%  { opacity: 1;   transform: scaleX(1)  translateY(-2px); }
    100% { opacity: 0;   transform: scaleX(.6) translateY(-8px); }
}
.oven-knobs {
    display: flex;
    justify-content: space-around;
}
.oven-knob {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #8b6b41, #3a2010);
    border: 2px solid #6b4020;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.4);
}
.oven-knob--on {
    background: radial-gradient(circle at 35% 35%, #f97316, #c2410c);
    box-shadow: 0 0 8px #f9731680, inset 0 1px 2px rgba(0,0,0,.3);
    animation: knobGlow 1.8s ease-in-out infinite;
}
@keyframes knobGlow {
    0%, 100% { box-shadow: 0 0 4px #f9731660; }
    50%       { box-shadow: 0 0 14px #f97316cc; }
}

/* Steam */
.oven-steam {
    display: flex;
    gap: 14px;
    align-items: flex-end;
    height: 40px;
}
.steam-puff {
    display: block;
    width: 10px;
    height: 32px;
    background: linear-gradient(180deg, transparent 0%, #d4a85430 40%, #d4a85460 100%);
    border-radius: 50% 50% 30% 30%;
    animation: steamRise 2s ease-in-out infinite;
    transform-origin: bottom center;
}
@keyframes steamRise {
    0%   { transform: translateY(0) scaleX(1);    opacity: 0; }
    20%  { opacity: .7; }
    80%  { opacity: .4; }
    100% { transform: translateY(-50px) scaleX(1.5); opacity: 0; }
}

.oven-label {
    font-family: 'Playfair Display', serif;
    font-size: .82rem;
    color: #a08060;
    font-style: italic;
    letter-spacing: .04em;
}

/* ══════════════════════════════════════
   DESKTOP: open book layout
   ══════════════════════════════════════ */
.recipe-book {
    display: flex;
    align-items: stretch;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    max-width: 1200px;
    margin: 0 auto;
}

.recipe-book-cover {
    width: 24px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.recipe-book-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 10px rgba(0,0,0,.5); }
.recipe-book-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset 4px 0 10px rgba(0,0,0,.5); }

.recipe-book-spread {
    display: flex;
    flex: 1;
}

/* ── Pages ── */
.recipe-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;
    min-height: 700px;
    overflow: hidden;
}
.recipe-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(transparent, transparent 32px, #d4a85410 33px);
    background-attachment: local;
}
.recipe-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.07); }
.recipe-page--right { box-shadow: inset 8px 0 20px rgba(0,0,0,.07); }

.rpage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Playfair Display', serif;
    font-size: .7rem;
    color: #a08060;
    text-transform: uppercase;
    letter-spacing: .1em;
    border-bottom: 1px solid #c9a03d55;
    padding-bottom: .6rem;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

/* ── Image: top ~42% of left page ── */
.rpage-image-wrap {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    background: #2b1b0e;
    flex-shrink: 0;
    cursor: zoom-in;
    z-index: 1;
}
.rpage-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .28s ease;
}
.rpage-image-wrap:hover .rpage-image { transform: scale(1.025); }
.rpage-image-ph {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 4rem;
    background: linear-gradient(135deg, #3a2810, #5a3e20);
}
.zoom-hint {
    position: absolute;
    bottom: .7rem; right: .9rem;
    background: #00000070;
    color: #fbe9c3;
    font-size: .72rem;
    padding: .2rem .65rem;
    border-radius: 20px;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s;
}
.rpage-image-wrap:hover .zoom-hint { opacity: 1; }

/* ── Title block ── */
.rpage-title-block {
    display: flex;
    flex-direction: column;
    gap: .4rem;
    position: relative;
    z-index: 1;
}
.rpage-meta {
    display: flex;
    align-items: center;
    gap: .6rem;
}
.rpage-avatar { font-size: 1rem; }
.rpage-author { font-size: .78rem; font-weight: 600; color: #6b4f2f; }
.rpage-date   { font-size: .7rem; color: #a08060; }
.rpage-title  {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    line-height: 1.2;
    color: #2c1e0e;
    margin: 0;
    text-shadow: none;
    letter-spacing: -.02em;
}

/* ── Description ── */
.rpage-description {
    font-size: .85rem;
    color: #5a3e20;
    line-height: 1.65;
    position: relative;
    z-index: 1;
}
.rpage-description p { margin-bottom: .5rem; }
.rpage-description p:last-child { margin-bottom: 0; }

/* ── Ingredients ── */
.rpage-ingredients {
    position: relative;
    z-index: 1;
    flex: 1; /* push to fill remaining left page */
}
.rpage-section-title {
    font-family: 'Playfair Display', serif;
    font-size: .9rem;
    color: #8b5a28;
    text-transform: uppercase;
    letter-spacing: .1em;
    margin-bottom: .7rem;
    padding-bottom: .35rem;
    border-bottom: 1px solid #c9a03d44;
    text-shadow: none;
}
.ingredients-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: .35rem;
}
.ingredient-row {
    display: flex;
    align-items: baseline;
    gap: .4rem;
    font-size: .82rem;
}
.ing-name   { color: #2c1e0e; font-weight: 600; white-space: nowrap; }
.ing-dots   {
    flex: 1;
    border-bottom: 1px dotted #b78c5a88;
    margin-bottom: .25rem;
    min-width: 16px;
}
.ing-amount { color: #7a5a35; white-space: nowrap; font-style: italic; }

/* ── Spine ── */
.recipe-book-spine {
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
.rspine-line {
    width: 2px;
    height: 40px;
    background: rgba(255,210,120,.18);
    border-radius: 1px;
}

/* ── Steps ── */
.rpage-steps {
    position: relative;
    z-index: 1;
    flex: 1;
}
.steps-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.step-item {
    display: flex;
    gap: .85rem;
    align-items: flex-start;
}
.step-num {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    /* Gold pin */
    background: radial-gradient(circle at 35% 30%, #e8c060, #c9a03d 50%, #a07828);
    color: #2c1e0e;
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Pin shadow — pressed into page */
    box-shadow: 0 2px 0 #7a5a00, 0 3px 8px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.35);
    margin-top: .15rem;
    position: relative;
}
/* Pin needle */
.step-num::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 6px;
    background: #8b6b41;
    border-radius: 0 0 2px 2px;
    opacity: .7;
}
.step-text {
    font-size: .83rem;
    color: #3a2810;
    line-height: 1.6;
    margin: 0;
}

.rpage-spacer { flex: 1; min-height: .5rem; }

/* ── Footer buttons — single row, equal width ── */
.rpage-footer {
    display: flex;
    flex-wrap: nowrap;
    gap: .55rem;
    align-items: center;
    position: relative;
    z-index: 1;
    padding-top: .8rem;
    border-top: 1px solid #c9a03d44;
}
.action-btn {
    flex: 1;
    padding: .48rem .4rem;
    border-radius: 60px;
    border: none;
    font-family: 'Playfair Display', serif;
    font-size: .8rem;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .1s, box-shadow .1s;
    white-space: nowrap;
}
.action-btn--like {
    background: #b35050;
    color: #fbe9c3;
    box-shadow: 0 3px 0 #7a2020;
}
.action-btn--like.liked { background: #8b2020; }
.action-btn--fav {
    background: #7a3535;
    color: #fbe9c3;
    box-shadow: 0 3px 0 #4a1515;
}
.action-btn--fav.liked { background: #5a1a1a; }
.action-btn--edit {
    background: #c9a03d;
    color: #2c1e0e;
    box-shadow: 0 3px 0 #8b6b1f;
}
.action-btn--delete {
    background: #6b2020;
    color: #fbe9c3;
    box-shadow: 0 3px 0 #3a0a0a;
}
.action-btn:hover  { transform: translateY(-1px); }
.action-btn:active { transform: translateY(2px); box-shadow: none; }
.rpage-footer-line {
    height: 1px;
    background: #c9a03d44;
    margin-top: .6rem;
}

/* ── Lightbox ── */
.lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.88);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fadeIn .18s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.lightbox-img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,.7);
    object-fit: contain;
    animation: zoomIn .2s ease;
}
@keyframes zoomIn {
    from { transform: scale(.93); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
}
.lightbox-close {
    position: fixed;
    top: 1.2rem; right: 1.4rem;
    background: #fbe9c380;
    border: none;
    color: #2c1e0e;
    width: 2.8rem; height: 2.8rem;
    border-radius: 50%;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(0,0,0,.4);
    transition: background .15s;
    z-index: 1001;
    padding: 0;
}
.lightbox-close:hover { background: #fbe9c3; }

/* ── Shared button styles ── */
.owner-actions { display: flex; gap: .7rem; align-items: center; }
.edit-btn {
    padding: .45rem 1.2rem;
    border-radius: 60px;
    background: #c9a03d;
    color: #2b1b0e;
    font-weight: 600;
    text-decoration: none;
    font-size: .88rem;
    box-shadow: 0 3px 0 #8b6b1f;
    transition: transform .1s;
    display: inline-block;
}
.edit-btn:hover  { transform: translateY(-1px); }
.edit-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #8b6b1f; }

.action-btn--pdf {
    background: #c9a84c;
    color: #3b2a1a;
    box-shadow: 0 4px 0 #7a6139;
}
.action-btn--pdf:hover {
    background: #e0c070;
    box-shadow: 0 2px 0 #7a6139;
}

/* ══════════════════════════════════════
   MOBILE: original single-column layout
   ══════════════════════════════════════ */
@media (max-width: 768px) {
    /* Unwrap the book — everything flows as a plain article */
    .recipe-book         { display: block; box-shadow: none; border-radius: 0; }
    .recipe-book-cover   { display: none; }
    .recipe-book-spine   { display: none; }
    .recipe-book-spread  { display: block; }

    .recipe-page {
        background: transparent;
        padding: 0;
        gap: 0;
        min-height: unset;
        box-shadow: none;
    }
    .recipe-page::before { display: none; }
    .recipe-page--right  { margin-top: 1.5rem; }

    .rpage-header        { display: none; }
    .rpage-footer-line   { display: none; }
    .rpage-spacer        { display: none; }

    /* Image: full width, natural ratio */
    .rpage-image-wrap {
        aspect-ratio: 16 / 9;
        border-radius: 14px;
        margin-bottom: 1.5rem;
    }
    .zoom-hint { opacity: 1; } /* always show on touch */

    /* Title */
    .rpage-title-block { margin-bottom: 1rem; }
    .rpage-title       { font-size: 2rem; }

    /* Description */
    .rpage-description { font-size: .92rem; margin-bottom: 1.5rem; }

    /* Ingredients */
    .rpage-ingredients { margin-bottom: 1.5rem; }
    .rpage-section-title { font-size: 1rem; }
    .ingredient-row    { font-size: .9rem; }

    /* Steps */
    .rpage-steps       { margin-bottom: 1.5rem; }
    .step-text         { font-size: .9rem; }
    .step-num          { width: 1.8rem; height: 1.8rem; font-size: .82rem; }

    /* Footer */
    .rpage-footer {
        flex-direction: column;
        align-items: stretch;
        gap: .8rem;
        padding-top: 1rem;
        border-top: 1px solid #c9a03d44;
        margin-bottom: 2rem;
    }
    .action-btn {
        flex: unset;
        width: 100%;
        padding: .6rem 1rem;
        font-size: .95rem;
    }

    /* Lightbox */
    .lightbox      { padding: .75rem; }
    .lightbox-img  { border-radius: 8px; }
    .lightbox-close { top: .8rem; right: .8rem; width: 2.4rem; height: 2.4rem; font-size: 1rem; }
}
</style>
