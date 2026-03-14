<script setup>
import { useHead } from '@unhead/vue';
import AppNav from './components/AppNav.vue';
import ScrollToTop from './components/ScrollToTop.vue';

useHead({
  title: 'Recipe Sharing Platform — Recipes Worth Cooking',
  meta: [
    { name: 'description', content: 'Discover and share delicious recipes from around the world. A community-driven platform for curious gourmets.' },
    { property: 'og:title', content: 'Recipe Sharing Platform' },
    { property: 'og:description', content: 'Discover and share delicious recipes from around the world.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://recipe-sharing-platform.com' },
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
