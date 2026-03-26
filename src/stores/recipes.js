import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { recipesApi } from '../services/api';

const CATEGORIES = ['breakfast', 'pasta', 'soup', 'salad', 'meat', 'dessert', 'vegetarian'];
const LEVELS     = ['easy', 'medium', 'hard'];

export const useRecipesStore = defineStore('recipes', () => {
    const recipes       = ref([]);
    const categories    = ref([...CATEGORIES]);
    const levels        = ref([...LEVELS]);
    const isLoading     = ref(false);
    const error         = ref(null);
    const search        = ref('');
    const activeTag     = ref('');

    // Pagination
    const currentPage   = ref(1);
    const lastPage      = ref(1);
    const total         = ref(0);
    const perPage       = ref(10);

    // Getters
    const filtered = computed(() => {
        const q = search.value.toLowerCase();
        return recipes.value
            .filter(r => !q || (r.title ?? '').toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q))
            .filter(r => !activeTag.value || r.category === activeTag.value)
            .sort((a, b) => {
                // created_at may be a Laravel timestamp object { date: '...' } or an ISO string
                const dateA = new Date(a.created_at?.date ?? a.created_at);
                const dateB = new Date(b.created_at?.date ?? b.created_at);
                return dateB - dateA;
            });
    });

    const hasMorePages = computed(() => currentPage.value < lastPage.value);

    /**
     * Fetch page 1 fresh (replaces current recipes).
     * Called on mount and when filters/search change.
     */
    async function fetchRecipes(page = 1) {
        isLoading.value = true;
        error.value     = null;
        try {
            const data = await recipesApi.index({ page, per_page: perPage.value });
            recipes.value     = data.data ?? data;
            currentPage.value = data.meta?.current_page ?? page;
            lastPage.value    = data.meta?.last_page    ?? 1;
            total.value       = data.meta?.total        ?? recipes.value.length;
            perPage.value     = data.meta?.per_page     ?? 10;
        } catch (err) {
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch the next API page and APPEND results to the existing list.
     * Called by HomeView when the user turns toward the last loaded spread.
     */
    async function fetchNextPage() {
        if (isLoading.value || !hasMorePages.value) return;
        isLoading.value = true;
        error.value     = null;
        try {
            const nextPage = currentPage.value + 1;
            const data = await recipesApi.index({ page: nextPage, per_page: perPage.value });
            const newRecipes  = data.data ?? data;
            const existingIds = new Set(recipes.value.map(r => r.id));
            const unique      = newRecipes.filter(r => !existingIds.has(r.id));
            recipes.value     = [...recipes.value, ...unique];
            currentPage.value = data.meta?.current_page ?? nextPage;
            lastPage.value    = data.meta?.last_page    ?? lastPage.value;
            total.value       = data.meta?.total        ?? recipes.value.length;
        } catch (err) {
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }
    }

    // Get a single recipe — tries local cache first, then fetches from API
    async function getById(id) {
        const local = recipes.value.find(r => r.id === Number(id));
        if (local) return local;

        try {
            const data = await recipesApi.show(id);
            return data.data ?? data;
        } catch {
            return null;
        }
    }

    function buildFormData(payload) {
        const fd = new FormData();

        Object.entries(payload).forEach(([key, val]) => {
            if (val === null || val === undefined) return;

            if (key === 'images') {
                // array of { file, previewUrl } for new uploads
                // or { id, path, order, is_primary } for existing
                val.forEach((img, i) => {
                    if (img.file instanceof File) {
                        fd.append(`images[${i}][file]`, img.file);
                    }
                    else if (img.id) {
                        fd.append(`images[${i}][id]`, img.id);
                    }
                });

                return;
            }

            if (key === 'nutritional_info' && typeof val === 'object') {
                Object.entries(val).forEach(([k, v]) => {
                    if (v !== null && v !== undefined) {
                        fd.append(`nutritional_info[${k}]`, v);
                    }
                });

                return;
            }

            if (key === 'ingredients' && Array.isArray(val)) {
                val.forEach((ing, i) => {
                    fd.append(`ingredients[${i}][quantity]`, ing.quantity ?? '');
                    fd.append(`ingredients[${i}][unit]`,     ing.unit     ?? '');
                    fd.append(`ingredients[${i}][name]`,     ing.name     ?? '');
                });

                return;
            }

            if (key === 'steps' && Array.isArray(val)) {
                val.forEach((step, i) => fd.append(`steps[${i}]`, step));

                return;
            }

            fd.append(key, val);
        });

        return fd;
    }

    async function createRecipe(payload) {
        isLoading.value = true;
        error.value     = null;

        try {
            const fd        = buildFormData(payload);
            const data      = await recipesApi.store(fd);
            const newRecipe = data.data ?? data;

            if (newRecipe.status === 'published') {
                recipes.value.unshift(newRecipe);
            }

            return newRecipe;
        }
        catch (err) {
            error.value = err.message;
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    }

    async function updateRecipe(id, payload) {
        isLoading.value = true;
        error.value     = null;

        try {
            const fd = buildFormData(payload);
            fd.append('_method', 'PUT');

            const data    = await recipesApi.update(id, fd);
            const updated = data.data ?? data;
            const idx     = recipes.value.findIndex(r => r.id === Number(id));

            if (updated.status === 'published') {
                if (idx !== -1) recipes.value[idx] = updated;
                else recipes.value.unshift(updated);
            }
            else {
                if (idx !== -1) recipes.value.splice(idx, 1);
            }

            return updated;
        }
        catch (err) {
            error.value = err.message;
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    }

    async function deleteRecipe(id) {
        await recipesApi.destroy(id);
        recipes.value = recipes.value.filter(r => r.id !== Number(id));
    }

    async function likeRecipe(id) {
        const data   = await recipesApi.like(id);
        const recipe = recipes.value.find(r => r.id === Number(id));
        if (recipe) {
            // API returns the updated likes_count and is_liked flag
            recipe.likes_count = data.likes_count;
            recipe.is_liked    = data.liked;
        }
        return data;
    }

    async function favouriteRecipe(id) {
        const data   = await recipesApi.favourite(id);
        const recipe = recipes.value.find(r => r.id === Number(id));
        if (recipe) {
            recipe.is_favourited = data.favourited;
        }
        return data;
    }

    return {
        recipes,
        categories,
        levels,
        isLoading,
        error,
        search,
        activeTag,
        currentPage,
        lastPage,
        total,
        perPage,
        hasMorePages,
        filtered,
        fetchRecipes,
        fetchNextPage,
        getById,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        likeRecipe,
        favouriteRecipe,
    };
});
