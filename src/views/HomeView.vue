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

        <!-- Mobile filter bar: sits in the space above the book -->
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
            <!-- Hard cover left -->
            <div class="book-cover book-cover--left"></div>

            <div class="book-spread">

                <!-- ── BOOKMARKS: 4 per page, evenly spread ── -->
                <!-- Left page bookmarks: All, Breakfast, Pasta, Soup -->
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
                <!-- Right page bookmarks: Salad, Meat, Dessert, Vegetarian -->
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
                    <div class="page-header">
                        <span class="page-chapter">The Recipe Collection</span>
                        <span class="page-num">p. {{ leftPageNum }}</span>
                    </div>

                    <!-- Oven loading overlay (left page) -->
                    <Transition name="oven-fade">
                        <div v-if="recipesStore.isLoading" class="oven-overlay oven-overlay--left">
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

                    <div class="page-grid" v-if="!recipesStore.isLoading">
                        <RecipeCard
                            v-for="(recipe, idx) in leftPageRecipes"
                            :key="recipe.id"
                            :recipe="recipe"
                            :priority="idx === 0 && currentSpread === 0"
                        />
                        <div
                            v-for="n in Math.max(0, 2 - leftPageRecipes.length)"
                            :key="'gl-' + n"
                            class="page-ghost"
                        ></div>
                    </div>

                    <!-- Corner turn — prev -->
                    <div
                        class="corner-turn corner-turn--bl"
                        :class="{ 'corner-active': cornerActive === 'prev' }"
                        @mouseenter="cornerActive = 'prev'"
                        @mouseleave="cornerActive = null"
                        @click="turnPage(-1)"
                        v-if="currentSpread > 0 && !recipesStore.isLoading"
                    >
                        <div class="corner-peel"></div>
                        <span class="corner-label">←</span>
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
                    <div class="page-header page-header--right">
                        <span class="page-num">p. {{ rightPageNum }}</span>
                        <span class="page-chapter">Recipes worth cooking</span>
                    </div>

                    <!-- Oven loading overlay (right page) — shows error too -->
                    <Transition name="oven-fade">
                        <div v-if="recipesStore.isLoading" class="oven-overlay oven-overlay--right">
                            <div class="oven-steam">
                                <span class="steam-puff"></span>
                                <span class="steam-puff" style="animation-delay:.4s"></span>
                                <span class="steam-puff" style="animation-delay:.8s"></span>
                            </div>
                        </div>
                    </Transition>

                    <div v-if="recipesStore.error" class="error-msg">{{ recipesStore.error }}</div>

                    <div class="page-grid" v-if="!recipesStore.isLoading && !recipesStore.error">
                        <RecipeCard
                            v-for="recipe in rightPageRecipes"
                            :key="recipe.id"
                            :recipe="recipe"
                        />
                        <div
                            v-for="n in Math.max(0, 2 - rightPageRecipes.length)"
                            :key="'gr-' + n"
                            class="page-ghost"
                        ></div>
                    </div>

                    <!-- Corner turn — next -->
                    <div
                        class="corner-turn corner-turn--br"
                        :class="{ 'corner-active': cornerActive === 'next' }"
                        @mouseenter="cornerActive = 'next'"
                        @mouseleave="cornerActive = null"
                        @click="turnPage(1)"
                        v-if="currentSpread < totalSpreads - 1 && !recipesStore.isLoading"
                    >
                        <div class="corner-peel"></div>
                        <span class="corner-label">→</span>
                    </div>
                </div>

                <!-- Page-flip overlay -->
                <Transition name="page-flip">
                    <div v-if="flipping" class="flip-overlay" :class="'flip-' + flipDir"></div>
                </Transition>
            </div>

            <!-- Hard cover right -->
            <div class="book-cover book-cover--right"></div>
        </div>

        <!-- No results -->
        <div v-if="!recipesStore.isLoading && allRecipes.length === 0" class="no-results">
            No recipes match your search.
        </div>

        <!-- Nav strip BELOW the book -->
        <div class="book-nav" v-if="!recipesStore.isLoading && allRecipes.length > 0">
            <button
                class="turn-btn"
                :disabled="isAnimating || currentSpread === 0"
                @click="turnPage(-1)"
            >← Prev</button>

            <div class="spread-indicator">
                <span class="ind-top">Spread</span>
                <span class="ind-num">{{ currentSpread + 1 }}</span>
                <span class="ind-bot">of {{ totalSpreads }}</span>
            </div>

            <button
                class="turn-btn"
                :disabled="isAnimating || currentSpread >= totalSpreads - 1"
                @click="turnPage(1)"
            >Next →</button>
        </div>

        <div class="page-dots" v-if="!recipesStore.isLoading && totalSpreads > 1">
            <button
                v-for="(_, i) in totalSpreads"
                :key="i"
                class="page-dot"
                :class="{ active: i === currentSpread }"
                @click="goToSpread(i)"
            ></button>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRecipesStore } from '../stores/recipes';
