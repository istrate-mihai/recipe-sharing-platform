<template>
    <div class="profile-wrap">

        <!-- ══ Open Book ══ -->
        <div class="recipe-book">
            <div class="book-cover book-cover--left"></div>

            <div class="book-spread">

                <!-- ── Bookmarks on top ── -->
                <div class="bookmarks">
                    <!-- Left bookmark: My Recipes -->
                    <div class="bookmark-group bookmark-group--left">
                        <button
                            class="bookmark"
                            :class="{ active: tab === 'mine', pressing: pressingTab === 'mine' }"
                            @mousedown="pressingTab = 'mine'"
                            @mouseup="pressingTab = null"
                            @mouseleave="pressingTab = null"
                            @click="tab = 'mine'"
                        >
                            My Recipes
                            <span class="bm-count">{{ myRecipes.length }}</span>
                        </button>
                    </div>
                    <!-- Right bookmark: Favourites -->
                    <div class="bookmark-group bookmark-group--right">
                        <button
                            class="bookmark"
                            :class="{ active: tab === 'favourites', pressing: pressingTab === 'favourites' }"
                            @mousedown="pressingTab = 'favourites'"
                            @mouseup="pressingTab = null"
                            @mouseleave="pressingTab = null"
                            @click="tab = 'favourites'"
                        >
                            Favourites
                            <span class="bm-count">{{ favourites.length }}</span>
                        </button>
                    </div>
                </div>

                <!-- ════ LEFT PAGE: profile + my recipes ════ -->
                <div class="book-page book-page--left" :class="{ 'page-active': tab === 'mine' }">
                    <div class="page-header">
                        <span class="page-chapter">My Cookbook</span>
                        <span class="page-num">p. 1</span>
                    </div>

                    <!-- Profile card embedded in the page -->
                    <div class="profile-card">
                        <div class="profile-avatar">{{ auth.user.avatar }}</div>
                        <div class="profile-info">
                            <h2 class="profile-name">{{ auth.user.name }}</h2>
                            <p class="profile-bio" v-if="auth.user.bio">{{ auth.user.bio }}</p>
                            <p class="profile-email">{{ auth.user.email }}</p>
                            <div class="profile-stats">
                                <div class="stat">
                                    <span class="stat-num">{{ myRecipes.length }}</span>
                                    <span class="stat-label">Recipes</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat">
                                    <span class="stat-num">{{ favourites.length }}</span>
                                    <span class="stat-label">Favourites</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat">
                                    <span class="stat-num">{{ totalLikes }}</span>
                                    <span class="stat-label">Likes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="page-divider"></div>

                    <!-- My Recipes list -->
                    <div class="page-section-title">My Recipes</div>

                    <div v-if="isLoading" class="page-loading">Loading…</div>

                    <div v-else-if="myRecipes.length === 0" class="page-empty">
                        <p>You haven't shared any recipes yet.</p>
                        <RouterLink to="/add-recipe" class="empty-cta">Share your first recipe →</RouterLink>
                    </div>

                    <div v-else class="recipe-list">
                        <div
                            v-for="recipe in myRecipes"
                            :key="recipe.id"
                            class="recipe-row"
                        >
                            <span class="recipe-row-num"></span>
                            <RouterLink
                                :to="{ name: 'recipe-detail', params: { id: recipe.id } }"
                                class="recipe-row-title"
                            >{{ recipe.title }}</RouterLink>
                            <span class="recipe-row-likes">♥ {{ recipe.likes_count }}</span>
                            <button class="del-btn" @click="deleteRecipe(recipe.id)">Delete</button>
                        </div>
                    </div>

                    <div class="page-spacer"></div>
                    <RouterLink to="/add-recipe" class="add-recipe-btn">+ New Recipe</RouterLink>
                    <div class="page-footer-rule"></div>
                </div>

                <!-- ── Spine ── -->
                <div class="book-spine">
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                    <div class="spine-line"></div>
                </div>

                <!-- ════ RIGHT PAGE: favourites ════ -->
                <div class="book-page book-page--right" :class="{ 'page-active': tab === 'favourites' }">
                    <div class="page-header page-header--right">
                        <span class="page-num">p. 2</span>
                        <span class="page-chapter">Favourites</span>
                    </div>

                    <div v-if="isLoading" class="page-loading">Loading…</div>

                    <div v-else-if="favourites.length === 0" class="page-empty">
                        <p>No favourited recipes yet.</p>
                        <RouterLink to="/" class="empty-cta">Browse recipes →</RouterLink>
                    </div>

                    <div v-else class="recipe-list">
                        <div
                            v-for="recipe in favourites"
                            :key="recipe.id"
                            class="recipe-row"
                        >
                            <span class="recipe-row-num"></span>
                            <RouterLink
                                :to="{ name: 'recipe-detail', params: { id: recipe.id } }"
                                class="recipe-row-title"
                            >{{ recipe.title }}</RouterLink>
                            <span class="recipe-row-author">by {{ recipe.author.name }}</span>
                            <span class="recipe-row-likes">♥ {{ recipe.likes_count }}</span>
                        </div>
                    </div>

                    <div class="page-spacer"></div>
                    <div class="page-footer-rule"></div>
                </div>
            </div>

            <div class="book-cover book-cover--right"></div>
        </div>

        <ConfirmModal
            v-model="showDeleteModal"
            title="Remove from the pantry?"
            message="Once deleted, this recipe is gone for good. Are you sure?"
            confirmLabel="Delete it"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRecipesStore } from '../stores/recipes';
import { favouritesApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal.vue';

const auth         = useAuthStore();
const recipesStore = useRecipesStore();

const tab             = ref('mine');
const pressingTab     = ref(null);
const showDeleteModal = ref(false);
const pendingDeleteId = ref(null);
const isLoading       = ref(false);
const favourites      = ref([]);

onMounted(async () => {
    isLoading.value = true;
    const [, favData] = await Promise.all([
        recipesStore.fetchRecipes(),
        favouritesApi.index(),
    ]);
    favourites.value = favData.data ?? favData;
    isLoading.value  = false;
});

const myRecipes  = computed(() =>
    recipesStore.recipes.filter(r => r.author?.id === auth.user.id)
);

const totalLikes = computed(() =>
    myRecipes.value.reduce((sum, r) => sum + (r.likes_count ?? 0), 0)
);

function deleteRecipe(id) {
    pendingDeleteId.value = id;
    showDeleteModal.value = true;
}

async function confirmDelete() {
    await recipesStore.deleteRecipe(pendingDeleteId.value);
    pendingDeleteId.value = null;
}
</script>

<style scoped>
.profile-wrap { padding-bottom: 3rem; }

/* ══ Book shell ══ */
.recipe-book {
    display: flex;
    align-items: stretch;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 46px; /* space for bookmarks */
    overflow: visible;
}

.book-cover {
    width: 24px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.book-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 10px rgba(0,0,0,.5); }
.book-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset 4px 0 10px rgba(0,0,0,.5); }

.book-spread {
    display: flex;
    flex: 1;
    position: relative;
    overflow: visible;
}

/* ══ Bookmarks ══ */
.bookmarks {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    transform: translateY(-100%);
    display: flex;
    z-index: 30;
    pointer-events: none;
    align-items: flex-end;
}

.bookmark-group {
    display: flex;
    pointer-events: all;
}
.bookmark-group--left  { width: calc(50% - 10px); justify-content: center; }
.bookmark-group--right { width: calc(50% - 10px); justify-content: center; margin-left: 20px; }

.bookmark {
    font-family: 'Playfair Display', serif;
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: #c9a03d;
    background: linear-gradient(180deg, #5a3820 0%, #4a2e14 100%);
    border: 1px solid #8b5a2855;
    border-bottom: none;
    padding: .4rem 1.6rem .5rem;
    cursor: pointer;
    border-radius: 5px 5px 0 0;
    transform-origin: bottom center;
    transition: transform .15s cubic-bezier(.34,1.56,.64,1), background .15s, color .12s;
    position: relative;
    box-shadow: 0 -3px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,220,120,.12);
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    white-space: nowrap;
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
    transform: translateY(-4px) rotate(-0.5deg);
    color: #f0c060;
    background: linear-gradient(180deg, #6b4525 0%, #5a3418 100%);
}
.bookmark:hover::after { border-top-color: #5a3418; }
.bookmark.pressing {
    transform: translateY(3px) scaleY(.93) !important;
    transition: transform .08s ease !important;
}
.bookmark.active {
    background: linear-gradient(180deg, #fef7e9 0%, #f5e8c8 100%);
    color: #6b3a10;
    border-color: #c9a03d88;
    height: 44px;
    box-shadow: 0 -4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.5);
    transform: translateY(-2px);
    z-index: 2;
}
.bookmark.active::after { border-top-color: #f5e8c8; }
.bookmark.active:hover  { transform: translateY(-5px); }

.bm-count {
    background: #c9a03d33;
    border-radius: 20px;
    padding: .1rem .45rem;
    font-size: .65rem;
    font-weight: 700;
}
.bookmark.active .bm-count { background: #8b5a2822; }

/* ══ Pages ══ */
.book-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: .9rem;
    position: relative;
    min-height: 640px;
}
.book-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(transparent, transparent 32px, #d4a85410 33px);
}
.book-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.07); }
.book-page--right { box-shadow: inset 8px 0 20px rgba(0,0,0,.07); }

/* Active page subtle highlight */
.page-active { background: #fef7e9; }

.page-header {
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

/* ══ Profile card ══ */
.profile-card {
    display: flex;
    gap: 1.1rem;
    align-items: flex-start;
    position: relative;
    z-index: 1;
    background: #fffdf4;
    border: 1px solid #c9a03d44;
    border-radius: 8px;
    padding: 1rem 1.1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

.profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c9a03d, #a07828);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
    box-shadow: 0 3px 0 #7a5a00, 0 4px 12px rgba(0,0,0,.25);
}

.profile-info { flex: 1; }

.profile-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    color: #2c1e0e;
    margin: 0 0 .18rem;
    text-shadow: none;
    letter-spacing: -.01em;
}
.profile-bio {
    font-size: .78rem;
    color: #7a5a35;
    margin: 0 0 .15rem;
    font-style: italic;
    line-height: 1.4;
}
.profile-email {
    font-size: .72rem;
    color: #a08060;
    margin: 0 0 .65rem;
}

.profile-stats {
    display: flex;
    align-items: center;
    gap: .7rem;
}
.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .05rem;
}
.stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: #2c1e0e;
    line-height: 1;
}
.stat-label {
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #a08060;
}
.stat-divider {
    width: 1px;
    height: 24px;
    background: #c9a03d44;
}

