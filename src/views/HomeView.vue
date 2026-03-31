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

        <div class="mobile-filter-bar">
            <button
                v-for="tag in [...leftBookmarks, ...rightBookmarks]"
                :key="tag.value"
                class="mobile-filter-btn"
                :class="{ active: recipesStore.activeTag === tag.value }"
                @click="onTagChange(tag.value)"
            >{{ tag.label }}</button>
        </div>

        <div class="ad-slot ad-slot--top">
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>

        <div class="book-scene">
            <div class="book-cover book-cover--left"></div>

            <div class="book-spread">

                <!-- Bookmarks -->
                <div class="bookmarks bookmarks--left">
                    <button
                        v-for="tag in leftBookmarks"
                        :key="tag.value"
                        class="bookmark"
                        :class="{ active: recipesStore.activeTag === tag.value, pressing: pressingTag === tag.value }"
                        @mousedown="pressingTag = tag.value"
                        @mouseup="pressingTag = null"
                        @mouseleave="pressingTag = null"
                        @click="onTagChange(tag.value)"
                    >{{ tag.label }}</button>
                </div>
                <div class="bookmarks bookmarks--right">
                    <button
                        v-for="tag in rightBookmarks"
                        :key="tag.value"
                        class="bookmark"
                        :class="{ active: recipesStore.activeTag === tag.value, pressing: pressingTag === tag.value }"
                        @mousedown="pressingTag = tag.value"
                        @mouseup="pressingTag = null"
                        @mouseleave="pressingTag = null"
                        @click="onTagChange(tag.value)"
                    >{{ tag.label }}</button>
                </div>

                <!-- ── Oven: on book-spread so it spans BOTH pages, truly centered ── -->
                <Transition name="oven-fade">
                    <div v-if="recipesStore.isLoading && allRecipes.length === 0" class="oven-overlay">
                        <div class="oven-wrap">
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
                            <p class="oven-label">Heating up recipes…</p>
                        </div>
                    </div>
                </Transition>

                <!-- Left page -->
                <div class="book-page book-page--left">
                    <div class="page-header">
                        <span class="page-chapter">The Recipe Collection</span>
                        <span class="page-num">✦</span>
                    </div>
                    <div class="page-grid">
                        <TransitionGroup name="list-fade">
                            <RecipeCard
                                v-for="(recipe, idx) in leftPageRecipes"
                                :key="recipe.id"
                                :recipe="recipe"
                                :isNew="newRecipeIds.has(recipe.id)"
                                :style="{ '--delay': (idx * 0.1) + 's' }"
                            />
                        </TransitionGroup>
                        <div v-if="allRecipes.length === 0 && !recipesStore.isLoading" class="page-ghost"></div>
                    </div>
                </div>

                <!-- Spine -->
                <div class="book-spine">
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                </div>

                <!-- Right page -->
                <div class="book-page book-page--right">
                    <div class="page-header page-header--right">
                        <span class="page-num">✦</span>
                        <span class="page-chapter">Recipes worth cooking</span>
                    </div>
                    <div class="page-grid">
                        <TransitionGroup name="list-fade">
                            <RecipeCard
                                v-for="(recipe, idx) in rightPageRecipes"
                                :key="recipe.id"
                                :recipe="recipe"
                                :isNew="newRecipeIds.has(recipe.id)"
                                :style="{ '--delay': (idx * 0.1 + 0.05) + 's' }"
                            />
                        </TransitionGroup>
                        <div v-if="allRecipes.length === 0 && !recipesStore.isLoading" class="page-ghost"></div>
                    </div>
                </div>

            </div>

            <div class="book-cover book-cover--right"></div>
        </div>

        <div v-if="!recipesStore.isLoading && allRecipes.length === 0" class="no-results">
            No recipes match your search.
        </div>

        <div class="load-more-wrap" v-if="allRecipes.length > 0">
            <button v-if="recipesStore.hasMorePages && !recipesStore.isLoading" class="load-more-btn" @click="loadMore">
                Load More Recipes
            </button>
            <span v-if="recipesStore.isLoading && allRecipes.length > 0" class="load-more-spinner">
                Heating up more recipes…
            </span>
            <p v-if="!recipesStore.hasMorePages && !recipesStore.isLoading" class="all-loaded">
                ✦ You've reached the end of the cookbook ✦
            </p>
        </div>

        <div class="ad-slot ad-slot--bottom">
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRecipesStore } from '../stores/recipes';
import { useAuthStore } from '../stores/auth';
import RecipeCard from '../components/RecipeCard.vue';

const recipesStore = useRecipesStore();
const auth         = useAuthStore();
const pressingTag  = ref(null);
const newRecipeIds = ref(new Set());
let searchTimer    = null;

