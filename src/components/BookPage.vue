<template>
    <div class="book-page-scene">
        <!-- Back link sits above the book -->
        <RouterLink v-if="backTo" :to="backTo" class="book-back">← {{ backLabel }}</RouterLink>

        <div class="book-scene-wrap">
            <!-- Hard cover left -->
            <div class="bps-cover bps-cover--left"></div>

            <div class="bps-spread">
                <!-- LEFT page: decorative / chapter title -->
                <div class="bps-page bps-page--left">
                    <div class="bps-page-header">
                        <span class="bps-chapter">{{ leftChapter }}</span>
                        <span class="bps-pagenum">p. I</span>
                    </div>
                    <div class="bps-left-content">
                        <div class="bps-ornament">✦</div>
                        <h2 class="bps-left-title">{{ title }}</h2>
                        <p class="bps-left-tagline" v-if="tagline">{{ tagline }}</p>
                        <div class="bps-ruled-filler">
                            <span v-for="n in 14" :key="n" class="bps-rule-line"></span>
                        </div>
                        <div class="bps-ornament bps-ornament--bottom">❧</div>
                    </div>
                </div>

                <!-- SPINE -->
                <div class="bps-spine">
                    <div class="bps-spine-line"></div>
                    <div class="bps-spine-line"></div>
                    <div class="bps-spine-line"></div>
                </div>

                <!-- RIGHT page: slot content -->
                <div class="bps-page bps-page--right">
                    <div class="bps-page-header bps-page-header--right">
                        <span class="bps-pagenum">p. II</span>
                        <span class="bps-chapter">{{ rightChapter }}</span>
                    </div>
                    <div class="bps-right-content">
                        <slot />
                    </div>
                </div>
            </div>

            <!-- Hard cover right -->
            <div class="bps-cover bps-cover--right"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title:        { type: String, required: true },
    tagline:      { type: String, default: '' },
    leftChapter:  { type: String, default: 'Shire Kitchen' },
    rightChapter: { type: String, default: 'Recipe Sharing Platform' },
    backTo:       { type: String, default: '/' },
    backLabel:    { type: String, default: 'Back to recipes' },
});
</script>

<style scoped>
/* ── Outer wrapper ── */
.book-page-scene {
    padding: 1.2rem 1rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
}

.book-back {
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-size: .82rem;
    color: #c9a03d;
    text-decoration: none;
    letter-spacing: .06em;
    margin-bottom: 1rem;
    transition: color .15s;
}
.book-back:hover { color: #f0c060; }

/* ── Book chrome (mirrors HomeView) ── */
.book-scene-wrap {
    display: flex;
    align-items: stretch;
    justify-content: center;
    box-shadow: 0 28px 56px rgba(0,0,0,.75), 0 10px 20px rgba(0,0,0,.5);
    border-radius: 6px;
    overflow: hidden;
}

.bps-cover {
    width: 26px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #3e2008 0%, #6b3f18 40%, #3e2008 100%);
}
.bps-cover--left  { border-radius: 6px 0 0 6px; box-shadow: inset -4px 0 12px rgba(0,0,0,.55); }
.bps-cover--right { border-radius: 0 6px 6px 0; box-shadow: inset  4px 0 12px rgba(0,0,0,.55); }

/* ── Spread ── */
.bps-spread {
    display: flex;
    flex: 1;
    max-width: 1148px;
}

/* ── Pages ── */
.bps-page {
    flex: 1;
    background: #fef7e9;
    padding: 1.8rem 1.6rem 2rem;
    display: flex;
    flex-direction: column;
    position: relative;
    min-height: 580px;
}
/* ruled lines */
.bps-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
        transparent, transparent 32px, #d4a85412 33px
    );
}
.bps-page--left  { box-shadow: inset -8px 0 20px rgba(0,0,0,.08); }
.bps-page--right { box-shadow: inset  8px 0 20px rgba(0,0,0,.08); }

/* ── Page headers ── */
.bps-page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Playfair Display', serif;
    font-size: .72rem;
    color: #a08060;
    text-transform: uppercase;
    letter-spacing: .1em;
    border-bottom: 1px solid #c9a03d55;
    padding-bottom: .7rem;
    margin-bottom: 1.4rem;
    position: relative;
    z-index: 1;
}

/* ── Left page decorative content ── */
.bps-left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .8rem;
    position: relative;
    z-index: 1;
    padding: 1rem 1.5rem;
    text-align: center;
}

.bps-ornament {
    font-size: 1.8rem;
    color: #c9a03d;
    opacity: .6;
    line-height: 1;
}
.bps-ornament--bottom { margin-top: auto; }

.bps-left-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    color: #4a2e10;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
}

.bps-left-tagline {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 1rem;
    color: #8b6b41;
    margin: 0;
}

.bps-ruled-filler {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    padding: 1.5rem 0;
    opacity: .35;
}
.bps-rule-line {
    display: block;
    height: 1px;
    background: #c9a03d;
    border-radius: 1px;
    width: 100%;
}
.bps-rule-line:nth-child(odd)  { width: 88%; align-self: flex-start; }
.bps-rule-line:nth-child(3n)   { width: 60%; align-self: center; }

/* ── Right page: slot content ── */
.bps-right-content {
    flex: 1;
    position: relative;
    z-index: 1;
    overflow-y: auto;
}

/* ── Spine ── */
.bps-spine {
    width: 22px;
    flex-shrink: 0;
    background: linear-gradient(to right, #4a2a0a 0%, #8b5a28 45%, #6b4020 55%, #4a2a0a 100%);
    box-shadow: 0 0 28px rgba(0,0,0,.7), inset 0 0 10px rgba(0,0,0,.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    z-index: 2;
}
.bps-spine-line {
    width: 2px;
    height: 40px;
    background: rgba(255,210,120,.18);
    border-radius: 1px;
}

/* ── Tablet: stacked pages ── */
@media (min-width: 681px) and (max-width: 899px) {
    .bps-spread       { flex-direction: column; max-width: 540px; margin: 0 auto; }
    .bps-spine        { width: 100%; height: 16px; flex-direction: row; justify-content: center; }
    .bps-spine-line   { width: 40px; height: 2px; }
    .bps-cover        { display: none; }
    .bps-page         { min-height: unset; padding: 1.2rem 1rem; }
    .bps-page--left   { min-height: 180px; }
    .bps-left-content { padding: .5rem; gap: .5rem; }
    .bps-left-title   { font-size: 1.6rem; }
    .bps-ruled-filler { display: none; }
}

/* ── Mobile: strip book chrome ── */
@media (max-width: 680px) {
    .book-scene-wrap  { box-shadow: none; border-radius: 0; }
    .bps-cover        { display: none; }
    .bps-spine        { display: none; }
    .bps-spread       { flex-direction: column; }
    .bps-page         { min-height: unset; padding: 1rem .9rem; border-radius: 6px; margin-bottom: 10px; box-shadow: 0 4px 16px rgba(0,0,0,.35); }
    .bps-page::before { display: none; }
    .bps-page--left   { min-height: 100px; }
    .bps-left-title   { font-size: 1.5rem; }
    .bps-ruled-filler { display: none; }
    .bps-left-content { padding: .5rem; gap: .4rem; justify-content: flex-start; }
    .bps-ornament--bottom { display: none; }
}
</style>