import RecipeCard from '../components/RecipeCard.vue';

const recipesStore = useRecipesStore();

const PER_SPREAD    = 4;
const currentSpread = ref(0);
const isAnimating   = ref(false);
const flipping      = ref(false);
const flipDir       = ref('next');
const cornerActive  = ref(null);
const pressingTag   = ref(null);

// Split 8 filter tabs: 4 on left page, 4 on right page
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
    currentSpread.value = 0;
    recipesStore.fetchRecipes(1);
});

// When the user reaches the second-to-last spread of loaded recipes,
// fetch the next API page in the background and append it.
watch(currentSpread, (spread) => {
    if (!recipesStore.hasMorePages) return;
    if (spread >= totalSpreads.value - 2) {
        recipesStore.fetchNextPage();
    }
});

const allRecipes   = computed(() => recipesStore.filtered);
const totalSpreads = computed(() => Math.max(1, Math.ceil(allRecipes.value.length / PER_SPREAD)));

const currentRecipes   = computed(() => allRecipes.value.slice(currentSpread.value * PER_SPREAD, currentSpread.value * PER_SPREAD + PER_SPREAD));
const leftPageRecipes  = computed(() => currentRecipes.value.slice(0, 2));
const rightPageRecipes = computed(() => currentRecipes.value.slice(2, 4));

const leftPageNum  = computed(() => currentSpread.value * 2 + 1);
const rightPageNum = computed(() => currentSpread.value * 2 + 2);

function turnPage(direction) {
    if (isAnimating.value) return;
    const next = currentSpread.value + direction;
    if (next < 0 || next >= totalSpreads.value) return;
    isAnimating.value = true;
    flipDir.value = direction > 0 ? 'next' : 'prev';
    flipping.value = true;
    cornerActive.value = null;
    setTimeout(() => {
        currentSpread.value = next;
        flipping.value = false;
        isAnimating.value = false;
    }, 420);
}

function goToSpread(index) {
    if (isAnimating.value || index === currentSpread.value) return;
    const dir = index > currentSpread.value ? 1 : -1;
    isAnimating.value = true;
    flipDir.value = dir > 0 ? 'next' : 'prev';
    flipping.value = true;
    cornerActive.value = null;
    setTimeout(() => {
        currentSpread.value = index;
        flipping.value = false;
        isAnimating.value = false;
    }, 420);
}

function onTagChange(tag) {
    recipesStore.activeTag = tag;
    recipesStore.fetchRecipes(1);
    currentSpread.value = 0;
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

/* Desktop: center the book and give ads breathing room */
@media (min-width: 1200px) {
    .ad-slot {
        max-width: 1155px;
        margin-left: auto;
        margin-right: auto;
    }
}

/* Mobile filter bar — hidden on desktop, shown on mobile */
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
    padding-top: 46px; /* static — reserves space for bookmark tabs, prevents CLS */
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
    overflow: visible; /* bookmarks need to poke out */
    will-change: transform;
}

