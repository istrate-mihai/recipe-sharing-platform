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
                @click="onTagChange('')"
                :class="{ active: recipesStore.activeTag === '' }"
            >All</button>

            <button
                v-for="category in recipesStore.categories"
                :key="category"
                @click="onTagChange(category)"
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
            <div class="recipe-grid">
                <RecipeCard
                    v-for="recipe in recipesStore.filtered"
                    :key="recipe.id"
                    :recipe="recipe"
                />
            </div>

            <!-- Pagination -->
            <div v-if="recipesStore.lastPage > 1" class="pagination-wrap">
                <div class="pagination">
                    <button
                        class="page-btn"
                        :disabled="recipesStore.currentPage === 1"
                        @click="goToPage(recipesStore.currentPage - 1)"
                    >← Prev</button>

                    <button
                        v-for="page in pageNumbers"
                        :key="page"
                        class="page-btn"
                        :class="{ active: page === recipesStore.currentPage }"
                        @click="goToPage(page)"
                    >{{ page }}</button>

                    <button
                        class="page-btn"
                        :disabled="recipesStore.currentPage === recipesStore.lastPage"
                        @click="goToPage(recipesStore.currentPage + 1)"
                    >Next →</button>
                </div>

                <p class="pagination-meta">
                    Page {{ recipesStore.currentPage }} of {{ recipesStore.lastPage }}
                    &nbsp;·&nbsp; {{ recipesStore.total }} recipes total
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRecipesStore } from '../stores/recipes';
import RecipeCard from '../components/RecipeCard.vue';

const recipesStore = useRecipesStore();

onMounted(() => {
    recipesStore.fetchRecipes(1);
});

function goToPage(page) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    recipesStore.fetchRecipes(page);
}

// Reset to page 1 when changing category filter
function onTagChange(tag) {
    recipesStore.activeTag = tag;
    recipesStore.fetchRecipes(1);
}

// Show at most 7 page buttons, centred around current page
const pageNumbers = computed(() => {
    const total = recipesStore.lastPage;
    const cur   = recipesStore.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    let start = Math.max(1, cur - 3);
    let end   = Math.min(total, start + 6);
    start     = Math.max(1, end - 6);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>

<style scoped>
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2.8rem 2.4rem;
    margin-top: 1rem;
    /* extra bottom padding so card box-shadows aren't clipped */
    padding-bottom: 2rem;
}

/* Last card alone on a row: cap its width so it doesn't stretch full grid width */
.recipe-grid > :last-child:nth-child(odd) {
    max-width: 520px;
}

@media (max-width: 640px) {
    .recipe-grid {
        grid-template-columns: 1fr;
        gap: 1.8rem;
    }
    .recipe-grid > :last-child:nth-child(odd) {
        max-width: 100%;
    }
}

/* ── Pagination ── */
.pagination-wrap {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px dashed #b78c5a40;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.page-btn {
    background: #fbe9c3;
    color: #2c1e0e;
    border: 2px solid #b78c5a;
    box-shadow: 0 4px 0 #9c7c5b;
    font-size: 1rem;
    padding: 0.45rem 1rem;
    min-width: 2.8rem;
    border-radius: 50px;
    cursor: pointer;
    transition: 0.15s;
}
.page-btn:hover:not(:disabled) {
    background: #c9a03d;
    transform: translateY(2px);
    box-shadow: 0 2px 0 #7f6139;
}
.page-btn.active {
    background: #4d7a4d;
    color: #fbe9c3;
    border-color: #2b4a2b;
    box-shadow: 0 4px 0 #2b4a2b;
    font-weight: 700;
}
.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
}

.pagination-meta {
    text-align: center;
    color: #a08060;
    font-size: 0.9rem;
    margin: 0 0 2rem;
}
</style>
