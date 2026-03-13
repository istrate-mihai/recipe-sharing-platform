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
    <ScrollToTop />
  </div>
</template>
