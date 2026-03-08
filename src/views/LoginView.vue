<template>
  <div class="login-page">
    <div class="card">
      <h1>Login in</h1>
      <p class="subtitle">For now use <code>ada@example.com</code> or <code>grace@example.com</code> with password <code>password</code></p>
      <p>Backend in construction</p>

      <form @submit.prevent="submit" novalidate>

        <div class="field">
          <label>Email</label>
          <input
            v-model="form.values.value.email"
            type="email"
            placeholder="you@example.com"
            @blur="form.touch('email')"
            :class="{ error: form.errors.value.email && form.touched.value.email }"
          />
          <span class="err-msg" v-if="form.errors.value.email && form.touched.value.email">
            {{ form.errors.value.email }}
          </span>
        </div>

        <div class="field">
          <label>Password</label>
          <input
            v-model="form.values.value.password"
            type="password"
            placeholder="••••••••"
            @blur="form.touch('password')"
            :class="{ error: form.errors.value.password && form.touched.value.password }"
          />
          <span class="err-msg" v-if="form.errors.value.password && form.touched.value.password">
            {{ form.errors.value.password }}
          </span>
        </div>

        <!-- Auth store error (wrong credentials) -->
        <div class="api-error" v-if="auth.error">{{ auth.error }}</div>

        <button type="submit" class="submit-btn" :disabled="auth.loading">
          {{ auth.loading ? 'Logging in…' : 'Login in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/useForm';

const router = useRouter();
const route  = useRoute();
const auth   = useAuthStore();
const form   = useForm(
    { email: '', password: '' },
    {
        email:    v => /\S+@\S+\.\S+/.test(v) || 'Enter a valid email.',
        password: v => (v && v.length >= 6)   || 'Password must be at least 6 characters.',
    }
);

async function submit() {
    if (!form.validate) return;
    const ok = await auth.login(form.values.value.email, form.values.value.password);
    if (ok) {
        const redirect = route.query.redirect || '/';
        router.push(redirect);
    }
}
</script>
