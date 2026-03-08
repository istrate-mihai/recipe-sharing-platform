<template>
    <div class="write-page">
        <h1>New Recipe</h1>

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
                <label>Category</label>

                <select
                    v-model="form.values.value.category"
                    @blur="form.touch('category')"
                    :class="{ error: form.errors.value.category && form.touched.value.category }"
                >
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
                    <option v-for="(difficulty, i) in levels" :key="i" :value="difficulty">
                        {{ difficulty }}
                    </option>
                </select>

                <span class="err-msg" v-if="form.errors.value.difficulty && form.touched.value.difficulty">
                    {{ form.errors.value.difficulty }}
                </span>
            </div>

            <div class="field">
                <label>Prep time</label>

                <input
                    v-model="form.values.value.prepTime"
                    type="text"
                    placeholder="Your recipe prep time"
                    @blur="form.touch('prepTime')"
                    :class="{ error: form.errors.value.prepTime && form.touched.value.prepTime }"
                />

                <span class="err-msg" v-if="form.errors.value.prepTime && form.touched.value.prepTime">
                    {{ form.errors.value.prepTime }}
                </span>
            </div>

            <div class="field">
                <label>Cook time</label>

                <input
                    v-model="form.values.value.cookTime"
                    type="text"
                    placeholder="Your recipe cook time"
                    @blur="form.touch('cookTime')"
                    :class="{ error: form.errors.value.cookTime && form.touched.value.cookTime }"
                />

                <span class="err-msg" v-if="form.errors.value.cookTime && form.touched.value.cookTime">
                    {{ form.errors.value.cookTime }}
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
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/useForm';

const router       = useRouter();
const recipesStore = useRecipesStore();
const auth         = useAuthStore();
const ingredients  = ref([{}]);
const steps        = ref(['']);

const form = useForm(
  {
    title: '',
    description: '',
    category: '',
    difficulty: '',
    prepTime: '',
    cookTime: '',
    steps: [''],           // at least one empty step
    ingredients: [{ name: '', amount: '' }]   // one empty ingredient
  },
  {
    title: v => (v && v.trim().length >= 3) || 'Title must be at least 3 characters.',
    description: v => (v && v.trim().length >= 20) || 'Description must be at least 20 characters.',
    category: v => (v && v.trim() !== '') || 'Please select a category.',
    difficulty: v => (v && v.trim() !== '') || 'Please select a difficulty.',
    prepTime: v => (v && v.trim() !== '') || 'Prep time is required.',
    cookTime: v => (v && v.trim() !== '') || 'Cook time is required.',
    steps: {
      each: (step, index) => (step && step.trim() !== '') || `Step ${index + 1} cannot be empty.`
    },
    ingredients: {
      each: (ing, index) => {
        if (!ing.name || ing.name.trim() === '') {
          return `Ingredient ${index + 1}: name is required.`
        }
        if (!ing.amount || ing.amount.toString().trim() === '') {
          return `Ingredient ${index + 1}: amount is required.`
        }
        const amountNum = parseFloat(ing.amount)
        if (isNaN(amountNum) || amountNum <= 0) {
          return `Ingredient ${index + 1}: amount must be a positive number.`
        }
        return true
      }
    }
  }
);

const categories = recipesStore.categories;
const levels     = recipesStore.levels;

function addRecipeStep() {
    form.values.value.steps.push('');
}

function removeRecipeStep(index) {
    form.values.value.steps.splice(index, 1);
    form.touch('steps');
}

function addRecipeIngredient() {
    form.values.value.ingredients.push({ name: '', amount: '' });
}

function removeRecipeIngredient(index) {
    form.values.value.ingredients.splice(index, 1);
    form.touch('ingredients');
}

async function submit() {
    if (!form.validate()) return;

    const recipeData = {
        ...form.values.value,
    };
    console.log(recipeData);
    const newRecipe = await recipesStore.createRecipe(recipeData, auth.user);

    router.push({ name: 'recipe-detail', params: { id: newRecipe.id } });
}
</script>
