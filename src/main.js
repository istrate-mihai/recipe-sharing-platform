import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@unhead/vue/legacy';
import router from './router';
import App from './App.vue';
import './assets/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(createHead());
app.mount('#app');