const leftBookmarks = [
    { value: '', label: 'All' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'soup', label: 'Soup' },
];
const rightBookmarks = [
    { value: 'salad', label: 'Salad' },
    { value: 'meat', label: 'Meat' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'vegetarian', label: 'Vegetarian' },
];

onMounted(() => recipesStore.fetchRecipes(1));

watch(() => recipesStore.search, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        recipesStore.fetchRecipes(1);
    }, 400); // wait 400ms after user stops typing
});

watch([() => recipesStore.activeTag, () => auth.isLoggedIn], () => {
    recipesStore.fetchRecipes(1);
});

const allRecipes      = computed(() => recipesStore.filtered);
const leftPageRecipes = computed(() => allRecipes.value.filter((_, i) => i % 2 === 0));
const rightPageRecipes= computed(() => allRecipes.value.filter((_, i) => i % 2 !== 0));

function onTagChange(tag) {
    recipesStore.activeTag = tag;
}

async function loadMore() {
    const before = new Set(allRecipes.value.map(r => r.id));
    await recipesStore.fetchNextPage();
    await nextTick();
    const fresh = new Set();
    allRecipes.value.forEach(r => {
        if (!before.has(r.id)) fresh.add(r.id);
    });
    newRecipeIds.value = fresh;
    setTimeout(() => { newRecipeIds.value = new Set(); }, 2000);
}
</script>

<style scoped>
/* ── Ads ── */
.ad-slot { width: 100%; min-height: 90px; border: 1px dashed #b78c5a33; border-radius: 6px; overflow: hidden; }
.ad-slot--top { margin-bottom: 1.4rem; }
.ad-slot--bottom { margin-top: 1.8rem; }

/* ── Mobile filter bar ── */
.mobile-filter-bar {
    display: none;
    gap: 10px;
    padding: 10px 10px 25px;
    flex-wrap: wrap;
    justify-content: center;
}
.mobile-filter-btn {
    background: linear-gradient(180deg, #462a14 0%, #2a180a 100%);
    color: #c9a03d;
    border: 1px solid #5a3a1e;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: 'Playfair Display', serif;
    font-weight: bold;
    white-space: nowrap;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    cursor: pointer;
}
.mobile-filter-btn.active {
    background: #fef7e9;
    color: #3a2512;
    border-color: #c9a03d;
}

/* ── Book Scene ── */
.book-scene {
    padding-top: 46px;
    display: flex;
    align-items: stretch;
    justify-content: center;
    box-shadow: 0 28px 56px rgba(0,0,0,.75);
    border-radius: 6px;
    overflow: visible;
}

.book-cover {
    width: 26px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.book-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 12px rgba(0,0,0,.55); }
.book-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset 4px 0 12px rgba(0,0,0,.55); }

/* ── Spread: give it height so oven has room to center properly ── */
.book-spread {
    display: flex;
    flex: 1;
    align-items: stretch;
    max-width: 1260px;
    position: relative;
    background: #fef7e9;
    overflow: visible;
    min-height: 600px; /* ← ADD THIS */
}
/* ── Oven: spans full spread width, centered across both pages ── */
.oven-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: #fef7e9cc;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.oven-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.oven-body {
    width: 110px;
    background: #3a2510;
    border: 3px solid #6b4020;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.4), inset 0 2px 4px rgba(0,0,0,.3);
}

.oven-window {
    width: 100%;
    height: 68px;
    background: #1a0f06;
    border: 2px solid #4a2e10;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    margin-bottom: 8px;
}

