<template>
    <BookPage
        title="Privacy Policy"
        tagline="Last updated: March 2026"
        left-chapter="Legal"
        right-chapter="Recipe Sharing Platform"
    >
        <div class="book-prose">

            <section>
                <h2>Who we are</h2>
                <p>Recipe Sharing Platform ("we", "us", "our") is a community-driven recipe sharing website accessible at <strong>recipe-sharing-platform.com</strong>. We help food enthusiasts discover, share, and save recipes.</p>
            </section>

            <section>
                <h2>Information we collect</h2>
                <p>We collect the following information when you use our platform:</p>
                <ul>
                    <li><strong>Account information</strong> — your name and email address when you register.</li>
                    <li><strong>Content you submit</strong> — recipes, images, descriptions, and ingredients you upload.</li>
                    <li><strong>Usage data</strong> — pages visited, recipes liked or favourited, and general interaction data.</li>
                    <li><strong>Technical data</strong> — IP address, browser type, and device information collected automatically.</li>
                </ul>
            </section>

            <section>
                <h2>How we use your information</h2>
                <p>We use collected information to:</p>
                <ul>
                    <li>Provide and operate the Recipe Sharing Platform service.</li>
                    <li>Allow you to create, edit, and share recipes with the community.</li>
                    <li>Display personalised content such as your favourites and liked recipes.</li>
                    <li>Improve and maintain the platform.</li>
                    <li>Display advertisements through Google AdSense to support the free service.</li>
                </ul>
            </section>

            <section>
                <h2>Google AdSense and cookies</h2>
                <p>We use Google AdSense to display advertisements on our platform. Google AdSense uses cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</p>
                <p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</p>
            </section>

            <section>
                <h2>Image storage</h2>
                <p>Recipe images you upload are stored securely on Cloudflare R2 object storage and served via our CDN at <strong>images.recipe-sharing-platform.com</strong>. Images you upload as part of a recipe are publicly accessible to all visitors.</p>
            </section>

            <section>
                <h2>Data sharing</h2>
                <p>We do not sell your personal data. We may share data with:</p>
                <ul>
                    <li><strong>Service providers</strong> — infrastructure providers (Railway, Cloudflare, Netlify) that help us operate the platform.</li>
                    <li><strong>Google</strong> — for advertising purposes as described above.</li>
                    <li><strong>Legal authorities</strong> — if required by law.</li>
                </ul>
            </section>

            <section>
                <h2>Your rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access the personal data we hold about you.</li>
                    <li>Request correction of inaccurate data.</li>
                    <li>Request deletion of your account and associated data.</li>
                    <li>Withdraw consent at any time by deleting your account.</li>
                </ul>
                <p>To exercise any of these rights, contact us at the email below.</p>
            </section>

            <section>
                <h2>Data retention</h2>
                <p>We retain your account data for as long as your account is active. If you delete your account, your personal information and recipes will be permanently removed within 30 days.</p>
            </section>

            <section>
                <h2>Contact</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@recipe-sharing-platform.com">privacy@recipe-sharing-platform.com</a></p>
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
