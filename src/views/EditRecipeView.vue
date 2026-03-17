<template>
    <div class="add-recipe-wrap">

        <div v-if="isLoading" class="loading">Loading…</div>
        <div v-else-if="!recipe" class="empty">Recipe not found.</div>

        <template v-else>
            <div v-if="apiError" class="api-error">{{ apiError }}</div>

            <!-- ══ Open Book Form ══ -->
            <form @submit.prevent="submit" novalidate>
                <div class="recipe-book">
                    <div class="book-cover book-cover--left"></div>

                    <div class="book-spread">

                        <!-- ════ LEFT PAGE: basics ════ -->
                        <div class="book-page book-page--left">
                            <div class="page-header">
                                <span class="page-chapter">Edit Recipe</span>
                                <span class="page-num">p. 1</span>
                            </div>

                            <!-- Title -->
                            <div class="field">
                                <label class="field-label">Title</label>
                                <input
                                    v-model="form.values.value.title"
                                    type="text"
                                    class="field-input"
                                    placeholder="Your recipe title"
                                    @blur="form.touch('title')"
                                    :class="{ 'field-input--error': form.errors.value.title && form.touched.value.title }"
                                />
                                <span class="err-msg" v-if="form.errors.value.title && form.touched.value.title">
                                    {{ form.errors.value.title }}
                                </span>
                            </div>

                            <!-- Description -->
                            <div class="field field--grow">
                                <label class="field-label">Description</label>
                                <textarea
                                    v-model="form.values.value.description"
                                    class="field-input field-textarea"
                                    placeholder="Write something worth eating…"
                                    @blur="form.touch('description')"
                                    :class="{ 'field-input--error': form.errors.value.description && form.touched.value.description }"
                                ></textarea>
                                <span class="err-msg" v-if="form.errors.value.description && form.touched.value.description">
                                    {{ form.errors.value.description }}
                                </span>
                            </div>

                            <!-- Image upload -->
                            <div class="field">
                                <label class="field-label">Image <span class="optional">(optional — leave empty to keep current)</span></label>

                                <!-- Current image -->
                                <div v-if="currentImageUrl && !imagePreview" class="current-image-wrap">
                                    <img :src="currentImageUrl" alt="Current image" class="image-preview current-image" />
                                    <button type="button" class="remove-image" @click="clearCurrentImage">✖</button>
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
                                        <span>Click to upload</span>
                                        <span class="upload-hint">JPG, PNG or WebP · max 4MB</span>
                                    </div>
                                </div>

                                <!-- Replace button when current image exists -->
                                <button v-if="currentImageUrl && !imagePreview" type="button" class="list-add replace-btn" @click="triggerFileInput">
                                    Replace image
                                </button>

                                <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="onFileChange" />
                            </div>

                            <!-- Category + Difficulty (side by side) -->
                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Category</label>
                                    <select v-model="form.values.value.category" class="field-input" @blur="form.touch('category')">
                                        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <label class="field-label">Difficulty</label>
                                    <select v-model="form.values.value.difficulty" class="field-input" @blur="form.touch('difficulty')">
                                        <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Prep + Cook time (side by side) -->
                            <div class="field-row">
                                <div class="field">
                                    <label class="field-label">Prep time <span class="optional">(min)</span></label>
                                    <input v-model="form.values.value.prep_time" type="number" min="0" class="field-input" placeholder="e.g. 15" />
                                </div>
                                <div class="field">
                                    <label class="field-label">Cook time <span class="optional">(min)</span></label>
                                    <input v-model="form.values.value.cook_time" type="number" min="0" class="field-input" placeholder="e.g. 30" />
                                </div>
                            </div>
                        </div>

                        <!-- ── Spine ── -->
                        <div class="book-spine">
                            <div class="spine-line"></div>
                            <div class="spine-line"></div>
                            <div class="spine-line"></div>
                        </div>

                        <!-- ════ RIGHT PAGE: ingredients + steps ════ -->
                        <div class="book-page book-page--right">
                            <div class="page-header page-header--right">
                                <span class="page-num">p. 2</span>
                                <span class="page-chapter">Ingredients & Steps</span>
                            </div>

                            <!-- Ingredients -->
                            <div class="field field--section">
                                <label class="field-label field-label--section">Ingredients</label>
                                <div
                                    v-for="(ing, index) in form.values.value.ingredients"
                                    :key="index"
                                    class="list-row"
                                >
                                    <span class="list-num">{{ index + 1 }}</span>
                                    <input
                                        type="text"
                                        v-model="ing.name"
                                        class="field-input list-input"
                                        placeholder="Name"
                                    />
                                    <input
                                        type="text"
                                        v-model="ing.amount"
                                        class="field-input list-input list-input--amount"
                                        placeholder="Amount"
                                    />
                                    <button
                                        type="button"
                                        class="list-remove"
                                        @click="removeIngredient(index)"
                                        v-if="form.values.value.ingredients.length > 1"
                                    >✖</button>
                                </div>
                                <button type="button" class="list-add" @click="addIngredient">+ Add ingredient</button>
                            </div>

                            <!-- Steps -->
                            <div class="field field--section field--grow">
                                <label class="field-label field-label--section">Steps</label>
                                <div
                                    v-for="(step, index) in form.values.value.steps"
                                    :key="index"
                                    class="list-row"
                                >
                                    <span class="list-num list-num--gold">{{ index + 1 }}</span>
                                    <input
                                        type="text"
                                        v-model="form.values.value.steps[index]"
                                        class="field-input list-input"
                                        placeholder="Describe this step…"
                                    />
                                    <button
                                        type="button"
                                        class="list-remove"
                                        @click="removeStep(index)"
                                        v-if="form.values.value.steps.length > 1"
                                    >✖</button>
                                </div>
                                <button type="button" class="list-add" @click="addStep">+ Add step</button>
                            </div>

                            <!-- Spacer + action buttons pinned to bottom -->
                            <div class="page-spacer"></div>
                            <div class="page-actions">
                                <button type="button" class="action-btn action-btn--cancel" @click="router.back()">Cancel</button>
                                <button type="submit" class="action-btn action-btn--submit" :disabled="recipesStore.isLoading">
                                    {{ recipesStore.isLoading ? 'Saving…' : '✓ Save Changes' }}
                                </button>
                            </div>
                            <div class="page-footer-rule"></div>
                        </div>
                    </div>

                    <div class="book-cover book-cover--right"></div>
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

