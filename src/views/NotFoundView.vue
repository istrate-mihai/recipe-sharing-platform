<template>
  <div class="not-found">
    <span class="code">404</span>
    <h1>Page not found.</h1>
    <RouterLink to="/">← Back to feed</RouterLink>
  </div>
</template>

<style scoped>
.not-found { text-align: center; padding: 6rem 0; }
.code { font-family: 'Playfair Display', serif; font-size: 6rem; color: var(--border); display: block; line-height: 1; }
h1    { font-size: 1.2rem; color: var(--muted); margin: 1rem 0 2rem; }
a     { color: var(--accent); }
</style>
