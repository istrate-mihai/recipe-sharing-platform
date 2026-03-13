<template>
    <div class="login-page">
        <div class="card">
            <div class="tabs">
                <button :class="{ active: mode === 'login' }"    @click="mode = 'login'">Login</button>
                <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Register</button>
            </div>

            <!-- LOGIN -->
            <form v-if="mode === 'login'" @submit.prevent="submitLogin" novalidate>
                <h1>Login</h1>

                <div class="field">
                    <label>Email</label>
                    <input
                        v-model="loginForm.values.value.email"
                        type="email"
                        placeholder="you@example.com"
                        @blur="loginForm.touch('email')"
                        :class="{ error: loginForm.errors.value.email && loginForm.touched.value.email }"
                    />
                    <span class="err-msg" v-if="loginForm.errors.value.email && loginForm.touched.value.email">
                        {{ loginForm.errors.value.email }}
                    </span>
                </div>

                <div class="field">
                    <label>Password</label>
                    <input
                        v-model="loginForm.values.value.password"
                        type="password"
                        placeholder="••••••••"
                        @blur="loginForm.touch('password')"
                        :class="{ error: loginForm.errors.value.password && loginForm.touched.value.password }"
                    />
                    <span class="err-msg" v-if="loginForm.errors.value.password && loginForm.touched.value.password">
                        {{ loginForm.errors.value.password }}
                    </span>
                </div>

                <div class="api-error" v-if="auth.error">{{ auth.error }}</div>

                <button type="submit" class="submit-btn" :disabled="auth.loading">
                    {{ auth.loading ? 'Logging in…' : 'Login' }}
                </button>
            </form>

            <!-- REGISTER -->
            <form v-else @submit.prevent="submitRegister" novalidate>
                <h1>Create account</h1>

                <div class="field">
                    <label>Name</label>
                    <input
                        v-model="registerForm.values.value.name"
                        type="text"
                        placeholder="Your name"
                        @blur="registerForm.touch('name')"
                        :class="{ error: registerForm.errors.value.name && registerForm.touched.value.name }"
                    />
                    <span class="err-msg" v-if="registerForm.errors.value.name && registerForm.touched.value.name">
                        {{ registerForm.errors.value.name }}
                    </span>
                </div>

                <div class="field">
                    <label>Email</label>
                    <input
                        v-model="registerForm.values.value.email"
                        type="email"
                        placeholder="you@example.com"
                        @blur="registerForm.touch('email')"
                        :class="{ error: registerForm.errors.value.email && registerForm.touched.value.email }"
                    />
                    <span class="err-msg" v-if="registerForm.errors.value.email && registerForm.touched.value.email">
                        {{ registerForm.errors.value.email }}
                    </span>
                </div>

                <div class="field">
                    <label>Password</label>
                    <input
                        v-model="registerForm.values.value.password"
                        type="password"
                        placeholder="••••••••"
                        @blur="registerForm.touch('password')"
                        :class="{ error: registerForm.errors.value.password && registerForm.touched.value.password }"
                    />
                    <span class="err-msg" v-if="registerForm.errors.value.password && registerForm.touched.value.password">
                        {{ registerForm.errors.value.password }}
                    </span>
                </div>

                <div class="field">
                    <label>Confirm password</label>
                    <input
                        v-model="registerForm.values.value.password_confirmation"
                        type="password"
                        placeholder="••••••••"
                        @blur="registerForm.touch('password_confirmation')"
                        :class="{ error: registerForm.errors.value.password_confirmation && registerForm.touched.value.password_confirmation }"
                    />
                    <span class="err-msg" v-if="registerForm.errors.value.password_confirmation && registerForm.touched.value.password_confirmation">
                        {{ registerForm.errors.value.password_confirmation }}
                    </span>
                </div>

                <div class="api-error" v-if="auth.error">{{ auth.error }}</div>

                <button type="submit" class="submit-btn" :disabled="auth.loading">
                    {{ auth.loading ? 'Creating account…' : 'Create account' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/useForm';

const router = useRouter();
const route  = useRoute();
const auth   = useAuthStore();
const mode   = ref('login');

const loginForm = useForm(
    { email: '', password: '' },
    {
        email:    v => /\S+@\S+\.\S+/.test(v) || 'Enter a valid email.',
        password: v => (v && v.length >= 6)   || 'Password must be at least 6 characters.',
    }
);

const registerForm = useForm(
    { name: '', email: '', password: '', password_confirmation: '' },
    {
        name:     v => (v && v.trim().length >= 2) || 'Name must be at least 2 characters.',
        email:    v => /\S+@\S+\.\S+/.test(v)      || 'Enter a valid email.',
        password: v => (v && v.length >= 8)         || 'Password must be at least 8 characters.',
        password_confirmation: (v, all) =>
            (v && v === all.password) || 'Passwords do not match.',
    }
);

async function submitLogin() {
    if (!loginForm.validate()) return;
    const ok = await auth.login(loginForm.values.value.email, loginForm.values.value.password);
    if (ok) redirect();
}

async function submitRegister() {
    if (!registerForm.validate()) return;
    const { name, email, password, password_confirmation } = registerForm.values.value;
    const ok = await auth.register(name, email, password, password_confirmation);
    if (ok) redirect();
}

function redirect() {
    router.push(route.query.redirect || '/');
}
</script>

<style scoped>
.tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.tabs button { background: none; border: none; font-size: 1rem; cursor: pointer; color: #7a5c3a; opacity: 0.5; padding: 0 0 4px 0; }
.tabs button.active { opacity: 1; color: #4a2f0f; font-weight: 700; border-bottom: 2px solid #4a2f0f; }
</style>
