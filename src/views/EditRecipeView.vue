<template>
    <div class="write-page">
        <h1>Edit Recipe</h1>

        <div v-if="isLoading" class="loading">Loading…</div>
        <div v-else-if="!recipe" class="empty">Recipe not found.</div>

        <template v-else>
            <div v-if="apiError" class="api-error">{{ apiError }}</div>

            <form @submit.prevent="submit" class="form" novalidate>

                <div class="field">
                    <label>Title</label>
                    <input
                        v-model="form.values.value.title"
                        type="text"
                        @blur="form.touch('title')"
                        :class="{ error: form.errors.value.title && form.touched.value.title }"
                    />
                    <span class="err-msg" v-if="form.errors.value.title && form.touched.value.title">
                        {{ form.errors.value.title }}
                    </span>
                </div>

                <div class="field">
                    <label>Description</label>
                    <textarea
                        v-model="form.values.value.description"
                        rows="6"
                        @blur="form.touch('description')"
                        :class="{ error: form.errors.value.description && form.touched.value.description }"
                    ></textarea>
                    <span class="err-msg" v-if="form.errors.value.description && form.touched.value.description">
                        {{ form.errors.value.description }}
                    </span>
                </div>

                <div class="field">
                    <label>Category</label>
                    <select v-model="form.values.value.category" @blur="form.touch('category')">
                        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>

                <div class="field">
                    <label>Difficulty</label>
                    <select v-model="form.values.value.difficulty" @blur="form.touch('difficulty')">
                        <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
                    </select>
                </div>

                <div class="field">
                    <label>Prep time (minutes)</label>
                    <input v-model="form.values.value.prep_time" type="number" min="0" />
                </div>

                <div class="field">
                    <label>Cook time (minutes)</label>
                    <input v-model="form.values.value.cook_time" type="number" min="0" />
                </div>

                <div class="field">
                    <label>Steps</label>
                    <div v-for="(step, index) in form.values.value.steps" :key="index" class="step-row">
                        <input type="text" v-model="form.values.value.steps[index]" placeholder="Enter step" />
                        <button type="button" @click="removeStep(index)" v-if="form.values.value.steps.length > 1">✖</button>
                    </div>
                    <button type="button" @click="addStep">Add Step</button>
                </div>

                <div class="field">
                    <label>Ingredients</label>
                    <div v-for="(ing, index) in form.values.value.ingredients" :key="index" class="ingredient-row">
                        <input type="text" v-model="ing.name" placeholder="Name" />
                        <input type="text" v-model="ing.amount" placeholder="Amount" />
                        <button type="button" @click="removeIngredient(index)" v-if="form.values.value.ingredients.length > 1">✖</button>
                    </div>
                    <button type="button" @click="addIngredient">Add Ingredient</button>
                </div>

                <div class="field">
                    <label>Image <span class="optional">(optional — leave empty to keep current)</span></label>

                    <!-- Current image -->
                    <div v-if="currentImageUrl && !imagePreview" class="current-image-wrap">
                        <img :src="currentImageUrl" alt="Current image" class="current-image" />
                        <button type="button" class="remove-image" @click="clearCurrentImage">✖ Remove image</button>
                    </div>

                    <!-- New image preview -->
                    <div v-if="imagePreview" class="image-upload has-preview" @click="triggerFileInput">
                        <img :src="imagePreview" class="image-preview" alt="Preview" />
                        <button type="button" class="remove-image" @click.stop="removeImage">✖</button>
                    </div>

                    <!-- Upload area (shown when no current and no preview) -->
                    <div v-if="!currentImageUrl && !imagePreview" class="image-upload" @click="triggerFileInput">
                        <div class="upload-placeholder">
                            <span class="upload-icon">🖼</span>
                            <span>Click to upload a new image</span>
                            <span class="upload-hint">JPG, PNG or WebP · max 4MB</span>
                        </div>
                    </div>

                    <!-- Replace button when current image exists -->
                    <button v-if="currentImageUrl && !imagePreview" type="button" class="replace-img-btn" @click="triggerFileInput">
                        Replace image
                    </button>

                    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="onFileChange" />
                </div>

                <div class="actions">
                    <button type="button" class="cancel-btn" @click="router.back()">Cancel</button>
                    <button type="submit" class="submit-btn" :disabled="recipesStore.isLoading">
                        {{ recipesStore.isLoading ? 'Saving…' : 'Save changes' }}
                    </button>
                </div>
            </form>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecipesStore } from '../stores/recipes';
