<template>
    <BookPage
        title="Welcome Back"
        :tagline="mode === 'login' ? 'Sign in to your kitchen.' : 'Join the community.'"
        left-chapter="Members"
        right-chapter="Recipe Sharing Platform"
        :back-to="null"
    >
        <div class="auth-wrap">
            <!-- Tab switcher -->
            <div class="auth-tabs">
                <button :class="{ active: mode === 'login' }"    @click="switchMode('login')">Login</button>
                <button :class="{ active: mode === 'register' }" @click="switchMode('register')">Register</button>
            </div>

            <!-- LOGIN -->
            <div v-if="mode === 'login'" class="auth-form">
                <h2 class="form-title">Sign in</h2>

                <div class="field">
                    <label>Email</label>
                    <input
                        v-model="loginForm.values.value.email"
                        type="email"
                        placeholder="you@example.com"
                        @blur="loginForm.touch('email')"
                        :class="{ 'field-error': loginForm.errors.value.email && loginForm.touched.value.email }"
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
                        :class="{ 'field-error': loginForm.errors.value.password && loginForm.touched.value.password }"
                    />
                    <span class="err-msg" v-if="loginForm.errors.value.password && loginForm.touched.value.password">
                        {{ loginForm.errors.value.password }}
                    </span>
                </div>

                <div class="api-error" v-if="auth.error">{{ auth.error }}</div>

                <button class="submit-btn" :disabled="auth.loading" @click="submitLogin">
                    {{ auth.loading ? 'Signing in…' : 'Sign in' }}
                </button>

                <p class="auth-switch">
                    No account yet?
                    <button class="link-btn" @click="switchMode('register')">Create one →</button>
                </p>
            </div>

            <!-- REGISTER -->
            <div v-else class="auth-form">
                <h2 class="form-title">Create account</h2>

                <div class="field">
                    <label>Name</label>
                    <input
                        v-model="registerForm.values.value.name"
                        type="text"
                        placeholder="Your name"
                        @blur="registerForm.touch('name')"
                        :class="{ 'field-error': registerForm.errors.value.name && registerForm.touched.value.name }"
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
                        :class="{ 'field-error': registerForm.errors.value.email && registerForm.touched.value.email }"
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
                        :class="{ 'field-error': registerForm.errors.value.password && registerForm.touched.value.password }"
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
                        :class="{ 'field-error': registerForm.errors.value.password_confirmation && registerForm.touched.value.password_confirmation }"
                    />
                    <span class="err-msg" v-if="registerForm.errors.value.password_confirmation && registerForm.touched.value.password_confirmation">
                        {{ registerForm.errors.value.password_confirmation }}
                    </span>
                </div>

                <div class="api-error" v-if="auth.error">{{ auth.error }}</div>

                <button class="submit-btn" :disabled="auth.loading" @click="submitRegister">
                    {{ auth.loading ? 'Creating account…' : 'Create account' }}
                </button>

                <p class="auth-switch">
                    Already have an account?
                    <button class="link-btn" @click="switchMode('login')">Sign in →</button>
                </p>
            </div>
        </div>
    </BookPage>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useForm } from '../composables/useForm';
import BookPage from '../components/BookPage.vue';

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

function switchMode(m) {
    mode.value = m;
    auth.error = null;
}

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
/* ── Tab switcher ── */
.auth-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.auth-tabs {
    display: flex;
    border-bottom: 1px solid #c9a03d55;
    margin-bottom: 1.4rem;
    gap: 0;
}
.auth-tabs button {
    flex: 1;
    background: none;
    border: none;
    font-family: 'Playfair Display', serif;
    font-size: .9rem;
    font-weight: 700;
    color: #a08060;
    cursor: pointer;
    padding: .55rem .5rem .6rem;
    letter-spacing: .04em;
    border-bottom: 2px solid transparent;
    transition: color .15s, border-color .15s;
    margin-bottom: -1px;
}
.auth-tabs button.active {
    color: #4a2e10;
    border-bottom-color: #c9a03d;
}
.auth-tabs button:hover:not(.active) { color: #7a5030; }

/* ── Form ── */
.form-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: #4a2e10;
    margin-bottom: 1.2rem;
    font-weight: 700;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: .1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: .25rem;
    margin-bottom: .8rem;
}
.field label {
    font-family: 'Playfair Display', serif;
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: #7a5030;
}
.field input {
    background: #fdf0d0;
    border: 1.5px solid #c9a03d66;
    border-radius: 3px;
    padding: .55rem .8rem;
    font-size: .95rem;
    color: #2c1e0e;
    font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
    outline: none;
}
.field input:focus {
    border-color: #c9a03d;
    box-shadow: 0 0 0 3px #c9a03d22;
}
.field input.field-error {
    border-color: #c0392b;
    box-shadow: 0 0 0 3px #c0392b18;
}

.err-msg {
    font-size: .78rem;
    color: #c0392b;
    font-style: italic;
}

.api-error {
    background: #fdecea;
    border: 1px solid #c0392b44;
    border-radius: 3px;
    padding: .55rem .8rem;
    font-size: .88rem;
    color: #c0392b;
    margin-bottom: .6rem;
}

.submit-btn {
    background: linear-gradient(180deg, #c9a03d 0%, #a07828 100%);
    color: #2c1e0e;
    border: none;
    border-radius: 3px;
    padding: .7rem 1.5rem;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 0 #7a5a00, 0 6px 14px rgba(0,0,0,.2);
    transition: all .15s ease;
    width: 100%;
    margin-top: .4rem;
    letter-spacing: .04em;
}
.submit-btn:hover:not(:disabled) {
    background: linear-gradient(180deg, #dbb04e 0%, #b08830 100%);
    transform: translateY(2px);
    box-shadow: 0 2px 0 #7a5a00;
}
.submit-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: 0 1px 0 #7a5a00; }

.auth-switch {
    font-size: .85rem;
    color: #8b6b41;
    text-align: center;
    margin-top: .8rem;
}
.link-btn {
    background: none;
    border: none;
    color: #b86b3f;
    font-weight: 700;
    cursor: pointer;
    font-size: .85rem;
    padding: 0;
    font-family: inherit;
}
.link-btn:hover { color: #4d7a4d; }
</style>
