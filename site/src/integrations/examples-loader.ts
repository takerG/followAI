import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import type { ResolvedExample, ExampleMeta } from '../types/example.js';
import { isValidExampleMeta } from '../types/example.js';

const VIRTUAL_MODULE_ID = 'virtual:examples';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;
const EXAMPLES_DIR = path.resolve(process.cwd(), '../examples');
const MAX_DIR_SIZE_BYTES = 10 * 1024 * 1024; // 10MB hard cap

/** Strip UTF-8 BOM if present */
function stripBOM(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

/** Calculate total size of a directory (non-recursive for top-level check) */
function getDirSize(dirPath: string): number {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        total += fs.statSync(entryPath).size;
      } else if (entry.isDirectory()) {
        total += getDirSize(entryPath);
      }
    }
  } catch {
    // ignore errors
  }
  return total;
}

/** Resolve a path and verify it stays within a root directory */
export function resolveSafePath(
  root: string,
  requestedPath: string,
): string | null {
  const resolved = path.resolve(root, requestedPath);
  const normalizedRoot = path.resolve(root) + path.sep;
  if (!resolved.startsWith(normalizedRoot) && resolved !== path.resolve(root)) {
    return null;
  }
  return resolved;
}

/** MIME type map for dev middleware */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/** Scan examples directory and return validated example list */
export function scanExamples(examplesDir: string = EXAMPLES_DIR): ResolvedExample[] {
  if (!fs.existsSync(examplesDir)) {
    return [];
  }

  const entries = fs.readdirSync(examplesDir, { withFileTypes: true });
  const examples: ResolvedExample[] = [];
  const slugSet = new Set<string>();

  for (const entry of entries) {
    const entryPath = path.join(examplesDir, entry.name);

    // Skip non-directories
    if (!entry.isDirectory()) continue;

    // Skip symlinks
    try {
      const stat = fs.lstatSync(entryPath);
      if (stat.isSymbolicLink()) {
        console.warn(`[examples-loader] Skipping symlink: ${entry.name}`);
        continue;
      }
    } catch {
      continue;
    }

    // Check size limit
    const dirSize = getDirSize(entryPath);
    if (dirSize > MAX_DIR_SIZE_BYTES) {
      console.warn(
        `[examples-loader] Skipping ${entry.name}: directory size ${(dirSize / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`,
      );
      continue;
    }

    // Slug collision detection (case-insensitive)
    const normalizedSlug = entry.name.toLowerCase();
    if (slugSet.has(normalizedSlug)) {
      throw new Error(
        `[examples-loader] Slug collision detected: "${entry.name}" conflicts with an existing example (case-insensitive)`,
      );
    }
    slugSet.add(normalizedSlug);

    // Read meta.json
    const metaPath = path.join(entryPath, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`[examples-loader] Skipping ${entry.name}: no meta.json`);
      continue;
    }

    let meta: unknown;
    try {
      const raw = fs.readFileSync(metaPath, 'utf-8');
      meta = JSON.parse(stripBOM(raw));
    } catch (e) {
      console.warn(
        `[examples-loader] Skipping ${entry.name}: invalid JSON in meta.json — ${e}`,
      );
      continue;
    }

    if (!isValidExampleMeta(meta)) {
      console.warn(
        `[examples-loader] Skipping ${entry.name}: meta.json failed validation`,
      );
      continue;
    }

    // Check for index.html
    const hasIndex = fs.existsSync(path.join(entryPath, 'index.html'));
    if (!hasIndex) {
      console.warn(
        `[examples-loader] Warning: ${entry.name} has no index.html — excluding from list`,
      );
    }

    // Auto-detect cover image if not specified in meta.json
    if (!meta.cover) {
      const coverCandidates = ['cover.svg', 'cover.png', 'cover.jpg', 'cover.jpeg', 'cover.webp'];
      for (const candidate of coverCandidates) {
        if (fs.existsSync(path.join(entryPath, candidate))) {
          (meta as ExampleMeta).cover = candidate;
          break;
        }
      }
    }

    examples.push({
      ...meta,
      slug: entry.name,
      hasIndex,
    });
  }

  // Only include examples with index.html in the returned list
  return examples.filter((e) => e.hasIndex);
}

