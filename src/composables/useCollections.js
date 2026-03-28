import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCollectionsStore } from '../stores/useCollectionsStore';

export function useCollections() {
    const store                        = useCollectionsStore();
    const { isLoading, error, sorted } = storeToRefs(store);

    onMounted(() => {
        store.fetchCollections();
    });

    return {
        isLoading,
        error,
        collections:       sorted,
        fetchCollections:  store.fetchCollections,
        fetchCollection:   store.fetchCollection,
        createCollection:  store.createCollection,
        updateCollection:  store.updateCollection,
        deleteCollection:  store.deleteCollection,
        addRecipe:         store.addRecipe,
        removeRecipe:      store.removeRecipe,
        isRecipeInCollection: store.isRecipeInCollection,
    };
}
