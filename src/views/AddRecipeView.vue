<template>
    <div class="write-page">
        <h1>New Recipe</h1>

        <div v-if="apiError" class="api-error">{{ apiError }}</div>

        <form @submit.prevent="submit" class="form" novalidate>
            <div class="field">
                <label>Title</label>
                <input
                    v-model="form.values.value.title"
                    type="text"
                    placeholder="Your recipe title"
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
                    rows="12"
                    placeholder="Write something worth eating…"
                    @blur="form.touch('description')"
                    :class="{ error: form.errors.value.description && form.touched.value.description }"
                ></textarea>
                <span class="err-msg" v-if="form.errors.value.description && form.touched.value.description">
                    {{ form.errors.value.description }}
                </span>
            </div>

            <div class="field">
                <label>Image <span class="optional">(optional)</span></label>
                <div class="image-upload" @click="triggerFileInput" :class="{ 'has-preview': imagePreview }">
                    <img v-if="imagePreview" :src="imagePreview" class="image-preview" alt="Preview" />
                    <div v-else class="upload-placeholder">
                        <span class="upload-icon">🖼</span>
                        <span>Click to upload an image</span>
                        <span class="upload-hint">JPG, PNG or WebP · max 4MB</span>
                    </div>
                    <button v-if="imagePreview" type="button" class="remove-image" @click.stop="removeImage">✖</button>
                </div>
                <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="onFileChange" />
            </div>

            <div class="field">
                <label>Category</label>
                <select
                    v-model="form.values.value.category"
                    @blur="form.touch('category')"
                    :class="{ error: form.errors.value.category && form.touched.value.category }"
                >
                    <option value="">Select a category</option>
                    <option v-for="(category, i) in categories" :key="i" :value="category">
                        {{ category }}
                    </option>
                </select>
                <span class="err-msg" v-if="form.errors.value.category && form.touched.value.category">
                    {{ form.errors.value.category }}
                </span>
            </div>

            <div class="field">
                <label>Difficulty</label>
                <select
                    v-model="form.values.value.difficulty"
                    @blur="form.touch('difficulty')"
                    :class="{ error: form.errors.value.difficulty && form.touched.value.difficulty }"
                >
                    <option value="">Select difficulty</option>
                    <option v-for="(difficulty, i) in levels" :key="i" :value="difficulty">
                        {{ difficulty }}
                    </option>
                </select>
                <span class="err-msg" v-if="form.errors.value.difficulty && form.touched.value.difficulty">
                    {{ form.errors.value.difficulty }}
                </span>
            </div>

            <div class="field">
                <label>Prep time (minutes)</label>
                <input
                    v-model="form.values.value.prep_time"
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    @blur="form.touch('prep_time')"
                    :class="{ error: form.errors.value.prep_time && form.touched.value.prep_time }"
                />
                <span class="err-msg" v-if="form.errors.value.prep_time && form.touched.value.prep_time">
                    {{ form.errors.value.prep_time }}
                </span>
            </div>

            <div class="field">
                <label>Cook time (minutes)</label>
                <input
                    v-model="form.values.value.cook_time"
                    type="number"
                    min="0"
                    placeholder="e.g. 30"
                    @blur="form.touch('cook_time')"
                    :class="{ error: form.errors.value.cook_time && form.touched.value.cook_time }"
                />
                <span class="err-msg" v-if="form.errors.value.cook_time && form.touched.value.cook_time">
                    {{ form.errors.value.cook_time }}
                </span>
            </div>

            <div class="field">
                <label>Recipe steps</label>
                <div v-for="(step, index) in form.values.value.steps" :key="index" class="step-row">
                    <input
                        type="text"
                        v-model="form.values.value.steps[index]"
                        placeholder="Enter step"
                        @blur="form.touch('steps')"
                    />
                    <button type="button" @click="removeRecipeStep(index)" v-if="form.values.value.steps.length > 1">✖</button>
                </div>
                <button type="button" @click="addRecipeStep">Add Step</button>
                <span class="err-msg" v-if="form.errors.value.steps && form.touched.value.steps">
                    {{ form.errors.value.steps }}
                </span>
            </div>

            <div class="field">
                <label>Ingredients</label>
                <div v-for="(ing, index) in form.values.value.ingredients" :key="index" class="ingredient-row">
                    <input
                        type="text"
                        v-model="ing.name"
                        placeholder="Name"
                        @blur="form.touch('ingredients')"
                    />
                    <input
                        type="text"
                        v-model="ing.amount"
                        placeholder="Amount (e.g., 200g)"
                        @blur="form.touch('ingredients')"
                    />
                    <button type="button" @click="removeRecipeIngredient(index)" v-if="form.values.value.ingredients.length > 1">✖</button>
                </div>
                <button type="button" @click="addRecipeIngredient">Add Ingredient</button>
                <span class="err-msg" v-if="form.errors.value.ingredients && form.touched.value.ingredients">
                    {{ form.errors.value.ingredients }}
                </span>
            </div>

            <div class="actions">
                <button type="button" class="cancel-btn" @click="router.back()">Cancel</button>
                <button type="submit" class="submit-btn" :disabled="recipesStore.isLoading">
                    {{ recipesStore.isLoading ? 'Sharing…' : 'Share' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipesStore } from '../stores/recipes';
import { useForm } from '../composables/useForm';

const router       = useRouter();
const recipesStore = useRecipesStore();
const apiError     = ref(null);

const form = useForm(
    {
        title: '',
        description: '',
        category: '',
        difficulty: '',
        image: null,
        prep_time: '',   // snake_case to match the API
        cook_time: '',
        steps: [''],
        ingredients: [{ name: '', amount: '' }],
    },
    {
        title:       v => (v && v.trim().length >= 3)  || 'Title must be at least 3 characters.',
        description: v => (v && v.trim().length >= 20) || 'Description must be at least 20 characters.',
        category:    v => (v && v.trim() !== '')        || 'Please select a category.',
        difficulty:  v => (v && v.trim() !== '')        || 'Please select a difficulty.',
        prep_time:   v => (v !== '' && v >= 0)          || 'Prep time is required.',
        cook_time:   v => (v !== '' && v >= 0)          || 'Cook time is required.',
        steps: {
            each: (step, index) => (step && step.trim() !== '') || `Step ${index + 1} cannot be empty.`,
        },
        ingredients: {
            each: (ing, index) => {
                if (!ing.name || ing.name.trim() === '') return `Ingredient ${index + 1}: name is required.`;
                if (!ing.amount || ing.amount.toString().trim() === '') return `Ingredient ${index + 1}: amount is required.`;
                return true;
            },
        },
    }
);

const categories = recipesStore.categories;
const levels     = recipesStore.levels;

function addRecipeStep()              { form.values.value.steps.push(''); }
function removeRecipeStep(index)      { form.values.value.steps.splice(index, 1); form.touch('steps'); }
function addRecipeIngredient()        { form.values.value.ingredients.push({ name: '', amount: '' }); }
function removeRecipeIngredient(i)    { form.values.value.ingredients.splice(i, 1); form.touch('ingredients'); }

const fileInput    = ref(null);
const imagePreview = ref(null);

function triggerFileInput() { fileInput.value.click(); }

function onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    form.values.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
}

