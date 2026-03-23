# 🍄 Recipe Sharing Platform

A full-stack recipe sharing application built with a hobbit-pantry aesthetic. Users can browse recipes, create accounts, post their own recipes with images, like and favourite dishes, and manage their profile — all backed by a production-deployed REST API.

Free users get up to 10 recipes. Premium subscribers (€4.99/month or €39/year) unlock unlimited recipes, PDF recipe card exports, and more.

![Recipe Sharing Platform](recipe_sharing_platform.png)

---

## Live

- **Frontend:** https://recipe-sharing-platform.com
- **API:** https://api.recipe-sharing-platform.com

---

## Live Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                   Vue 3 SPA (Vite)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / JSON + FormData
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Laravel 11 REST API (Railway)                  │
│     Sanctum · Stripe Webhooks · DomPDF · CheckPremium      │
└────────────┬──────────────┬──────────────┬──────────────────┘
             │              │              │
             ▼              ▼              ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────────────┐
│  MySQL (Railway) │ │  Cloudflare  │ │  Stripe               │
│  users,recipes,  │ │  R2 Images   │ │  Subscriptions,       │
│  subscriptions   │ │              │ │  Webhooks, Portal     │
└──────────────────┘ └──────────────┘ └───────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| Vue 3 (Composition API) | UI framework |
| Vite | Build tool and dev server |
| Vue Router 4 | Client-side routing with navigation guards |
| Pinia | Global state management |
| `useForm` composable | Form validation with cross-field rules |
| `usePlan` composable | Subscription state, checkout, billing portal |
| `useTimeAgo` composable | Relative timestamps |

### Backend
| Technology | Role |
|---|---|
| Laravel 11 | REST API framework |
| Laravel Sanctum | Token-based API authentication |
| Stripe PHP SDK | Checkout sessions, webhooks, billing portal |
| barryvdh/laravel-dompdf | PDF recipe card generation |
| Eloquent ORM | Database models and relationships |
| Form Requests | Validation layer |
| API Resources | Response shaping |
| Gates & Policies | Ownership-based authorization |
| Flysystem S3 | Cloud file storage abstraction |

### Infrastructure
| Service | Role |
|---|---|
| Railway | API hosting and MySQL database |
| Cloudflare R2 | S3-compatible object storage for images |
| Stripe | Payment processing, subscription management |
| Netlify | Frontend static hosting |

---

## Features

### Free Tier
- Register and create an account
- Browse the full recipe feed
- Up to **10 published recipes**
- Like and favourite recipes
- Profile page with recipe history
- AdSense-supported

### Premium (€4.99/month or €39/year)
- **Unlimited recipes**
- **Printable recipe card PDF export** — beautifully formatted A4 card with cookbook aesthetic
- Ad-free experience
- Private / draft recipes *(coming soon)*
- Up to 5 images per recipe *(coming soon)*
- Nutritional info + serving calculator *(coming soon)*

### Authentication
- Register with name, email, password
- Login returning a Sanctum Bearer token
- Token persisted in `localStorage`
- Navigation guards protect authenticated and guest-only routes

### Recipe Feed
- Public feed of all recipes
- Search, filter by category and difficulty
- Category emoji placeholders: breakfast 🍳, pasta 🍝, soup 🍲, salad 🥗, meat 🥩, dessert 🍰, vegetarian 🥦

### Recipe Detail
- Full recipe with image, description, ingredients, numbered steps
- Like and favourite toggles
- Owner controls: Edit and Delete (with confirmation modal)
- **Premium:** Download Recipe Card as PDF

### Add / Edit Recipe
- Full form with dynamic ingredient and step rows
- Image upload with live preview
- Client-side validation before any API call
- Free tier paywall — shows upgrade modal when 10-recipe limit is reached

### Billing & Subscription
- `/settings/billing` page shows current plan and free tier usage bar
- Upgrade modal with monthly/yearly toggle and feature list
- Stripe Checkout redirect for payment
- Stripe Billing Portal for self-serve cancel, upgrade, invoice download
- Gold ★ crown badge on nav avatar when Premium is active
- Plan synced to Pinia store and localStorage — no page reload needed

---

## Project Structure

### Frontend (`src/`)
```
src/
├── assets/
│   └── main.css                  # CSS variables, global styles, hobbit theme
├── components/
│   ├── AppNav.vue                 # Navigation bar with billing link + premium badge
│   ├── PricingModal.vue           # Upgrade modal with monthly/yearly toggle
│   ├── RecipeCard.vue             # Feed card
│   ├── ConfirmModal.vue           # Reusable delete confirmation modal
│   └── ScrollToTop.vue            # Fixed scroll-up button
├── composables/
│   ├── usePlan.js                 # isPremium, atFreeLimit, startCheckout, refreshPlan
│   ├── useForm.js                 # Reactive form state and validation
│   └── useTimeAgo.js              # Relative timestamps
├── router/
│   └── index.js                   # Routes with auth guards
├── services/
│   └── api.js                     # Fetch wrapper, Bearer token, all endpoints
├── stores/
│   ├── auth.js                    # Login, register, logout, incrementRecipeCount
│   └── recipes.js                 # Fetch, create, update, delete, like, favourite
└── views/
    ├── HomeView.vue                # Public recipe feed
    ├── RecipeDetailView.vue        # Full recipe + PDF export button
    ├── AddRecipeView.vue           # Create recipe with free tier paywall
    ├── EditRecipeView.vue          # Edit recipe form (pre-filled)
    ├── ProfileView.vue             # My Recipes + Favourites tabs
    ├── LoginView.vue               # Login / Register tabs
    ├── BillingSettings.vue         # Plan status + manage billing
    ├── CheckoutSuccess.vue         # Post-payment landing, refreshes plan
    └── NotFoundView.vue            # 404
```

---

## Subscription Flow

```
User clicks "Upgrade"
        │
        ▼
PricingModal (monthly / yearly toggle)
        │
        ▼
POST /api/subscribe → Stripe Checkout Session
        │
        ▼
Stripe hosted payment page
        │
   ┌────┴────┐
   │         │
   ▼         ▼
/checkout  Stripe webhook → POST /api/webhook/stripe
/success        │
   │        Updates subscriptions table
   │            │
   └────────────┘
        │
        ▼
user.plan = 'premium' in store + localStorage
Premium features unlocked instantly
```

---

## Key Design Decisions

**Token auth over sessions** — Sanctum Bearer tokens avoid CSRF complexity for cross-origin API calls.

**POST for multipart updates** — Browsers cannot send `FormData` via `PUT`. Update endpoints use `POST`.

**Webhook as source of truth** — The checkout success redirect updates the UI optimistically, but the webhook is the authoritative record. Both run independently so a skipped redirect never loses a subscription.

**Local plan cache** — `usePlan.js` reads from the Pinia auth store (backed by localStorage) so plan state is available immediately on every page without an extra API call. `refreshPlan()` re-syncs after checkout.

**Composable-first frontend** — All subscription logic lives in `usePlan.js`, keeping views thin.

**Cloudflare R2 for images** — S3-compatible, free for moderate traffic, no egress fees.

---

## Environment Variables

### Vue (`.env.local` for development)

```env
VITE_API_URL=http://localhost:8000/api
```

Production falls back to the hardcoded `https://api.recipe-sharing-platform.com/api` in `services/api.js`.

---

## Local Development

```bash
# Frontend
npm install
npm run dev

# Backend (separate repo)
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Stripe webhook forwarding (third terminal)
stripe listen --forward-to http://localhost:8000/api/webhook/stripe
```

---

## License

MIT
