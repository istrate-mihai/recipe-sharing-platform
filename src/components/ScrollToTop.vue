<template>
    <Transition name="scroll-btn">
        <button
            v-if="visible"
            class="scroll-top-btn"
            @click="scrollToTop"
            aria-label="Scroll to top"
        >
            ↑
        </button>
    </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);

function onScroll() {
    visible.value = window.scrollY > 300;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<style scoped>
.scroll-top-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 900;

    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #b78c5a;
    background: #2b1b0e;
    color: #c9a03d;
    font-size: 1.3rem;
    line-height: 1;
    cursor: pointer;

    box-shadow: 0 4px 0 #0d0704, 0 6px 24px #00000060;
    transition: transform 0.15s, background 0.15s;
}

.scroll-top-btn:hover {
    background: #3f2e1b;
    transform: translateY(-3px);
}

.scroll-top-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 0 #0d0704;
}

/* Transition */
.scroll-btn-enter-active,
.scroll-btn-leave-active { transition: opacity 0.25s, transform 0.25s; }
.scroll-btn-enter-from,
.scroll-btn-leave-to    { opacity: 0; transform: translateY(12px); }
</style>