/** Inject back-button script into HTML content */
export function injectBackButton(html: string, scriptTag: string): string {
  // Case-insensitive regex for </body> (with optional spaces)
  const bodyCloseRegex = /<\/body\s*>/gi;
  const htmlCloseRegex = /<\/html\s*>/gi;

  // Find all </body> matches, use the last one
  let lastBodyMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = bodyCloseRegex.exec(html)) !== null) {
    lastBodyMatch = match;
  }

  if (lastBodyMatch) {
    const idx = lastBodyMatch.index;
    return html.slice(0, idx) + scriptTag + '\n' + html.slice(idx);
  }

  // Fallback: </html>
  let lastHtmlMatch: RegExpExecArray | null = null;
  while ((match = htmlCloseRegex.exec(html)) !== null) {
    lastHtmlMatch = match;
  }

  if (lastHtmlMatch) {
    const idx = lastHtmlMatch.index;
    return html.slice(0, idx) + scriptTag + '\n' + html.slice(idx);
  }

  // Last resort: append
  return html + '\n' + scriptTag;
}

/** Copy examples to dist and inject back-button */
function copyExamples(
  examples: ResolvedExample[],
  distDir: string,
  examplesDir: string = EXAMPLES_DIR,
): void {
  const examplesDist = path.join(distDir, 'examples');

  // Read all example dirs (not just validated ones — copy everything)
  const entries = fs.readdirSync(examplesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const srcDir = path.join(examplesDir, entry.name);
    const destDir = path.join(examplesDist, entry.name);

    // Copy directory recursively
    copyDirSync(srcDir, destDir);

    // Find the example in validated list for chrome setting
    const example = examples.find((e) => e.slug === entry.name);
    const shouldInject = example ? example.chrome !== false : true;

    // Inject back-button into index.html if chrome is enabled
    if (shouldInject) {
      const indexPath = path.join(destDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8');
        const scriptTag = `<script src="/assets/back-button.js"></script>`;
        const injected = injectBackButton(html, scriptTag);
        fs.writeFileSync(indexPath, injected, 'utf-8');
      }
    }
  }
}

/** Recursively copy a directory */
function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Create the Astro integration */
export function examplesLoader(): AstroIntegration {
  let examples: ResolvedExample[] = [];

  return {
    name: 'examples-loader',
    hooks: {
      'astro:config:setup'({ updateConfig, addMiddleware: _addMiddleware }) {
        // Scan examples at config time
        examples = scanExamples();

        // Register Vite plugin for virtual module
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'vite-plugin-examples',
                resolveId(id: string) {
                  if (id === VIRTUAL_MODULE_ID) {
                    return RESOLVED_VIRTUAL_MODULE_ID;
                  }
                },
                load(id: string) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) {
                    return `export default ${JSON.stringify(examples)};`;
                  }
                },
              },
            ],
          },
        });
      },

      'astro:server:setup'({ server }) {
        // Dev middleware: serve examples files
        server.middlewares.use((req, res, next) => {
          const url = req.url;
          if (!url || !url.startsWith('/examples/')) {
            return next();
          }

          // Decode and resolve the path
          let relativePath: string;
          try {
            relativePath = decodeURIComponent(url.replace('/examples/', ''));
          } catch {
            res.statusCode = 400;
            res.end('Bad Request');
            return;
          }

          const safePath = resolveSafePath(EXAMPLES_DIR, relativePath);
          if (!safePath) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }

          // Serve the file
          try {
            const stat = fs.statSync(safePath);
            if (stat.isDirectory()) {
              // Try index.html
              const indexPath = path.join(safePath, 'index.html');
              if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf-8');
                const scriptTag = `<script src="/assets/back-button.js"></script>`;
                const injected = injectBackButton(content, scriptTag);
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(injected);
                return;
              }
            }

            if (!stat.isFile()) {
              res.statusCode = 404;
              res.end('Not Found');
              return;
            }

            const ext = path.extname(safePath).toLowerCase();
            const contentType =
              MIME_TYPES[ext] || 'application/octet-stream';

            const content = fs.readFileSync(safePath);
            res.setHeader('Content-Type', contentType);
            res.end(content);
          } catch {
            res.statusCode = 404;
            res.end('Not Found');
          }
        });
      },

      'astro:build:done'({ dir }) {
        const distDir = dir.pathname.replace(/\/$/, '');
        // On Windows, URL pathname may have a leading /
        const cleanDist = distDir.startsWith('/') && process.platform === 'win32'
          ? distDir.slice(1)
          : distDir;
        copyExamples(examples, cleanDist);
        console.log(
          `[examples-loader] Copied ${examples.length} examples to dist/examples/`,
        );
      },
    },
  };
}
