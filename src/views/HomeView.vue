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

        <!-- Mobile filter bar -->
        <div class="mobile-filter-bar">
            <button
                v-for="tag in [...leftBookmarks, ...rightBookmarks]"
                :key="tag.value"
                class="mobile-filter-btn"
                :class="{ active: recipesStore.activeTag === tag.value }"
                @click="onTagChange(tag.value)"
            >{{ tag.label }}</button>
        </div>

        <!-- Ad: leaderboard above the book -->
        <div class="ad-slot ad-slot--top">
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>

        <!-- ══ Open Book ══ -->
        <div class="book-scene">
            <div class="book-cover book-cover--left"></div>

            <div class="book-spread">

                <!-- ── BOOKMARKS ── -->
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

                <!-- ── LEFT PAGE ── -->
                <div class="book-page book-page--left">
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

                <!-- ── SPINE ── -->
                <div class="book-spine">
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                </div>

                <!-- ── RIGHT PAGE ── -->
                <div class="book-page book-page--right">
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

        <!-- No results -->
        <div v-if="!recipesStore.isLoading && allRecipes.length === 0" class="no-results">
            No recipes match your search.
        </div>

        <!-- Load More -->
        <div class="load-more-wrap" v-if="allRecipes.length > 0">
            <button
                v-if="recipesStore.hasMorePages && !recipesStore.isLoading"
                class="load-more-btn"
                @click="loadMore"
            >
                Load More Recipes
            </button>
            <span v-if="recipesStore.isLoading && allRecipes.length > 0" class="load-more-spinner">
                Heating up more recipes…
            </span>
            <p v-if="!recipesStore.hasMorePages && !recipesStore.isLoading" class="all-loaded">
                ✦ You've reached the end of the cookbook ✦
            </p>
        </div>

        <!-- Ad: bottom -->
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

const leftBookmarks = [
    { value: '',            label: 'All' },
    { value: 'breakfast',   label: 'Breakfast' },
    { value: 'pasta',       label: 'Pasta' },
    { value: 'soup',        label: 'Soup' },
];
const rightBookmarks = [
    { value: 'salad',       label: 'Salad' },
    { value: 'meat',        label: 'Meat' },
    { value: 'dessert',     label: 'Dessert' },
    { value: 'vegetarian',  label: 'Vegetarian' },
];

onMounted(() => {
    recipesStore.fetchRecipes(1);
});

watch([() => recipesStore.activeTag, () => recipesStore.search], () => {
    recipesStore.fetchRecipes(1);
});

watch(() => auth.isLoggedIn, () => {
    recipesStore.fetchRecipes(1);
});

const allRecipes       = computed(() => recipesStore.filtered);
const leftPageRecipes  = computed(() => allRecipes.value.filter((_, i) => i % 2 === 0));
const rightPageRecipes = computed(() => allRecipes.value.filter((_, i) => i % 2 !== 0));

function onTagChange(tag) {
    recipesStore.activeTag = tag;
    recipesStore.fetchRecipes(1);
}

async function loadMore() {
    const before = new Set(allRecipes.value.map(r => r.id));
    
    await recipesStore.fetchNextPage();

    const fresh = new Set();
    allRecipes.value.forEach(r => {
        if (!before.has(r.id)) fresh.add(r.id);
    });
    newRecipeIds.value = fresh;

    setTimeout(() => { 
        newRecipeIds.value = new Set(); 
    }, 2000);
}
</script>

<style scoped>
/* ── Ad slots ── */
.ad-slot {
    width: 100%;
    min-height: 90px;
    border: 1px dashed #b78c5a33;
    border-radius: 6px;
    overflow: hidden;
}
.ad-slot--top    { margin-bottom: 1.4rem; }
.ad-slot--bottom { margin-top: 1.8rem; }

@media (min-width: 1200px) {
    .ad-slot {
        max-width: 1155px;
        margin-left: auto;
        margin-right: auto;
    }
}

