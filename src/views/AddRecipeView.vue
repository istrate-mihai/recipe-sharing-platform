<template>
    <div class="add-recipe-wrap">

        <div v-if="apiError" class="api-error">{{ apiError }}</div>

        <!-- ══ Open Book Form ══ -->
        <form @submit.prevent="submit" novalidate>
            <div class="recipe-book">
                <div class="book-cover book-cover--left"></div>

                <div class="book-spread">

                    <!-- ════ LEFT PAGE: basics ════ -->
                    <div class="book-page book-page--left">
                        <div class="page-header">
                            <span class="page-chapter">New Recipe</span>
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
                            <label class="field-label">Image <span class="optional">(optional)</span></label>
                            <div class="image-upload" @click="triggerFileInput" :class="{ 'has-preview': imagePreview }">
                                <img v-if="imagePreview" :src="imagePreview" class="image-preview" alt="Preview" />
                                <div v-else class="upload-placeholder">
                                    <span class="upload-icon">🖼</span>
                                    <span>Click to upload</span>
                                    <span class="upload-hint">JPG, PNG or WebP · max 4MB</span>
                                </div>
                                <button v-if="imagePreview" type="button" class="remove-image" @click.stop="removeImage">✖</button>
                            </div>
                            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="onFileChange" />
                        </div>

                        <!-- Visibility -->
                        <div class="field">
                            <label class="field-label">Visibility</label>
                            <select
                                v-model="form.values.value.status"
                                class="field-input"
                                @change="onStatusChange(form.values.value.status)"
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="private" :disabled="!isPremium">
                                    Private{{ !isPremium ? ' ★ Premium' : '' }}
                                </option>
                            </select>
                            <small v-if="!isPremium" class="hint">
                                Private recipes are a Premium feature.
                            </small>
                        </div>

                        <!-- Category + Difficulty (side by side) -->
                        <div class="field-row">
                            <div class="field">
                                <label class="field-label">Category</label>
                                <select
                                    v-model="form.values.value.category"
                                    class="field-input"
                                    @blur="form.touch('category')"
                                    :class="{ 'field-input--error': form.errors.value.category && form.touched.value.category }"
                                >
                                    <option value="">Select…</option>
                                    <option v-for="(cat, i) in categories" :key="i" :value="cat">{{ cat }}</option>
                                </select>
                                <span class="err-msg" v-if="form.errors.value.category && form.touched.value.category">
                                    {{ form.errors.value.category }}
                                </span>
                            </div>
                            <div class="field">
                                <label class="field-label">Difficulty</label>
                                <select
                                    v-model="form.values.value.difficulty"
                                    class="field-input"
                                    @blur="form.touch('difficulty')"
                                    :class="{ 'field-input--error': form.errors.value.difficulty && form.touched.value.difficulty }"
                                >
                                    <option value="">Select…</option>
                                    <option v-for="(lvl, i) in levels" :key="i" :value="lvl">{{ lvl }}</option>
                                </select>
                                <span class="err-msg" v-if="form.errors.value.difficulty && form.touched.value.difficulty">
                                    {{ form.errors.value.difficulty }}
                                </span>
                            </div>
                        </div>

                        <!-- Prep + Cook time (side by side) -->
                        <div class="field-row">
                            <div class="field">
                                <label class="field-label">Prep time <span class="optional">(min)</span></label>
                                <input
                                    v-model="form.values.value.prep_time"
                                    type="number" min="0"
                                    class="field-input"
                                    placeholder="e.g. 15"
                                    @blur="form.touch('prep_time')"
                                    :class="{ 'field-input--error': form.errors.value.prep_time && form.touched.value.prep_time }"
                                />
                                <span class="err-msg" v-if="form.errors.value.prep_time && form.touched.value.prep_time">
                                    {{ form.errors.value.prep_time }}
                                </span>
                            </div>
                            <div class="field">
                                <label class="field-label">Cook time <span class="optional">(min)</span></label>
                                <input
                                    v-model="form.values.value.cook_time"
                                    type="number" min="0"
                                    class="field-input"
                                    placeholder="e.g. 30"
                                    @blur="form.touch('cook_time')"
                                    :class="{ 'field-input--error': form.errors.value.cook_time && form.touched.value.cook_time }"
                                />
                                <span class="err-msg" v-if="form.errors.value.cook_time && form.touched.value.cook_time">
                                    {{ form.errors.value.cook_time }}
                                </span>
                            </div>
                        </div>

                        <!-- Servings -->
                        <div class="field">
                            <label class="field-label">Servings <span class="optional">(optional)</span></label>
                            <input
                                v-model="form.values.value.servings"
                                type="number"
                                min="1"
                                max="100"
                                class="field-input"
                                placeholder="e.g. 4"
                            />
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
                                type="number"
                                v-model="ing.quantity"
                                class="field-input list-input list-input--qty"
                                placeholder="Qty"
                                min="0"
                                step="0.1"
                                @blur="form.touch('ingredients')"
                            />
                            <input
                                type="text"
                                v-model="ing.unit"
                                class="field-input list-input list-input--unit"
                                placeholder="Unit"
                                @blur="form.touch('ingredients')"
                            />
                            <input
                                type="text"
                                v-model="ing.name"
                                class="field-input list-input"
                                placeholder="Ingredient"
                                @blur="form.touch('ingredients')"
                            />
                            <button
                                type="button"
                                class="list-remove"
                                @click="removeRecipeIngredient(index)"
                                v-if="form.values.value.ingredients.length > 1"
                            >✖</button>
                        </div>

                            <button type="button" class="list-add" @click="addRecipeIngredient">+ Add ingredient</button>
                            <span class="err-msg" v-if="form.errors.value.ingredients && form.touched.value.ingredients">
                                {{ form.errors.value.ingredients }}
                            </span>
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
                                    @blur="form.touch('steps')"
                                />
                                <button
                                    type="button"
                                    class="list-remove"
                                    @click="removeRecipeStep(index)"
                                    v-if="form.values.value.steps.length > 1"
                                >✖</button>
                            </div>
                            <button type="button" class="list-add" @click="addRecipeStep">+ Add step</button>
                            <span class="err-msg" v-if="form.errors.value.steps && form.touched.value.steps">
                                {{ form.errors.value.steps }}
                            </span>
                        </div>

                        <!-- Spacer + action buttons pinned to bottom -->
                        <div class="page-spacer"></div>
                        <div class="page-actions">
                            <button type="button" class="action-btn action-btn--cancel" @click="router.back()">Cancel</button>
                            <button type="submit" class="action-btn action-btn--submit" :disabled="recipesStore.isLoading">
                                {{ recipesStore.isLoading ? 'Sharing…' : '✓ Share Recipe' }}
                            </button>
                        </div>
                        <div class="page-footer-rule"></div>
                    </div>
                </div>

                <div class="book-cover book-cover--right"></div>
            </div>
        </form>

        <PricingModal v-model="showPricing" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipesStore } from '../stores/recipes';
