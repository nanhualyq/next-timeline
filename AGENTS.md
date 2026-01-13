# AGENTS.md

This file provides guidelines for AI agents working in this codebase.

## Project Overview

A Next.js 16 timeline application with RSS/HTML crawling capabilities, using SQLite with drizzle-orm, Tailwind CSS, and vitest for testing.

## Commands

### Build & Development
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production (Next.js static/standalone output)
- `npm run start` - Start production server

### Linting & Type Checking
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type check without emitting files

### Testing
- `npx vitest` - Run all tests
- `npx vitest run` - Run tests once (no watch mode)
- `npx vitest run tests/db/channel.test.ts` - Run specific test file
- `npx vitest run --reporter=verbose tests/crawler/HtmlCrawler.test.ts` - Run single test with verbose output
- `npx vitest run --update` - Update snapshots

### Database
- `npx drizzle-kit push` - Push schema to database (used in tests)
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations

## Code Style Guidelines

### TypeScript
- Strict mode enabled; avoid `any` type
- Use explicit types for function parameters and return values
- Use `interface` for object types, `type` for unions/intersections
- Use `zod` for runtime validation (see `app/actions.ts` for examples)

### Imports
Organize imports in this order:
1. `"use client"` or `"use server"` directives
2. Third-party imports (React, drizzle-orm, etc.)
3. Absolute imports from `@/` (app imports)
4. Relative imports (./, ../)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { channelTable } from "@/src/db/schema";
import { deleteChannel } from "@/app/actions";
import ChannelTitle from "./ChannelTitle";
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ChannelItem`, `ArticleList`)
- **Files**: camelCase for utilities, PascalCase for components (e.g., `utils.ts`, `ChannelItem.tsx`)
- **Variables/functions**: camelCase (e.g., `channelCrawler`, `handleDelete`)
- **Database tables**: snake_case (e.g., `channelTable`, `articleTable`)
- **Props interfaces**: `Props` suffix for component props (e.g., `interface Props { channel: ... }`)

### React Components
- Use `"use client"` for interactive components
- Use functional components with TypeScript interfaces for props
- Default export for page components, named export for reusable components
- Extract complex logic to custom hooks (see `hooks/` directory)

### Database (drizzle-orm)
- Tables defined in `src/db/schema.ts` using `sqliteTable`
- Use `$inferSelect` for read types, `$inferInsert` for write types
- Queries return inferred types; use `getTableColumns()` for partial selects
- Foreign keys use `references()` with `onDelete: "cascade"`

### Error Handling
- Use `try/catch` for async operations
- Log errors with `console.error(error)` for debugging
- Show user feedback via `toast` (sonner) or `Swal` (SweetAlert2)
- Throw descriptive errors for validation failures

### Styling
- Tailwind CSS for all styling (configured via `@tailwindcss/postcss`)
- Use `className` for styling (e.g., `className="text-red-500"`)
- CSS Modules for component-specific styles (`.module.css` files)

### Testing (vitest)
- Use `describe`, `it`, `expect` from `vitest`
- Setup/teardown with `beforeAll`, `afterAll`, `beforeEach`, `afterEach`
- Database tests: push schema before tests with `execSync("npx drizzle-kit push")`
- Clean up database state in `afterAll` or `afterEach`

### Server Actions
- Mark with `"use server"` directive
- Return plain objects with `success` boolean for consistency
- Validate inputs with `zod` schemas before processing

## Project Structure
- `app/` - Next.js App Router pages and layouts
- `components/ui/` - Reusable UI components (shadcn/ui style)
- `src/db/` - Database schema and queries
- `src/crawler/` - RSS/HTML crawling logic
- `tests/` - Unit and integration tests
- `drizzle/` - Database migrations
