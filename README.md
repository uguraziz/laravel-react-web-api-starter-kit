# Project Name

## Architecture

Backend
- Laravel 13
- REST API
- Oauth2 Passport
- PostgreSQL

Frontend
- React
- Vite
- TypeScript
- Tailwind
- TanStack Query

---

## Folder Structure

backend/
frontend/

---

## Development

Backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate:fresh --seed

php artisan serve

Frontend

npm install

npm run dev

---

## Branch Strategy

main
develop
feature/*
fix/*
hotfix/*

---

## Coding Standards

Laravel Pint

ESLint

Prettier

TypeScript Strict

---

## Commit Convention

feat:

fix:

refactor:

docs:

test:

chore: