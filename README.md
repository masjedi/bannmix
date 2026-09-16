# Banmix Dashboard

This repository is split into two independent applications:

- `backend/` — Laravel API (admin auth, products, multilingual site content)
- `frontend/` — Vite/React public website + admin panel

## What it is now

Public site pages: **Home**, **About**, **Products**, **Services**, **Events**, **Gallery**.

Admin-only control (`/admin/login` → `/admin`) for products and website CMS content. Client accounts, registration, inquiries, and marketplace purchase flows have been removed.

## Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Default seeded admin:

- Email: `admin@banmix.com`
- Password: `password`

API routes are registered from `backend/routes/api.php`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional: set `VITE_API_URL` if the API is not at `http://127.0.0.1:8000/api`.

Keep frontend package and build tooling inside `frontend/`. Keep Laravel API code and Composer tooling inside `backend/`.
