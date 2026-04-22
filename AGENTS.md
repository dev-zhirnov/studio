# AGENTS.md

Primary reference for AI coding assistants working on this repo. Other assistant-specific files (`CLAUDE.md`, etc.) should defer to this file and only add tooling-specific notes on top.

## Commands

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start` — production build & start (uses `output: 'standalone'`)
- `npm run lint` — `next lint`
- `npm run worker:content` / `npm run worker:wp` — run worker scripts via `tsx` (standalone Node, not part of Next runtime)
- `docker-compose up -d` — local/Traefik-style production deploy. **Note:** the live deploy on the server uses Coolify, which generates its *own* compose file with Caddy labels — the repo's `docker-compose.yml` is not what's running in production (see Server section below / `CLAUDE.md`).

There is no test suite configured.

## Repository / GitHub

- Remote: `https://github.com/dev-zhirnov/studio.git` (HTTPS)
- The local SSH config has two GitHub identities — `grigiriy` (default `Host github.com`) and `dev-zhirnov` (alias `Host github.com-dev-zhirnov`). The remote is owned by `dev-zhirnov`, so if switching to SSH push, use the `github.com-dev-zhirnov` host alias and the `id_ed25519_dev_zhirnov` key. Don't change the remote without asking.
- Branch convention: `main` is the deploy branch — Coolify auto-builds from it.

## Architecture

This is a **Next.js 16 / React 19** marketing site for Zhirnov Studio that pulls content from a **headless WordPress** instance (`WP_SITE_URL`, default `https://cq77457.tmweb.ru/ZHIRNOV`, overridable via `NEXT_PUBLIC_WP_SITE_URL`).

### Hybrid Pages Router + App Router

The repo intentionally uses **both routers side-by-side**:

- `pages/` — all user-facing pages and the legacy `pages/api/*` routes. `pages/index.tsx` uses `getStaticProps` (ISR-friendly, with an 8s `AbortController` timeout when calling WP). `pages/projects/[slug].tsx` uses `getServerSideProps` and also fetches Rank Math `/wp-json/rankmath/v1/getHead` HTML to inject SEO `<head>`.
- `app/api/*` — newer App Router route handlers (`upload`, `files/[filename]`, `revalidate`). When adding a server endpoint, prefer `app/api/` unless the route logically belongs next to existing `pages/api` handlers.

Do not migrate one to the other casually — they coexist deliberately.

### WordPress integration

- **Content**: read via REST `/wp-json/wp/v2/posts|categories` with `_embed=true&acf_format=standard`. ACF fields like `external_link` / `external_link_image` drive case-study cards.
- **Revalidation**: `app/api/revalidate/route.ts` is the on-publish webhook target. WordPress must POST `{ post_id, post_type }` with `?secret=$REVALIDATE_SECRET` to refresh `/` and `/projects/{post_id}`.
- **Contact form**: `lib/wp-api.ts#submitContactForm` posts directly to Contact Form 7's `/?_wpcf7=6` endpoint as multipart form data (REST API was avoided due to field-name compatibility issues — keep this approach). CF7 returns 302 on success; treat redirect as success. Field names are CF7-specific (`your-name`, `your-phone`, `your-message`, `your-company`, `your-budget`, `your-file`).

### File uploads

`app/api/upload/route.ts` resolves a writable directory by trying `$UPLOAD_DIR`, then `/tmp/uploads`, then `./uploads`. In production `UPLOAD_DIR=/tmp/uploads` is mounted as a persistent volume. Uploaded files are served back through `/api/files/[filename]` and the public URL returned to the client uses `NEXT_PUBLIC_SITE_URL`. The `lib/wp-api.ts` flow uploads via this endpoint *first*, then sends the resulting URL to CF7 as `your-file`.

### i18n

Locale state is a React Context (`context/LanguageContext.tsx`) — `'ru' | 'en'`, default `ru`, strings in `lib/translations.ts`. There is no Next i18n routing; locale is purely client-side.

### Workers

`workers/*.ts` are **Node `worker_threads` scripts**, not Next middleware or service workers. They run via `tsx` (`npm run worker:*`) and are also copied into the Docker image. They are not invoked by the Next runtime today.

## Conventions and constraints

- TypeScript is `strict: false` but `strictNullChecks: true`. Path alias `@/*` → repo root.
- `next.config.js` sets `output: 'standalone'` (required for the Docker image's `node server.js` entrypoint), `images.unoptimized: true`, and long-lived cache headers for `/_next/static`, `/assets`, and `/uploads`.
- The Russian-language CF7 success message `'Форма успешно отправлена!'` is intentional — keep Russian copy as-is unless explicitly changing translations.
- Verbose `[WP-API]` / `[UPLOAD]` console logs in `lib/wp-api.ts` and `app/api/upload/route.ts` are intentional for debugging the WP integration in production logs.
