<template>
    <BookPage
        title="Contact Us"
        tagline="We'd love to hear from you."
        left-chapter="Get in Touch"
        right-chapter="Recipe Sharing Platform"
    >
        <div class="book-prose">
            <section>
                <h2>General enquiries</h2>
                <p>Have a question about the platform, a suggestion for a new feature, or just want to say hello? Drop us an email and we'll get back to you as soon as we can.</p>
                <p>📧 <a href="mailto:contact@recipe-sharing-platform.com">contact@recipe-sharing-platform.com</a></p>
            </section>

            <section>
                <h2>Report a problem</h2>
                <p>Found a bug or something not working as expected? Please describe what happened and we'll look into it promptly.</p>
                <p>📧 <a href="mailto:support@recipe-sharing-platform.com">support@recipe-sharing-platform.com</a></p>
            </section>

            <section>
                <h2>Content concerns</h2>
                <p>Spotted a recipe that violates our community guidelines or contains inappropriate content? We take content quality seriously and will review all reports.</p>
                <p>📧 <a href="mailto:contact@recipe-sharing-platform.com">contact@recipe-sharing-platform.com</a></p>
            </section>

            <section>
                <h2>Response times</h2>
                <p>We aim to respond to all enquiries within 2–3 business days. Thank you for your patience.</p>
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
.book-prose a  { color: #b86b3f; font-weight: 600; }
.book-prose a:hover { color: #4d7a4d; }
</style>