.oven-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 80%, #f97316 0%, #c2410c 35%, transparent 70%);
    animation: ovenPulse 1.8s ease-in-out infinite;
}
@keyframes ovenPulse {
    0%, 100% { opacity: .55; }
    50%       { opacity: 1; }
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
.oven-heat-bar:nth-child(3) { bottom: 14px; left: 20%; width: 60%; animation-delay: .3s; }
.oven-heat-bar:nth-child(4) { bottom: 22px; left: 30%; width: 40%; animation-delay: .6s; }
@keyframes heatRise {
    0%   { opacity: 0; transform: scaleX(.8) translateY(0); }
    40%  { opacity: 1; transform: scaleX(1) translateY(-2px); }
    100% { opacity: 0; transform: scaleX(.6) translateY(-8px); }
}

.oven-knobs { display: flex; justify-content: space-around; margin-top: 8px; }
.oven-knob {
    width: 16px; height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #8b6b41, #3a2010);
    border: 2px solid #6b4020;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.4);
}
.oven-knob--on {
    background: radial-gradient(circle at 35% 35%, #f97316, #c2410c);
    box-shadow: 0 0 6px #f9731680, inset 0 1px 2px rgba(0,0,0,.3);
    animation: knobGlow 1.8s ease-in-out infinite;
}
@keyframes knobGlow {
    0%, 100% { box-shadow: 0 0 4px #f9731660; }
    50%       { box-shadow: 0 0 12px #f97316cc; }
}

.oven-label {
    font-family: 'Playfair Display', serif;
    font-size: .78rem;
    color: #a08060;
    font-style: italic;
    letter-spacing: .04em;
}

.oven-fade-enter-active { transition: opacity .3s ease; }
.oven-fade-leave-active { transition: opacity .25s ease; }
.oven-fade-enter-from,
.oven-fade-leave-to     { opacity: 0; }

/* ── Pages ── */
.book-page {
    flex: 1 1 50%;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.6rem;
    display: flex;
    flex-direction: column;
    position: relative;
}
.book-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.08); }
.book-page--right { box-shadow: inset 8px 0 20px rgba(0,0,0,.08); }

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    color: #a08060;
    text-transform: uppercase;
    letter-spacing: .1em;
    border-bottom: 1px solid #c9a03d55;
    padding-bottom: .7rem;
    margin-bottom: 1.2rem;
    position: relative;
    z-index: 1;
}

.page-grid {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    position: relative;
    z-index: 1;
}

.page-ghost {
    min-height: 200px;
    background: #f5eedc;
    border: 1px dashed #d4a85433;
    border-radius: 4px;
    opacity: .4;
}

/* ── Spine ── */
.book-spine {
    width: 22px;
    flex-shrink: 0;
    background: linear-gradient(to right, #4a2a0a 0%, #8b5a28 45%, #6b4020 55%, #4a2a0a 100%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.spine-line { width: 2px; height: 40px; background: rgba(255,210,120,.18); }

/* ── Load More ── */
.load-more-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 3.5rem;
    padding-bottom: 2rem;
    text-align: center;
}
.load-more-btn {
    background: linear-gradient(180deg, #462a14 0%, #2a180a 100%);
    color: #c9a03d;
    border: 1px solid #5a3a1e;
    padding: 14px 40px;
    font-family: 'Playfair Display', serif;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 4px 0 #1a0f07, 0 10px 20px rgba(0,0,0,0.3);
    transition: all 0.1s ease;
}
.load-more-btn:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1a0f07;
}
.load-more-spinner {
    font-family: 'Playfair Display', serif;
    font-size: .82rem;
    color: #a08060;
    font-style: italic;
    animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { opacity: .5; }
    50%       { opacity: 1; }
}
.all-loaded {
    font-family: 'Playfair Display', serif;
    font-size: .85rem;
    color: #a08060;
    font-style: italic;
    letter-spacing: .08em;
}

/* ── TransitionGroup ── */
.list-fade-enter-active {
    transition: all 0.8s ease;
    transition-delay: var(--delay);
}
.list-fade-enter-from {
    opacity: 0;
    transform: translateY(30px);
}
.list-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.no-results {
    text-align: center;
    color: #a08060;
    font-style: italic;
    padding: 2rem;
}

/* ── Bookmarks ── */
.bookmarks {
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    display: flex;
    align-items: flex-end;
    z-index: 30;
    width: calc(50% - 11px);
}
.bookmarks--left  { left: 0; justify-content: space-evenly; }
.bookmarks--right { right: 0; justify-content: space-evenly; }
.bookmark {
    flex: 1; height: 34px; cursor: pointer;
    border: 1px solid #8b5a2855; border-bottom: none; border-radius: 5px 5px 0 0;
    background: linear-gradient(180deg, #5a3820 0%, #4a2e14 100%);
    color: #c9a03d; font-family: 'Playfair Display', serif;
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .05em;
}
.bookmark.active {
    background: #fef7e9; color: #6b3a10;
    height: 42px; transform: translateY(-2px);
}

/* ── Mobile ── */
@media (max-width: 680px) {
    .mobile-filter-bar { display: flex; }
    .book-scene {
        display: flex;          /* keep flex so covers still attach */
        flex-direction: column;
        box-shadow: none;
        padding-top: 0;
        border-radius: 0;
    }
    .book-cover, .book-spine, .bookmarks { display: none; }
    .book-spread {
        flex-direction: column; /* stack pages vertically */
        min-height: unset;
    }
    .book-page {
        flex: none;
        width: 100%;
        margin-bottom: 15px;
        border-radius: 6px;
        box-shadow: 0 4px 16px rgba(0,0,0,.35);
    }
}
</style>
