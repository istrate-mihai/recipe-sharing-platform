<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import AppNav from './components/AppNav.vue';
import ScrollToTop from './components/ScrollToTop.vue';

const route = useRoute();

const canonicalUrl = computed(() =>
    `https://recipe-sharing-platform.com${route.path}`
);

useHead({
    title: 'Recipe Sharing Platform — Recipes Worth Cooking',
    link: [
        { rel: 'canonical', href: canonicalUrl },
    ],
    meta: [
        { name: 'description', content: 'Discover and share delicious recipes from around the world. A community-driven platform for curious gourmets.' },
        { property: 'og:title', content: 'Recipe Sharing Platform' },
        { property: 'og:description', content: 'Discover and share delicious recipes from around the world.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
    ],
});
</script>

<template>
  <div>
    <AppNav />
    <div>
      <RouterView />
    </div>
    <footer class="site-footer">
      <span>© {{ new Date().getFullYear() }} Recipe Sharing Platform</span>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/privacy">Privacy Policy</RouterLink>
    </footer>
    <ScrollToTop />
  </div>
</template>
