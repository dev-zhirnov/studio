// Caches WordPress-hosted images locally so the public site doesn't depend on
// the WP origin being fast or even reachable at request time.
//
// Flow per page render (getStaticProps / getServerSideProps):
//   1. Process the WP JSON, find every image URL (featured media, ACF, inline <img>).
//   2. For each URL: hash → filename. If already on disk, just rewrite the URL.
//      Otherwise download once, then rewrite. Failures fall back to the original URL.
//   3. Return the modified post — the page renders with /api/wp-media/* URLs.
//
// Two storage locations, chosen per phase:
//   - Build time (next build): public/wp-media/ — gets baked into the Docker
//     image via `COPY /app/public ./public`, so the first request after a
//     redeploy already has everything.
//   - Runtime (ISR revalidations, on-demand renders): /tmp/uploads/wp-media/ —
//     the persistent named volume, survives container restarts.
// The route handler reads from both (volume first, image fallback).

import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { WP_SITE_URL } from './config';

const PUBLIC_BASE = '/api/wp-media';
const FETCH_TIMEOUT_MS = 10_000;
const SUBDIR = 'wp-media';

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

export const BUILD_MEDIA_DIR = path.join(process.cwd(), 'public', SUBDIR);

let cachedWriteDir: string | null = null;

async function getWriteDir(): Promise<string> {
  if (cachedWriteDir) return cachedWriteDir;

  if (isBuildPhase()) {
    await fs.mkdir(BUILD_MEDIA_DIR, { recursive: true });
    cachedWriteDir = BUILD_MEDIA_DIR;
    return cachedWriteDir;
  }

  const bases = [
    process.env.UPLOAD_DIR,
    '/tmp/uploads',
    path.join(process.cwd(), 'uploads'),
  ].filter(Boolean) as string[];

  for (const base of bases) {
    const dir = path.join(base, SUBDIR);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.access(dir, fsConstants.W_OK);
      cachedWriteDir = dir;
      return dir;
    } catch {
      // try next candidate
    }
  }
  throw new Error('[wp-media] No writable media directory found');
}

// Read locations for the route handler — volume first (fresh ISR downloads),
// then the image-baked public/wp-media/ (build-time downloads).
const READ_DIRS = [
  process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, SUBDIR) : null,
  path.join('/tmp/uploads', SUBDIR),
  path.join(process.cwd(), 'uploads', SUBDIR),
  BUILD_MEDIA_DIR,
].filter(Boolean) as string[];

export async function findMediaFile(filename: string): Promise<string | null> {
  for (const dir of READ_DIRS) {
    const p = path.join(dir, filename);
    try {
      await fs.access(p, fsConstants.R_OK);
      return p;
    } catch {
      // try next
    }
  }
  return null;
}

function filenameFor(url: string): string {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  let ext = '.bin';
  try {
    const pathname = new URL(url).pathname;
    const e = path.extname(pathname).toLowerCase();
    if (e && e.length <= 6 && /^\.[a-z0-9]+$/i.test(e)) ext = e;
  } catch {
    // keep .bin
  }
  return `${hash}${ext}`;
}

function shouldCache(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith(PUBLIC_BASE)) return false; // already local
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    const wp = new URL(WP_SITE_URL);
    return u.host === wp.host;
  } catch {
    return false;
  }
}

export async function cacheImage(url: string): Promise<string> {
  if (!shouldCache(url)) return url;

  const filename = filenameFor(url);
  const localUrl = `${PUBLIC_BASE}/${filename}`;

  // Already cached somewhere (volume or baked-in public/)? Just rewrite.
  if (await findMediaFile(filename)) return localUrl;

  let fullPath: string;
  try {
    const dir = await getWriteDir();
    fullPath = path.join(dir, filename);
  } catch (err) {
    console.warn('[wp-media] no writable dir, serving original URL:', err);
    return url;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    // Write to a temp file then rename — atomic on POSIX, avoids serving
    // a half-written file to a parallel request.
    const tmpPath = `${fullPath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmpPath, buf);
    await fs.rename(tmpPath, fullPath);
    return localUrl;
  } catch (err) {
    console.warn(
      `[wp-media] failed to cache ${url}:`,
      err instanceof Error ? err.message : err,
    );
    return url; // fall back so the image still renders from WP
  }
}

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const SRC_ATTR_RE = /\bsrc="([^"]+)"/i;
const SRCSET_ATTR_RE = /\bsrcset="([^"]+)"/i;

export async function rewriteHtml(html: string): Promise<string> {
  if (!html) return html;

  // Pass 1: collect every URL we'd want to cache.
  const urls = new Set<string>();
  const tags = html.match(IMG_TAG_RE) || [];
  for (const tag of tags) {
    const src = tag.match(SRC_ATTR_RE)?.[1];
    if (src) urls.add(src);
    const srcset = tag.match(SRCSET_ATTR_RE)?.[1];
    if (srcset) {
      for (const part of srcset.split(',')) {
        const u = part.trim().split(/\s+/)[0];
        if (u) urls.add(u);
      }
    }
  }

  if (urls.size === 0) return html;

  // Pass 2: cache them all in parallel, build a lookup table.
  const map = new Map<string, string>();
  await Promise.all(
    Array.from(urls).map(async (u) => {
      map.set(u, await cacheImage(u));
    }),
  );

  // Pass 3: rewrite each <img> tag in place.
  return html.replace(IMG_TAG_RE, (tag) => {
    let out = tag.replace(SRC_ATTR_RE, (_m, src) => `src="${map.get(src) ?? src}"`);
    out = out.replace(SRCSET_ATTR_RE, (_m, srcset) => {
      const rewritten = srcset
        .split(',')
        .map((part: string) => {
          const trimmed = part.trim();
          const [u, ...rest] = trimmed.split(/\s+/);
          const newU = map.get(u) ?? u;
          return [newU, ...rest].join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    });
    return out;
  });
}

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i;

export async function processWpPost<T extends Record<string, any>>(post: T | null): Promise<T | null> {
  if (!post) return post;

  // Featured media (and any size variants embedded by _embed=true).
  const featured = post._embedded?.['wp:featuredmedia']?.[0];
  if (featured?.source_url) {
    featured.source_url = await cacheImage(featured.source_url);
  }
  const sizes = featured?.media_details?.sizes;
  if (sizes && typeof sizes === 'object') {
    await Promise.all(
      Object.values(sizes).map(async (size: any) => {
        if (size?.source_url) size.source_url = await cacheImage(size.source_url);
      }),
    );
  }

  // ACF: any string field that looks like an image URL gets cached.
  // Covers external_link_image, plus anything else added later.
  if (post.acf && typeof post.acf === 'object') {
    await Promise.all(
      Object.keys(post.acf).map(async (k) => {
        const v = post.acf[k];
        if (typeof v === 'string' && IMAGE_EXT_RE.test(v) && shouldCache(v)) {
          post.acf[k] = await cacheImage(v);
        }
      }),
    );
  }

  // Body and excerpt HTML.
  if (post.content?.rendered) {
    post.content.rendered = await rewriteHtml(post.content.rendered);
  }
  if (post.excerpt?.rendered) {
    post.excerpt.rendered = await rewriteHtml(post.excerpt.rendered);
  }

  return post;
}

export async function processWpPosts<T extends Record<string, any>>(posts: T[]): Promise<T[]> {
  return Promise.all(posts.map((p) => processWpPost(p) as Promise<T>));
}