import { useForm } from '../composables/useForm';
import { usePlan } from '../composables/usePlan';
import { useAuthStore } from '../stores/auth';
import PricingModal from '../components/PricingModal.vue';

const router       = useRouter();
const recipesStore = useRecipesStore();
const apiError     = ref(null);
const auth         = useAuthStore();

// ── Paywall ───────────────────────────────────────────────────────────────────
const { atFreeLimit, isPremium } = usePlan();
const showPricing                = ref(false);

const form = useForm(
    {
        title: '',
        description: '',
        category: '',
        difficulty: '',
        image: null,
        prep_time: '',
        cook_time: '',
        steps: [''],
        servings: 4,
        ingredients: [{ quantity: '', unit: '', name: '' }],
        status: 'published',
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
                return true;
            },
        },
    }
);

const categories = recipesStore.categories;
const levels     = recipesStore.levels;

function addRecipeStep()           { form.values.value.steps.push(''); }
function removeRecipeStep(i)       { form.values.value.steps.splice(i, 1); form.touch('steps'); }
function addRecipeIngredient()     { form.values.value.ingredients.push({ quantity: '', unit: '', name: '' }); }
function removeRecipeIngredient(i) { form.values.value.ingredients.splice(i, 1); form.touch('ingredients'); }
function onStatusChange(value) {
    if (value === 'private' && !isPremium.value) {
        form.values.value.status = 'published'
        showPricing.value = true
    }
}

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
    // ── Free tier limit check ─────────────────────────────────────────────────
    if (atFreeLimit.value) {
        showPricing.value = true;
        return;
    }

    if (!form.validate()) return;
    apiError.value = null;
    try {
        const newRecipe = await recipesStore.createRecipe({
            ...form.values.value,
            prep_time: Number(form.values.value.prep_time),
            cook_time: Number(form.values.value.cook_time),
            servings:  Number(form.values.value.servings) || 4,  
            image: form.values.value.image ?? null,
        });
        auth.incrementRecipeCount();
        router.push({ name: 'recipe-detail', params: { id: newRecipe.id } });
    } catch (err) {
        apiError.value = err.message;
    }
}
</script>

<style scoped>
.add-recipe-wrap { padding-bottom: 3rem; }
.api-error { color: #f4a96a; margin-bottom: 1rem; text-align: center; }
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
.list-input--qty  { flex: 0 0 60px; }
.list-input--unit { flex: 0 0 70px; }
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

.err-msg { color: #f4a96a; font-size: .72rem; }

/* ══ Image upload ══ */
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
    .page-actions       { margin-top: .5rem; }
    .action-btn         { padding: .65rem .5rem; font-size: .95rem; }
}

.hint { color: #a08060; font-size: .72rem; }
</style>
