import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { recipesApi } from '../services/api';

const CATEGORIES = ['breakfast', 'pasta', 'soup', 'salad', 'meat', 'dessert', 'vegetarian'];
const LEVELS     = ['easy', 'medium', 'hard'];

export const useRecipesStore = defineStore('recipes', () => {
    const recipes    = ref([]);
    const categories = ref([...CATEGORIES]);
    const levels     = ref([...LEVELS]);
    const isLoading  = ref(false);
    const error      = ref(null);
    const search     = ref('');
    const activeTag  = ref('');

    // Getters
    const filtered = computed(() => {
        const q = search.value.toLowerCase();
        return recipes.value
            .filter(r => !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
            .filter(r => !activeTag.value || r.category === activeTag.value)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });

    // Fetch all recipes from the API
    async function fetchRecipes() {
        isLoading.value = true;
        error.value     = null;
        try {
            const data  = await recipesApi.index();
            // Laravel returns { data: [...] } via API resources
            recipes.value = data.data ?? data;
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

    async function createRecipe(payload) {
        isLoading.value = true;
        error.value     = null;
        try {
            // Build FormData so the image file is sent as multipart
            const fd = new FormData();
            Object.entries(payload).forEach(([key, val]) => {
                if (key === 'image') {
                    if (val) fd.append('image', val);
                } else if (Array.isArray(val)) {
                    val.forEach((item, i) => {
                        if (typeof item === 'object') {
                            Object.entries(item).forEach(([k, v]) => fd.append(`${key}[${i}][${k}]`, v));
                        } else {
                            fd.append(`${key}[${i}]`, item);
                        }
                    });
                } else {
                    fd.append(key, val);
                }
            });

            const data      = await recipesApi.store(fd);
            const newRecipe = data.data ?? data;
            recipes.value.unshift(newRecipe);
            return newRecipe;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateRecipe(id, payload) {
        isLoading.value = true;
        error.value     = null;
        try {
            const fd = new FormData();
            Object.entries(payload).forEach(([key, val]) => {
                if (key === 'image') {
                    if (val instanceof File) fd.append('image', val);
                } else if (Array.isArray(val)) {
                    val.forEach((item, i) => {
                        if (typeof item === 'object') {
                            Object.entries(item).forEach(([k, v]) => fd.append(`${key}[${i}][${k}]`, v));
                        } else {
                            fd.append(`${key}[${i}]`, item);
                        }
                    });
                } else {
                    fd.append(key, val);
                }
            });

            const data    = await recipesApi.update(id, fd);
            const updated = data.data ?? data;

            // Update in local cache
            const idx = recipes.value.findIndex(r => r.id === Number(id));
            if (idx !== -1) recipes.value[idx] = updated;

            return updated;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
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
        filtered,
        fetchRecipes,
        getById,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        likeRecipe,
        favouriteRecipe,
    };
});