const recipe              = ref(null);
const isLoading           = ref(true);
const apiError            = ref(null);
const fileInput           = ref(null);
const imagePreview        = ref(null);
const currentImageUrl     = ref(null);
const removeCurrentImage  = ref(false);

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
            title:       recipe.value.title,
            description: recipe.value.description,
            category:    recipe.value.category,
            difficulty:  recipe.value.difficulty,
            prep_time:   recipe.value.prep_time,
            cook_time:   recipe.value.cook_time,
            steps:       [...recipe.value.steps],
            ingredients: recipe.value.ingredients.map(i => ({ ...i })),
            image:       null,
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
    currentImageUrl.value = null;
}

function removeImage() {
    form.values.value.image = null;
    imagePreview.value = null;
    fileInput.value.value = '';
    currentImageUrl.value = recipe.value?.image_url ?? null;
}

function clearCurrentImage() {
    currentImageUrl.value = null;
    removeCurrentImage.value = true;
}

function addStep()           { form.values.value.steps.push(''); }
function removeStep(i)       { form.values.value.steps.splice(i, 1); }
function addIngredient()     { form.values.value.ingredients.push({ name: '', amount: '' }); }
function removeIngredient(i) { form.values.value.ingredients.splice(i, 1); }

async function submit() {
    if (!form.validate()) return;
    apiError.value = null;
    try {
        const payload = {
            ...form.values.value,
            prep_time: Number(form.values.value.prep_time),
            cook_time: Number(form.values.value.cook_time),
        };
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
.add-recipe-wrap { padding-bottom: 3rem; }
.api-error { color: #f4a96a; margin-bottom: 1rem; text-align: center; }
.loading, .empty { color: #a08060; text-align: center; padding: 2rem; font-family: 'Playfair Display', serif; }
.hidden-input { display: none; }
.optional { font-size: .75rem; opacity: .6; font-weight: normal; }

/* ══ Book shell ══ */
.recipe-book {
    display: flex;
    align-items: stretch;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    max-width: 1200px;
    margin: 0 auto;
}

.book-cover {
    width: 24px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.book-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 10px rgba(0,0,0,.5); }
.book-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset 4px 0 10px rgba(0,0,0,.5); }

.book-spread { display: flex; flex: 1; }

/* ══ Pages ══ */
.book-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: .9rem;
    position: relative;
    min-height: 680px;
}
.book-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(transparent, transparent 32px, #d4a85410 33px);
}
.book-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.07); contain: layout style paint; }
.book-page--right { box-shadow: inset 8px 0 20px rgba(0,0,0,.07); contain: layout style paint; }

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

/* ══ Fields ══ */
.field {
    display: flex;
    flex-direction: column;
    gap: .3rem;
    position: relative;
    z-index: 1;
}
.field--grow { flex: 1; }
.field--section { gap: .45rem; }

.field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .7rem;
    position: relative;
    z-index: 1;
}

.field-label {
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    color: #8b5a28;
    text-transform: uppercase;
    letter-spacing: .08em;
    font-weight: 700;
}
.field-label--section {
    border-bottom: 1px solid #c9a03d44;
    padding-bottom: .3rem;
    margin-bottom: .1rem;
}

