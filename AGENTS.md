# AI Development Rules

You are working on a professional production project.

Always follow these rules.

---

Never change architecture without asking.

Never add new dependencies unless necessary.

Never change API response format.

Never rename endpoints.

Never break backward compatibility.

Always use TypeScript.

Always use reusable components.

Always write clean code.

Always prefer composition over duplication.

Keep files small.

Avoid files larger than 300 lines.

Use SOLID principles.

Do not overengineer.

Use existing services before creating new ones.

Always check existing code before generating new code.

Never create duplicate utilities.

Never create duplicate hooks.

Always respect folder structure.

# Backend Rules

Laravel 13

REST API only.

Never use Blade.

Never use Inertia.

Controllers should stay thin.

Business logic belongs to Services.

Validation belongs to Form Requests.

Never query database inside Controllers.

Use API Resources.

Use Pagination.

Use Transactions when modifying multiple tables.

Prefer Eloquent relationships.

Never duplicate validation.

Follow PSR-12.

Always use dependency injection.

Use enums whenever possible.

Always create tests for Services.

Always use Spatie Laravel Query Builder for API filtering, sorting, and including relations.

Define allowed filters, sorts, and includes explicitly on queries.


# Frontend Rules

React 19

TypeScript Strict

Always use i18n (multi-language) for all user-facing texts. Hardcoded strings are strictly forbidden. Double translations for Turkish (tr) and English (en) must be provided.

Never use JavaScript.

Always use functional components.

Prefer hooks.

Never use class components.

Use React Router.

Use TanStack Query.

Never fetch using fetch().

Always use Axios instance.

Keep components under 200 lines.

Move logic into hooks.

Pages should not contain business logic.

Never call API directly from components.

Use Services.

Use reusable UI.

Use shadcn/ui.

Use Zustand for global state.

frontend/src

components

pages

layouts

hooks

services

api

types

utils

store

routes

Every API call must use

src/api/client.ts

Never create another Axios instance.

Authentication uses Oauth2 laravel passport.

Handle errors globally.

Use interceptors.

Tailwind only.

Never use inline CSS.

Never use CSS Modules.

Prefer utility classes.

Extract repeated UI.

PascalCase

Components

camelCase

Variables

kebab-case

Folders

snake_case

Database

PascalCase.tsx

React Components

useSomething.ts

Hooks


When making changes

1. Read related files first.

2. Reuse existing code.

3. Keep consistency.

4. Explain architectural changes.

5. Do not create unnecessary abstractions.

6. If uncertain ask before changing architecture.