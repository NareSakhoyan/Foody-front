# Foody Frontend

Next.js app for browsing, creating, and managing recipes with Clerk auth and Cloudinary image uploads.

## Features
- Browse discover feed and open full recipe detail pages.
- Create, edit, delete your recipes (My Recipes section only).
- Upload recipe photos to Cloudinary; preview images.
- Favorite/unfavorite recipes (heart toggle on cards and detail).
- Save drafts and auto-draft persistence.
- Quick tag filters (top tags), plus searchable combobox for more tags.
- Search, sort (recent/name/prep/cook), and filter by favorites.
- Visibility toggles (public/private) and ingredient management.
- Responsive layout with sidebar navigation (Discover / My Recipes).

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:3000 and sign in with Clerk to add/manage recipes.

## Environment
Set in `.env`:
- `NEXT_PUBLIC_API_URL` – backend API base
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` – Clerk auth
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – image uploads

## Scripts
- `npm run dev` – start dev server
- `npm run lint` – lint
- `npm run build` / `npm run start` – production