/* ══ BOOKMARKS ══ */
/* Each group spans exactly one page width, tabs evenly distributed */
.bookmarks {
    position: absolute;
    top: 0;
    transform: translateY(-100%);
    display: flex;
    gap: 0;
    z-index: 30;
    pointer-events: none;
    align-items: flex-end;
    /* Each group covers exactly one page = 50% of spread minus spine (11px) */
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
    /* fill the available space evenly */
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

/* Bookmark notch (ribbon cut) */
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

/* Press bend — like bending a real tab */
.bookmark.pressing {
    transform: translateY(3px) rotate(0.5deg) scaleY(0.93) !important;
    transition: transform .08s ease !important;
}

/* Active bookmark — pops up, lighter parchment */
.bookmark.active {
    background: linear-gradient(180deg, #fef7e9 0%, #f5e8c8 100%);
    color: #6b3a10;
    border-color: #c9a03d88;
    height: 42px; /* taller when active */
    box-shadow: 0 -4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.5);
    transform: translateY(-2px);
    z-index: 2;
}
.bookmark.active::after {
    border-top-color: #f5e8c8;
}
.bookmark.active:hover {
    transform: translateY(-5px) rotate(-0.5deg);
}

/* ── Pages ── */
.book-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.6rem;
    display: flex;
    flex-direction: column;
    position: relative;
    min-height: 640px;
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
.book-page--left {
    box-shadow: inset -8px 0 20px rgba(0,0,0,.08);
    contain: layout style paint;
}
.book-page--right {
    box-shadow: inset 8px 0 20px rgba(0,0,0,.08);
    contain: layout style paint;
}

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
    flex: 1;              /* fills entire page below header */
    position: relative;
    z-index: 1;
    min-height: 400px;
    /* Children (cards) get flex:1 so they share height equally */
}

.page-ghost {
    flex: 1;
    min-height: 200px;
    background: #f5eedc;
    border: 1px dashed #d4a85433;
    border-radius: 4px;
    opacity: .4;
}

/* ══ OVEN LOADING ANIMATION ══ */
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

/* Oven body */
.oven-body {
    width: 110px;
    background: #3a2510;
    border: 3px solid #6b4020;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.4), inset 0 2px 4px rgba(0,0,0,.3);
}

/* Oven window */
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

/* Heat shimmer bars */
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
    0%   { opacity: 0;   transform: scaleX(.8) translateY(0); }
    40%  { opacity: 1;   transform: scaleX(1)  translateY(-2px); }
    100% { opacity: 0;   transform: scaleX(.6) translateY(-8px); }
}

/* Oven knobs */
.oven-knobs {
    display: flex;
    justify-content: space-around;
}
.oven-knob {
    width: 16px;
    height: 16px;
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

/* Steam on right page during load */
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
    0%   { transform: translateY(0)   scaleX(1)   opacity(0); opacity: 0; }
    20%  { opacity: .7; }
    80%  { opacity: .4; }
    100% { transform: translateY(-60px) scaleX(1.6); opacity: 0; }
}

/* Oven overlay fade transition */
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

/* ── Corner page-turn ── */
.corner-turn {
    position: absolute;
    bottom: 0;
    width: 80px;
    height: 80px;
    cursor: pointer;
    z-index: 20;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: width .2s ease, height .2s ease;
}
.corner-turn--bl { left: 0; }
.corner-turn--br { right: 0; }