.field-input {
    background: #fffdf4;
    border: 1px solid #c9a03d55;
    border-radius: 6px;
    padding: .5rem .75rem;
    font-family: 'Playfair Display', serif;
    font-size: .85rem;
    color: #2c1e0e;
    width: 100%;
    box-sizing: border-box;
    transition: border-color .15s, box-shadow .15s;
    outline: none;
}
.field-input:focus {
    border-color: #c9a03d;
    box-shadow: 0 0 0 3px #c9a03d22;
}
.field-input--error { border-color: #c0503088; }
.field-textarea {
    resize: vertical;
    min-height: 80px;
    flex: 1;
    line-height: 1.55;
}

/* ══ Ingredient / Step rows ══ */
.list-row {
    display: flex;
    align-items: center;
    gap: .4rem;
}
.list-num {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: #4d7a4d;
    color: #fbe9c3;
    font-size: .65rem;
    font-weight: 700;
    font-family: 'Playfair Display', serif;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 0 #2b4a2b;
}
.list-num--gold {
    background: radial-gradient(circle at 35% 30%, #e8c060, #c9a03d 50%, #a07828);
    color: #2c1e0e;
    box-shadow: 0 2px 0 #7a5a00, inset 0 1px 1px rgba(255,255,255,.3);
}
.list-input { flex: 1; min-width: 0; }
.list-input--amount { flex: 0 0 90px; }
.list-remove {
    flex-shrink: 0;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    border: 1px solid #c05030aa;
    background: transparent;
    color: #c05030;
    font-size: .6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .12s;
    padding: 0;
}
.list-remove:hover { background: #c0503022; }

.list-add {
    align-self: flex-start;
    background: transparent;
    border: 1px dashed #b78c5a88;
    border-radius: 20px;
    color: #a08060;
    font-size: .72rem;
    font-family: 'Playfair Display', serif;
    padding: .28rem .85rem;
    cursor: pointer;
    margin-top: .15rem;
    transition: border-color .15s, color .15s;
}
.list-add:hover { border-color: #c9a03d; color: #c9a03d; }
.replace-btn { margin-top: .4rem; }

.err-msg { color: #f4a96a; font-size: .72rem; }

/* ══ Image upload ══ */
.current-image-wrap {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
}
.image-upload {
    position: relative;
    border: 2px dashed #b78c5a88;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fef7e9;
    transition: border-color .2s;
}
.image-upload:hover { border-color: #c9a03d; }
.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .25rem;
    color: #a08060;
    font-size: .82rem;
    padding: 1rem;
}
.upload-icon  { font-size: 1.8rem; }
.upload-hint  { font-size: .68rem; opacity: .7; }
.image-preview { width: 100%; max-height: 160px; object-fit: cover; display: block; }
.current-image { max-height: 200px; border-radius: 8px; border: 1px solid #c9a03d44; }
.remove-image {
    position: absolute;
    top: .4rem; right: .4rem;
    background: #a14545cc;
    border: none; border-radius: 50%;
    width: 1.6rem; height: 1.6rem;
    color: white; font-size: .7rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
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

/* ══ Action buttons ══ */
.page-spacer { flex: 1; min-height: .5rem; }
.page-actions {
    display: flex;
    gap: .6rem;
    position: relative;
    z-index: 1;
    padding-top: .8rem;
    border-top: 1px solid #c9a03d44;
}
.page-footer-rule {
    height: 1px;
    background: #c9a03d44;
    margin-top: .5rem;
}

.action-btn {
    flex: 1;
    padding: .6rem .5rem;
    border-radius: 60px;
    border: none;
    font-family: 'Playfair Display', serif;
    font-size: .88rem;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    transition: transform .1s, box-shadow .1s;
    white-space: nowrap;
}
.action-btn--cancel {
    background: #3a2410;
    color: #c9a03d;
    border: 1px solid #c9a03d55;
    box-shadow: 0 3px 0 #1a0f06;
}
.action-btn--cancel:hover { background: #4a3020; }
.action-btn--submit {
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    box-shadow: 0 3px 0 #7a5a00, 0 5px 12px rgba(0,0,0,.25);
}
.action-btn--submit:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 4px 0 #7a5a00; }
.action-btn--submit:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
.action-btn--submit:disabled { opacity: .5; cursor: not-allowed; }

/* ══ Mobile: unwrap book ══ */
@media (max-width: 768px) {
    .recipe-book        { display: block; box-shadow: none; border-radius: 0; }
    .book-cover         { display: none; }
    .book-spine         { display: none; }
    .book-spread        { display: block; }
    .book-page {
        background: transparent;
        padding: 0;
        min-height: unset;
        gap: 1.2rem;
        box-shadow: none;
        contain: none;
    }
    .book-page::before  { display: none; }
    .book-page--right   { margin-top: 1.5rem; }
    .page-header        { display: none; }
    .page-footer-rule   { display: none; }
    .page-spacer        { display: none; }
    .field-input        { font-size: .95rem; padding: .6rem .85rem; }
    .field-textarea     { min-height: 120px; }
    .list-input--amount { flex: 0 0 100px; }
    .page-actions       { margin-top: .5rem; }
    .action-btn         { padding: .65rem .5rem; font-size: .95rem; }
}
</style>
