<template>
    <BookPage
        title="About Us"
        tagline="A home for recipes worth cooking."
        left-chapter="Our Story"
        right-chapter="Recipe Sharing Platform"
    >
        <div class="book-prose">
            <section>
                <h2>What is Recipe Sharing Platform?</h2>
                <p>Recipe Sharing Platform is a community-driven space where food lovers can discover, share, and save recipes from around the world. Whether you're a seasoned chef or a curious home cook, this is a place to explore flavours, techniques, and culinary traditions.</p>
                <p>We believe great recipes deserve to be shared. This platform gives everyone a simple, beautiful way to publish their cooking — from a quick weekday pasta to a slow-braised Sunday masterpiece.</p>
            </section>

            <section>
                <h2>What you can do here</h2>
                <ul>
                    <li>Browse community recipes across categories like breakfast, pasta, soup, salad, meat, dessert, and vegetarian.</li>
                    <li>Create a free account and share your own recipes with photos, ingredients, and step-by-step instructions.</li>
                    <li>Like and favourite recipes to build your personal collection.</li>
                    <li>Discover recipes shared by food enthusiasts from around the world.</li>
                </ul>
            </section>

            <section>
                <h2>Our story</h2>
                <p>Recipe Sharing Platform started as a passion project — a place to collect and share the kind of recipes that get passed around at dinner tables and family gatherings. Built with care by a developer who believes good food and good code have a lot in common: both reward patience, attention to detail, and a willingness to experiment.</p>
            </section>

            <section>
                <h2>The technology</h2>
                <p>Built with Vue.js, a Laravel REST API, and recipe images served globally via Cloudflare's CDN. Designed to be fast, reliable, and accessible on any device.</p>
            </section>

            <section>
                <h2>Get in touch</h2>
                <p>📧 <a href="mailto:about@recipe-sharing-platform.com">about@recipe-sharing-platform.com</a></p>
            </section>
        </div>
    </BookPage>
</template>

<script setup>
import BookPage from '../components/BookPage.vue';
</script>

<style scoped>
.book-prose { color: #2c1e0e; }
.book-prose section { margin-bottom: 1.8rem; }
.book-prose h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    color: #5a3e1b;
    margin-bottom: .5rem;
    padding-bottom: .3rem;
    border-bottom: 1px dashed #c9a03d55;
}
.book-prose p  { font-size: .97rem; line-height: 1.75; margin-bottom: .7rem; }
.book-prose ul { padding-left: 1.2rem; margin-bottom: .7rem; }
.book-prose ul li { font-size: .95rem; line-height: 1.65; margin-bottom: .4rem; }
.book-prose a  { color: #b86b3f; font-weight: 600; }
.book-prose a:hover { color: #4d7a4d; }
</style>