.corner-peel {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    transition: all .22s cubic-bezier(.4,0,.2,1);
}
.corner-turn--bl .corner-peel {
    left: 0;
    background: linear-gradient(135deg, transparent 0%, transparent 45%, #e8dcc0 46%, #c8b890 70%, #b8a87a 100%);
    clip-path: polygon(0 100%, 0 72%, 28% 100%);
    transform-origin: bottom left;
}
.corner-turn--bl:hover .corner-peel,
.corner-turn--bl.corner-active .corner-peel {
    clip-path: polygon(0 100%, 0 28%, 72% 100%);
    box-shadow: 5px -5px 14px rgba(0,0,0,.3);
}
.corner-turn--br .corner-peel {
    right: 0;
    background: linear-gradient(225deg, transparent 0%, transparent 45%, #e8dcc0 46%, #c8b890 70%, #b8a87a 100%);
    clip-path: polygon(100% 100%, 100% 72%, 72% 100%);
    transform-origin: bottom right;
}
.corner-turn--br:hover .corner-peel,
.corner-turn--br.corner-active .corner-peel {
    clip-path: polygon(100% 100%, 100% 28%, 28% 100%);
    box-shadow: -5px -5px 14px rgba(0,0,0,.3);
}
.corner-turn:hover { width: 105px; height: 105px; }

.corner-label {
    position: relative;
    z-index: 1;
    font-size: .78rem;
    color: #8b6b41;
    font-family: 'Playfair Display', serif;
    margin-bottom: 8px;
    opacity: 0;
    transition: opacity .15s;
}
.corner-turn:hover .corner-label { opacity: 1; }

/* ── Page flip overlay ── */
.flip-overlay {
    position: absolute;
    top: 0; bottom: 0;
    width: 50%;
    z-index: 15;
    pointer-events: none;
    background: linear-gradient(to left, #ede8d8 0%, #fef7e9 60%, #f5eedd 100%);
    box-shadow: -8px 0 24px rgba(0,0,0,.25);
}
.flip-next .flip-overlay { right: 0; transform-origin: left center; }
.flip-prev .flip-overlay { left: 50%; transform-origin: right center; }

.page-flip-enter-active { display: block; }
.page-flip-leave-active { display: none; }
.flip-next.page-flip-enter-active { animation: flipPageNext .42s cubic-bezier(.4,0,.6,1) forwards; }
.flip-prev.page-flip-enter-active { animation: flipPagePrev .42s cubic-bezier(.4,0,.6,1) forwards; }

@keyframes flipPageNext {
    0%   { transform: rotateY(0deg);    opacity: 1; }
    50%  { transform: rotateY(-90deg);  opacity: .6; box-shadow: -20px 0 40px rgba(0,0,0,.4); }
    100% { transform: rotateY(-180deg); opacity: 0; }
}
@keyframes flipPagePrev {
    0%   { transform: rotateY(0deg);   opacity: 1; }
    50%  { transform: rotateY(90deg);  opacity: .6; box-shadow: 20px 0 40px rgba(0,0,0,.4); }
    100% { transform: rotateY(180deg); opacity: 0; }
}

/* ── Nav ── */
.book-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-top: 1.8rem;
}
.turn-btn {
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    border: none;
    padding: .65rem 1.5rem;
    font-family: 'Playfair Display', serif;
    font-size: .95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 0 #7a5a00, 0 6px 14px rgba(0,0,0,.3);
    transition: all .15s ease;
    min-width: 130px;
}
.turn-btn:first-child { border-radius: 3px 0 0 3px; border-right: 2px solid #7a5a0044; }
.turn-btn:last-child  { border-radius: 0 3px 3px 0; border-left:  2px solid #7a5a0044; }
.turn-btn:hover:not(:disabled) {
    background: linear-gradient(180deg, #dbb04e 0%, #b08830 100%);
    transform: translateY(2px);
    box-shadow: 0 2px 0 #7a5a00;
}
.turn-btn:disabled { opacity: .3; cursor: not-allowed; box-shadow: 0 1px 0 #7a5a00; }

.spread-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fef7e9;
    border-top: 3px solid #b78c5a;
    border-bottom: 3px solid #b78c5a;
    padding: .5rem 1.5rem;
    min-width: 120px;
    box-shadow: 0 4px 0 #7a5a00, 0 6px 12px rgba(0,0,0,.2);
}
.ind-top, .ind-bot { font-size: .55rem; text-transform: uppercase; letter-spacing: .13em; color: #a08060; }
.ind-num { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; color: #2c1e0e; line-height: 1; }

.page-dots {
    display: flex;
    justify-content: center;
    gap: .5rem;
    margin: 1rem 0 1.8rem;
}
.page-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    border: 1.5px solid #b78c5a;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: all .15s ease;
}
.page-dot:hover  { background: #c9a03d44; border-color: #c9a03d; }
.page-dot.active { background: #4d7a4d; border-color: #2b4a2b; transform: scale(1.4); }

.no-results {
    text-align: center;
    color: #a08060;
    font-style: italic;
    padding: 2rem;
}

/* ── Desktop large: book centered with space for ads ── */
@media (min-width: 1200px) {
    .book-scene  { margin: 0 auto; max-width: 1155px; }
    .book-spread { max-width: 1103px; }
    .book-page   { min-height: 700px; }
}

@media (min-width: 900px) and (max-width: 1199px) {
    .book-page { min-height: 600px; padding: 1.4rem 1.2rem; }
}

/* ── Tablet (681–899px): stacked pages ── */
@media (min-width: 681px) and (max-width: 899px) {
    .book-spread { flex-direction: column; max-width: 520px; margin: 0 auto; }
    .book-spine  { width: 100%; height: 16px; flex-direction: row; justify-content: center; }
    .spine-line  { width: 40px; height: 2px; }
    .book-cover  { display: none; }
    .corner-turn { display: none; }
    .book-page   { min-height: unset; padding: 1.2rem 1rem; }
    .book-page--left  { contain: layout style; }
    .book-page--right { contain: layout style; }
    .bookmarks   { gap: 3px; padding: 0 8px; }
    .bookmark    { font-size: .65rem; padding: .32rem .6rem; min-width: 44px; height: 30px; }
    .bookmark.active { height: 36px; }
}

/* ── Mobile (<=680px): drop book chrome entirely ── */
@media (max-width: 680px) {
    .book-scene  { box-shadow: none; border-radius: 0; background: transparent; padding-top: 0; }
    .book-cover  { display: none; }
    .book-spine  { display: none; }
    .corner-turn { display: none; }
    /* Hide the embedded bookmark tabs — replaced by mobile-filter-bar */
    .bookmarks   { display: none !important; }
    /* Show the mobile pill strip — wraps into rows, fills the brown space */
    .mobile-filter-bar {
        display: flex;
        flex-wrap: wrap;          /* wrap onto 2 rows */
        gap: 8px;
        overflow-x: visible;
        -webkit-mask-image: none;
        mask-image: none;
        padding: 8px 0 12px;
        margin-bottom: 10px;
        margin-left: 0;
        margin-right: 0;
        justify-content: flex-start;
    }
    /* Each button auto-sizes to content, ~4 per row */
    .mobile-filter-btn {
        flex: 0 0 auto;
        font-size: .72rem !important;
        padding: .32rem 1rem !important;
        height: 32px !important;
    }

    /* Bookmarks: reset absolute positioning, become inline scrollable strip */
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
    /* Both left & right groups shown inline, full width each */
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
    .bookmark::after        { display: none !important; }
    .bookmark.active        { height: 30px !important; transform: none !important; }
    .bookmark:hover         { transform: none !important; }
    .bookmark.pressing      { transform: scale(0.95) !important; }

    /* Pages become plain stacked cards */
    .book-spread {
        flex-direction: column;
        gap: 0;
        max-width: 100%;
        overflow: visible;
        will-change: auto;
    }
    .book-page {
        min-height: unset;
        padding: 1rem .9rem;
        border-radius: 6px;
        margin-bottom: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,.35);
        contain: layout style;
    }
    .book-page--left, .book-page--right { box-shadow: 0 4px 16px rgba(0,0,0,.35); }
    .book-page::before { display: none; }

    .oven-body   { width: 88px; }
    .oven-window { height: 50px; }

    .book-nav { margin-top: 0; }
    .turn-btn  { min-width: 88px; padding: .5rem .8rem; font-size: .85rem; }
    .spread-indicator { min-width: 76px; padding: .38rem .8rem; }
    .ind-num   { font-size: 1.4rem; }

    .ad-slot--top { margin-bottom: .8rem; }
}
</style>
