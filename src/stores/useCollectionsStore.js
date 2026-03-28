import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { collectionsApi } from '../services/api';

export const useCollectionsStore = defineStore('collections', () => {
    const collections = ref([]);
    const isLoading   = ref(false);
    const error       = ref(null);

    // ── Getters ───────────────────────────────────────────────────────────

    const sorted = computed(() =>
        [...collections.value].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
    );

    // ── Actions ───────────────────────────────────────────────────────────

    async function fetchCollections() {
        isLoading.value = true;
        error.value     = null;
        try {
            const data        = await collectionsApi.index();
            collections.value = data.data ?? data;
        }
        catch (err) {
            error.value = err.message;
        }
        finally {
            isLoading.value = false;
        }
    }

    async function fetchCollection(id) {
        isLoading.value = true;
        error.value     = null;
        try {
            const data = await collectionsApi.show(id);
            return data.data ?? data;
        } catch (err) {
            error.value = err.message;
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function createCollection(payload) {
        isLoading.value = true;
        error.value     = null;
        try {
            const data       = await collectionsApi.store(payload);
            const created    = data.data ?? data;
            collections.value.unshift(created);
            return created;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateCollection(id, payload) {
        isLoading.value = true;
        error.value     = null;
        try {
            const data    = await collectionsApi.update(id, payload);
            const updated = data.data ?? data;
            const idx     = collections.value.findIndex(c => c.id === Number(id));
            if (idx !== -1) collections.value[idx] = updated;
            return updated;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteCollection(id) {
        await collectionsApi.destroy(id);
        collections.value = collections.value.filter(c => c.id !== Number(id));
    }

    async function addRecipe(collectionId, recipeId) {
        await collectionsApi.addRecipe(collectionId, recipeId);
        // Update local recipe_count optimistically
        const col = collections.value.find(c => c.id === Number(collectionId));
        if (col) col.recipe_count = (col.recipe_count ?? 0) + 1;
    }

    async function removeRecipe(collectionId, recipeId) {
        await collectionsApi.removeRecipe(collectionId, recipeId);
        const col = collections.value.find(c => c.id === Number(collectionId));
        if (col) col.recipe_count = Math.max(0, (col.recipe_count ?? 1) - 1);
    }

    function isRecipeInCollection(collectionId, recipeId) {
        const col = collections.value.find(c => c.id === Number(collectionId));
        return col?.recipes?.some(r => r.id === Number(recipeId)) ?? false;
    }

    function reset() {
        collections.value = [];
        error.value       = null;
    }

    return {
        collections,
        isLoading,
        error,
        sorted,
        fetchCollections,
        fetchCollection,
        createCollection,
        updateCollection,
        deleteCollection,
        addRecipe,
        removeRecipe,
        isRecipeInCollection,
        reset,
    };
});
