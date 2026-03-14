import fs from 'fs';

const BASE_URL = 'https://recipe-sharing-platform.com';
const API_URL = 'https://api.recipe-sharing-platform.com/api';

const staticPages = [
    { url: '/',        priority: '1.0', changefreq: 'daily' },
    { url: '/about',   priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { url: '/login',   priority: '0.3', changefreq: 'monthly' },
];

async function fetchAllRecipes() {
    const recipes = [];
    let page = 1;
    let lastPage = 1;

    while (page <= lastPage) {
        const res = await fetch(`${API_URL}/recipes?per_page=100&page=${page}`);
        const data = await res.json();
        recipes.push(...data.data);
        lastPage = data.meta.last_page;
        page++;
    }

    return recipes;
}

function toSitemapDate(dateString) {
    return new Date(dateString).toISOString().split('T')[0];
}

async function generateSitemap() {
    console.log('Fetching recipes from API...');
    const recipes = await fetchAllRecipes();
    console.log(`Found ${recipes.length} recipes.`);

    const staticEntries = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    const recipeEntries = recipes.map(recipe => `
  <url>
    <loc>${BASE_URL}/recipe/${recipe.id}</loc>
    <lastmod>${toSitemapDate(recipe.updated_at ?? recipe.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${recipeEntries}
</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('sitemap.xml written to /public/sitemap.xml');
}

generateSitemap().catch(console.error);