import { useForm } from '../composables/useForm';

const router       = useRouter();
const route        = useRoute();
const recipesStore = useRecipesStore();

const recipe         = ref(null);
const isLoading      = ref(true);
const apiError       = ref(null);
const fileInput      = ref(null);
const imagePreview   = ref(null);
const currentImageUrl = ref(null);
const removeCurrentImage = ref(false);

const categories = recipesStore.categories;
const levels     = recipesStore.levels;

const form = useForm(
    { title: '', description: '', category: '', difficulty: '', prep_time: '', cook_time: '', steps: [''], ingredients: [{ name: '', amount: '' }], image: null },
    {
        title:       v => (v && v.trim().length >= 3)  || 'Title must be at least 3 characters.',
        description: v => (v && v.trim().length >= 20) || 'Description must be at least 20 characters.',
    }
);

onMounted(async () => {
    recipe.value = await recipesStore.getById(route.params.id);
    if (recipe.value) {
        form.values.value = {
            title:        recipe.value.title,
            description:  recipe.value.description,
            category:     recipe.value.category,
            difficulty:   recipe.value.difficulty,
            prep_time:    recipe.value.prep_time,
            cook_time:    recipe.value.cook_time,
            steps:        [...recipe.value.steps],
            ingredients:  recipe.value.ingredients.map(i => ({ ...i })),
            image:        null,
        };
        currentImageUrl.value = recipe.value.image_url ?? null;
    }
    isLoading.value = false;
});

function triggerFileInput() { fileInput.value.click(); }

function onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    form.values.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
    currentImageUrl.value = null; // hide the old one
}

function removeImage() {
    form.values.value.image = null;
    imagePreview.value = null;
    fileInput.value.value = '';
    currentImageUrl.value = recipe.value?.image_url ?? null; // restore old preview
}

function clearCurrentImage() {
    currentImageUrl.value = null;
    removeCurrentImage.value = true;
}

function addStep()             { form.values.value.steps.push(''); }
function removeStep(i)         { form.values.value.steps.splice(i, 1); }
function addIngredient()       { form.values.value.ingredients.push({ name: '', amount: '' }); }
function removeIngredient(i)   { form.values.value.ingredients.splice(i, 1); }

async function submit() {
    if (!form.validate()) return;
    apiError.value = null;
    try {
        const payload = {
            ...form.values.value,
            prep_time: Number(form.values.value.prep_time),
            cook_time: Number(form.values.value.cook_time),
        };
        // Tell the API to remove the image if user cleared it
        if (removeCurrentImage.value && !payload.image) {
            payload.remove_image = '1';
        }
        const updated = await recipesStore.updateRecipe(route.params.id, payload);
        router.push({ name: 'recipe-detail', params: { id: updated.id } });
    } catch (err) {
        apiError.value = err.message;
    }
}
</script>

<style scoped>
.err-msg   { color: #f4a96a; }
.api-error { color: #f4a96a; }
.optional  { font-size: 0.8rem; opacity: 0.6; font-weight: normal; }
.hidden-input { display: none; }
.current-image-wrap { position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 0.5rem; }
.current-image { width: 100%; max-height: 240px; object-fit: cover; display: block; border-radius: 16px; border: 2px solid #b78c5a; }
.image-upload {
    position: relative; border: 2px dashed #b78c5a; border-radius: 16px;
    cursor: pointer; overflow: hidden; min-height: 160px;
    display: flex; align-items: center; justify-content: center;
    background: #fff5e640; transition: border-color 0.2s;
}
.image-upload:hover { border-color: #c9a03d; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; color: #a08060; font-size: 0.95rem; }
.upload-icon  { font-size: 2.5rem; }
.upload-hint  { font-size: 0.78rem; opacity: 0.7; }
.image-preview { width: 100%; max-height: 280px; object-fit: cover; display: block; }
.remove-image {
    position: absolute; top: 0.5rem; right: 0.5rem;
    background: #a14545cc; border: none; border-radius: 60px;
    padding: 0.3rem 0.8rem; color: white; font-size: 0.85rem; cursor: pointer;
}
.replace-img-btn {
    margin-top: 0.5rem; background: #8b6b4130; border: 1px solid #b78c5a;
    border-radius: 60px; padding: 0.4rem 1.2rem; color: #c9a03d;
    cursor: pointer; font-size: 0.9rem;
}
</style>