function removeImage() {
    form.values.value.image = null;
    imagePreview.value = null;
    fileInput.value.value = '';
}

async function submit() {
    if (!form.validate()) return;
    apiError.value = null;
    try {
        const newRecipe = await recipesStore.createRecipe({
            ...form.values.value,
            prep_time: Number(form.values.value.prep_time),
            cook_time: Number(form.values.value.cook_time),
            image: form.values.value.image ?? null,
        });
        router.push({ name: 'recipe-detail', params: { id: newRecipe.id } });
    } catch (err) {
        apiError.value = err.message;
    }
}
</script>

<style scoped>
.err-msg  { color: #f4a96a; }
.api-error { color: #f4a96a; }
.optional { font-size: 0.8rem; opacity: 0.6; font-weight: normal; }
.hidden-input { display: none; }
.image-upload {
    position: relative;
    border: 2px dashed #b78c5a;
    border-radius: 16px;
    cursor: pointer;
    overflow: hidden;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff5e640;
    transition: border-color 0.2s;
}
.image-upload:hover { border-color: #c9a03d; }
.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    color: #a08060;
    font-size: 0.95rem;
}
.upload-icon { font-size: 2.5rem; }
.upload-hint { font-size: 0.78rem; opacity: 0.7; }
.image-preview { width: 100%; max-height: 280px; object-fit: cover; display: block; }
.remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #a14545cc;
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