/* ══ Section title ══ */
.page-divider {
    height: 1px;
    background: #c9a03d33;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}
.page-section-title {
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    color: #8b5a28;
    text-transform: uppercase;
    letter-spacing: .1em;
    font-weight: 700;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}

/* ══ Recipe list rows ══ */
.recipe-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 1;
    flex: 1;
}
.recipe-row {
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: .55rem 0;
    border-bottom: 1px dotted #c9a03d33;
}
.recipe-row:last-child { border-bottom: none; }

.recipe-row-num {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c9a03d88;
    flex-shrink: 0;
}
.recipe-row-title {
    flex: 1;
    font-family: 'Playfair Display', serif;
    font-size: .88rem;
    color: #2c1e0e;
    text-decoration: none;
    line-height: 1.3;
    transition: color .12s;
}
.recipe-row-title:hover { color: #8b5a28; text-decoration: underline wavy #c9a03d44 1px; }
.recipe-row-likes  { font-size: .72rem; color: #b86b3f; flex-shrink: 0; }
.recipe-row-author { font-size: .7rem; color: #a08060; font-style: italic; flex-shrink: 0; }

.del-btn {
    flex-shrink: 0;
    background: transparent;
    border: 1px solid #c0503066;
    border-radius: 20px;
    color: #c05030;
    font-size: .62rem;
    padding: .15rem .55rem;
    cursor: pointer;
    transition: background .12s;
}
.del-btn:hover { background: #c0503018; }

/* ══ Empty states ══ */
.page-empty {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    color: #a08060;
    font-style: italic;
    font-size: .85rem;
    padding: .5rem 0;
}
.empty-cta {
    color: #c9a03d;
    font-size: .8rem;
    font-style: normal;
    text-decoration: none;
    font-weight: 600;
}
.empty-cta:hover { text-decoration: underline; }

.page-loading {
    color: #a08060;
    font-style: italic;
    font-size: .85rem;
    position: relative;
    z-index: 1;
}

/* ══ Add recipe button + footer ══ */
.page-spacer { flex: 1; min-height: .5rem; }

.add-recipe-btn {
    display: inline-block;
    align-self: flex-start;
    position: relative;
    z-index: 1;
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    text-decoration: none;
    font-family: 'Playfair Display', serif;
    font-size: .82rem;
    font-weight: 700;
    padding: .45rem 1.1rem;
    border-radius: 60px;
    box-shadow: 0 3px 0 #7a5a00;
    transition: transform .1s;
}
.add-recipe-btn:hover { transform: translateY(-1px); text-decoration: none; }

.page-footer-rule {
    height: 1px;
    background: #c9a03d44;
    margin-top: .5rem;
    flex-shrink: 0;
}

/* ══ Spine ══ */
.book-spine {
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
.spine-line {
    width: 2px;
    height: 40px;
    background: rgba(255,210,120,.18);
    border-radius: 1px;
}

/* ══ Mobile: unwrap ══ */
@media (max-width: 768px) {
    .recipe-book       { display: block; box-shadow: none; border-radius: 0; padding-top: 0; }
    .book-cover        { display: none; }
    .book-spine        { display: none; }
    .book-spread       { display: block; position: static; }
    .bookmarks         { position: static; transform: none; display: flex; gap: 1rem; margin-bottom: 1.2rem; }
    .bookmark-group    { width: auto; margin: 0; }
    .bookmark-group--right { margin-left: 0; }
    .bookmark {
        border-radius: 20px;
        border-bottom: 1px solid #8b5a2855;
        height: 32px;
        padding: .3rem 1rem;
    }
    .bookmark::after   { display: none; }
    .bookmark.active   { height: 32px; transform: none; }
    .book-page {
        background: transparent;
        padding: 0;
        min-height: unset;
        box-shadow: none;
        gap: 1rem;
    }
    .book-page::before  { display: none; }
    .book-page--right   { margin-top: 2rem; }
    .page-header        { display: none; }
    .page-footer-rule   { display: none; }
    .page-spacer        { display: none; }
    .profile-card       { flex-direction: column; align-items: center; text-align: center; }
    .profile-stats      { justify-content: center; }
    .recipe-row-title   { font-size: .95rem; }
}
</style>
