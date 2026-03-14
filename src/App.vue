<script setup>
import AppNav from './components/AppNav.vue';
import ScrollToTop from './components/ScrollToTop.vue';
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