/* Mobile filter bar */
.mobile-filter-bar {
    display: none;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
    gap: 7px;
    padding-bottom: 4px;
}
.mobile-filter-bar::-webkit-scrollbar { display: none; }
.mobile-filter-btn {
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: #c9a03d;
    background: #3a2410;
    border: 1px solid #8b5a2855;
    border-radius: 20px;
    padding: .3rem .9rem;
    height: 30px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background .15s, color .12s, transform .1s;
}
.mobile-filter-btn:hover   { background: #5a3820; color: #f0c060; }
.mobile-filter-btn.active  { background: #fef7e9; color: #6b3a10; border-color: #c9a03d88; }
.mobile-filter-btn.pressing { transform: scale(0.94); }

/* ── Book scene ── */
.book-scene {
    padding-top: 46px;
    display: flex;
    align-items: stretch;
    justify-content: center;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
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

/* ── Spread ── */
.book-spread {
    display: flex;
    flex: 1;
    max-width: 1260px;
    position: relative;
    overflow: visible;
}

/* ══ BOOKMARKS ══ */
.bookmarks {
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    display: flex;
    gap: 0;
    z-index: 30;
    pointer-events: none;
    align-items: flex-end;
    width: calc(50% - 11px);
}
.bookmarks--left  { left: 0; justify-content: space-evenly; padding: 0 2px 0 0; }
.bookmarks--right { right: 0; justify-content: space-evenly; padding: 0 0 0 2px; }

.bookmark {
    pointer-events: all;
    font-family: 'Playfair Display', serif;
    font-size: .7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: #c9a03d;
    background: linear-gradient(180deg, #5a3820 0%, #4a2e14 100%);
    border: 1px solid #8b5a2855;
    border-bottom: none;
    padding: .38rem .5rem .45rem;
    cursor: pointer;
    border-radius: 5px 5px 0 0;
    transform-origin: bottom center;
    transition: transform .15s cubic-bezier(.34,1.56,.64,1), background .15s, color .12s;
    position: relative;
    box-shadow: 0 -3px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,220,120,.12);
    flex: 1;
    text-align: center;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}

.bookmark::after {
    content: '';
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid #4a2e14;
    transition: border-top-color .15s;
}

.bookmark:hover {
    transform: translateY(-4px) rotate(-1deg);
    color: #f0c060;
    background: linear-gradient(180deg, #6b4525 0%, #5a3418 100%);
}
.bookmark:hover::after { border-top-color: #5a3418; }

.bookmark.pressing {
    transform: translateY(3px) rotate(0.5deg) scaleY(0.93) !important;
    transition: transform .08s ease !important;
}

.bookmark.active {
    background: linear-gradient(180deg, #fef7e9 0%, #f5e8c8 100%);
    color: #6b3a10;
    border-color: #c9a03d88;
    height: 42px;
    box-shadow: 0 -4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.5);
    transform: translateY(-2px);
    z-index: 2;
}
.bookmark.active::after { border-top-color: #f5e8c8; }
.bookmark.active:hover  { transform: translateY(-5px) rotate(-0.5deg); }

/* ── Pages ── */
.book-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.6rem;
    display: flex;
    flex-direction: column;
    position: relative;
    /* Ensure height changes are smooth */
    transition: min-height 0.5s ease-in-out; 
    height: fit-content;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: block; /* Flex can sometimes cause height snapping, block is safer here */
}

.book-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
        transparent, transparent 32px, #d4a85412 33px
    );
    background-attachment: local;
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
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    will-change: height; /* Tells the browser to optimize for height changes */
}

.page-ghost {
    min-height: 200px;
    background: #f5eedc;
    border: 1px dashed #d4a85433;
    border-radius: 4px;
    opacity: .4;
}

/* ══ OVEN LOADING ══ */
.oven-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: #fef7e9;
    display: flex;
    align-items: center;
    justify-content: center;
}
.oven-overlay--left  { border-right: none; }
.oven-overlay--right { border-left: none; }

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
    transform-origin: bottom center;
}
.oven-heat-bar:nth-child(3) { bottom: 14px; left: 20%; width: 60%; animation-delay: .3s; }
.oven-heat-bar:nth-child(4) { bottom: 22px; left: 30%; width: 40%; animation-delay: .6s; }

@keyframes heatRise {
    0%   { opacity: 0; transform: scaleX(.8) translateY(0); }
    40%  { opacity: 1; transform: scaleX(1)  translateY(-2px); }
    100% { opacity: 0; transform: scaleX(.6) translateY(-8px); }
}

.oven-knobs { display: flex; justify-content: space-around; }
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

.oven-steam {
    display: flex;
    gap: 18px;
    align-items: flex-end;
    height: 100%;
    justify-content: center;
    padding-top: 40%;
}
.steam-puff {
    display: block;
    width: 12px;
    height: 40px;
    background: linear-gradient(180deg, transparent 0%, #d4a85430 40%, #d4a85460 100%);
    border-radius: 50% 50% 30% 30%;
    animation: steamRise 2s ease-in-out infinite;
    transform-origin: bottom center;
}
@keyframes steamRise {
    0%   { opacity: 0; transform: translateY(0) scaleX(1); }
    20%  { opacity: .7; }
    80%  { opacity: .4; }
    100% { opacity: 0; transform: translateY(-60px) scaleX(1.6); }
}

.oven-fade-enter-active { transition: opacity .3s ease; }
.oven-fade-leave-active { transition: opacity .25s ease; }
.oven-fade-enter-from,
.oven-fade-leave-to     { opacity: 0; }

/* ── Spine ── */
.book-spine {
    width: 22px;
    flex-shrink: 0;
    background: linear-gradient(to right, #4a2a0a 0%, #8b5a28 45%, #6b4020 55%, #4a2a0a 100%);
    box-shadow: 0 0 28px rgba(0,0,0,.7), inset 0 0 10px rgba(0,0,0,.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    z-index: 2;
}
.spine-line {
    width: 2px;
    height: 40px;
    background: rgba(255,210,120,.18);
    border-radius: 1px;
}

/* ── Load More ── */
.load-more-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
    min-height: 56px;
}

.load-more-btn {
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    border: none;
    padding: .75rem 2.5rem;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0 4px 0 #7a5a00, 0 6px 14px rgba(0,0,0,.3);
    transition: all .15s ease;
    letter-spacing: .04em;
}
.load-more-btn:hover {
    background: linear-gradient(180deg, #dbb04e 0%, #b08830 100%);
    transform: translateY(2px);
    box-shadow: 0 2px 0 #7a5a00;
}

.all-loaded {
    font-family: 'Playfair Display', serif;
    font-size: .85rem;
    color: #a08060;
    font-style: italic;
    letter-spacing: .08em;
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

.no-results {
    text-align: center;
    color: #a08060;
    font-style: italic;
    padding: 2rem;
}

/* Ensure the RecipeCard component has an entry animation defined */
/* If RecipeCard doesn't have a built-in fade, add this helper: */
.recipe-card-enter-active {
    animation: recipeFadeIn 0.6s ease forwards;
}

@keyframes recipeFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.list-fade-enter-active {
    transition: all 0.8s ease;
    transition-delay: var(--delay);
}

.list-fade-enter-from {
    opacity: 0;
    transform: translateY(30px);
    max-height: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
}

.list-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
    max-height: 800px; /* Set this higher than any single card's height */
    margin-bottom: 1.1rem;
}

/* 3. Disable the Oven when recipes exist */
.oven-overlay {
    /* Ensure the oven doesn't stay in the DOM layout if recipes are present */
    pointer-events: none; 
}

/* ── Desktop ── */
@media (min-width: 1200px) {
    .book-scene  { margin: 0 auto; max-width: 1155px; }
    .book-spread { max-width: 1103px; }
}

@media (min-width: 900px) and (max-width: 1199px) {
    .book-page { padding: 1.4rem 1.2rem; }
}

/* ── Tablet (681–899px) ── */
@media (min-width: 681px) and (max-width: 899px) {
    .book-spread { flex-direction: column; max-width: 520px; margin: 0 auto; }
    .book-spine  { width: 100%; height: 16px; flex-direction: row; justify-content: center; }
    .spine-line  { width: 40px; height: 2px; }
    .book-cover  { display: none; }
    .book-page   { padding: 1.2rem 1rem; }
    .book-page--left  { contain: layout style; }
    .book-page--right { contain: layout style; }
    .bookmarks   { gap: 3px; padding: 0 8px; }
    .bookmark    { font-size: .65rem; padding: .32rem .6rem; min-width: 44px; height: 30px; }
    .bookmark.active { height: 36px; }
}

/* ── Mobile (<=680px) ── */
@media (max-width: 680px) {
    .book-scene  { box-shadow: none; border-radius: 0; background: transparent; padding-top: 0; }
    .book-cover  { display: none; }
    .book-spine  { display: none; }
    .bookmarks   { display: none !important; }

    .mobile-filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        overflow-x: visible;
        -webkit-mask-image: none;
        mask-image: none;
        padding: 8px 0 12px;
        margin-bottom: 10px;
        justify-content: flex-start;
    }
    .mobile-filter-btn {
        flex: 0 0 auto;
        font-size: .72rem !important;
        padding: .32rem 1rem !important;
        height: 32px !important;
    }

    .bookmarks {
        position: static;
        transform: none;
        width: 100%;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: 6px;
        padding: 6px 0 10px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        align-items: center;
        display: flex;
        justify-content: flex-start;
    }
    .bookmarks--left, .bookmarks--right {
        position: static;
        transform: none;
        width: auto;
        flex-shrink: 0;
    }
    .bookmarks::-webkit-scrollbar { display: none; }
    .bookmark {
        border-radius: 20px !important;
        border-bottom: 1px solid #8b5a2855 !important;
        border-top: 1px solid #8b5a2855 !important;
        height: 30px !important;
        flex: 0 0 auto !important;
        white-space: nowrap;
        font-size: .7rem !important;
        padding: .25rem .85rem !important;
    }
    .bookmark::after   { display: none !important; }
    .bookmark.active   { height: 30px !important; transform: none !important; }
    .bookmark:hover    { transform: none !important; }
    .bookmark.pressing { transform: scale(0.95) !important; }

    .book-spread {
        flex-direction: column;
        gap: 0;
        max-width: 100%;
        overflow: visible;
        will-change: auto;
    }
    .book-page {
        padding: 1rem .9rem;
        border-radius: 6px;
        margin-bottom: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,.35);
    }
    .book-page--left, .book-page--right { box-shadow: 0 4px 16px rgba(0,0,0,.35); }
    .book-page::before { display: none; }

    .oven-body   { width: 88px; }
    .oven-window { height: 50px; }

    .ad-slot--top { margin-bottom: .8rem; }
}
</style>
