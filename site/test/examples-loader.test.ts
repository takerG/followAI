import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scanExamples } from '../src/integrations/examples-loader';

let tmpDir: string;

function createExampleDir(
  name: string,
  meta: Record<string, unknown> | string | null,
  createIndex = true,
): string {
  const dir = path.join(tmpDir, name);
  fs.mkdirSync(dir, { recursive: true });

  if (meta !== null) {
    const content = typeof meta === 'string' ? meta : JSON.stringify(meta);
    fs.writeFileSync(path.join(dir, 'meta.json'), content, 'utf-8');
  }

  if (createIndex) {
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      '<!doctype html><html><body>Hello</body></html>',
      'utf-8',
    );
  }

  return dir;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-test-'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('scanExamples', () => {
  // 1. Normal: multiple valid examples → returns complete list
  it('returns all valid examples', () => {
    createExampleDir('alpha', { title: 'Alpha', description: 'First example' });
    createExampleDir('beta', {
      title: 'Beta',
      description: 'Second example',
      tags: ['test'],
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('alpha');
    expect(result[1].slug).toBe('beta');
  });

  // 2. Empty directory → returns []
  it('returns empty array for empty directory', () => {
    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
  });

  // 3. examples/ does not exist → returns [] (no exception)
  it('returns empty array when directory does not exist', () => {
    const result = scanExamples('/nonexistent/path/examples');
    expect(result).toEqual([]);
  });

  // 4. Malformed JSON in meta.json → warn + skip
  it('skips examples with malformed JSON', () => {
    createExampleDir('bad-json', '{invalid json!!!');

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('invalid JSON'),
    );
  });

  // 5. Missing title → warn + skip
  it('skips examples missing title', () => {
    createExampleDir('no-title', { description: 'Has description' });

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed validation'),
    );
  });

  // 6. Missing description → warn + skip
  it('skips examples missing description', () => {
    createExampleDir('no-desc', { title: 'Has title' });

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed validation'),
    );
  });

  // 7. No index.html → warn + exclude
  it('excludes examples without index.html', () => {
    createExampleDir(
      'no-index',
      { title: 'No Index', description: 'Missing index.html' },
      false,
    );

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('no index.html'),
    );
  });

  // 8. All optional fields → correctly parsed
  it('parses all optional fields', () => {
    createExampleDir('full', {
      title: 'Full Example',
      description: 'Has all fields',
      tags: ['a', 'b'],
      author: 'Test Author',
      date: '2025-01-01',
      cover: 'cover.png',
      lang: 'en',
      chrome: true,
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].tags).toEqual(['a', 'b']);
    expect(result[0].author).toBe('Test Author');
    expect(result[0].date).toBe('2025-01-01');
    expect(result[0].cover).toBe('cover.png');
    expect(result[0].lang).toBe('en');
    expect(result[0].chrome).toBe(true);
  });

  // 9. chrome=false → chrome is false in list
  it('preserves chrome=false', () => {
    createExampleDir('no-chrome', {
      title: 'No Chrome',
      description: 'No back button',
      chrome: false,
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].chrome).toBe(false);
  });

  // 10. Subdirectory is a file, not a directory → skip
  it('skips files in examples directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'not a dir');
    createExampleDir('valid', {
      title: 'Valid',
      description: 'A valid example',
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('valid');
  });

  // 11. Symlink directory → skip
  it('skips symlink directories', () => {
    const realDir = createExampleDir('real', {
      title: 'Real',
      description: 'Real example',
    });

    try {
      fs.symlinkSync(realDir, path.join(tmpDir, 'link'), 'dir');
    } catch {
      // Symlinks may not be supported (e.g. Windows without admin)
      return;
    }

    const result = scanExamples(tmpDir);
    // Should only return 'real', not 'link'
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('real');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('symlink'),
    );
  });

  // 12. Slug collision (case-insensitive) → throws error
  it('throws on slug collision (case-insensitive)', () => {
    // On case-insensitive filesystems (Windows/macOS), we can't create
    // two directories that differ only by case. Use a mock approach.
    createExampleDir('example-a', {
      title: 'First',
      description: 'First example',
    });

    // Manually manipulate: rename the directory entry to simulate
    // case-insensitive collision. We test the Set-based detection directly.
    const origReaddirSync = fs.readdirSync;
    vi.spyOn(fs, 'readdirSync').mockImplementation(((p: fs.PathLike, options?: unknown) => {
      if (p === tmpDir) {
        // Simulate two entries that differ only by case
        return [
          { name: 'Example-A', isDirectory: () => true, isFile: () => false },
          { name: 'example-a', isDirectory: () => true, isFile: () => false },
        ] as unknown as ReturnType<typeof origReaddirSync>;
      }
      return origReaddirSync(p, options as any);
    }) as typeof fs.readdirSync);

    expect(() => scanExamples(tmpDir)).toThrow('Slug collision');
  });

  // 13. cover: "javascript:alert(1)" → rejected
  it('rejects dangerous cover URIs', () => {
    createExampleDir('xss', {
      title: 'XSS Test',
      description: 'Should be rejected',
      cover: 'javascript:alert(1)',
    });

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed validation'),
    );
  });

  // 14. Title with HTML tags → handled correctly (stored as-is, Astro escapes on render)
  it('accepts titles with HTML-like content', () => {
    createExampleDir('html-title', {
      title: '<b>Bold</b> Title',
      description: 'Description with <script>',
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('<b>Bold</b> Title');
  });

  // 15. BOM in meta.json → parses normally
  it('handles BOM in meta.json', () => {
    const dir = path.join(tmpDir, 'bom-test');
    fs.mkdirSync(dir, { recursive: true });
    // Write with BOM
    const bom = '\uFEFF';
    const json = JSON.stringify({
      title: 'BOM Test',
      description: 'Has BOM',
    });
    fs.writeFileSync(path.join(dir, 'meta.json'), bom + json, 'utf-8');
    fs.writeFileSync(path.join(dir, 'index.html'), '<html></html>', 'utf-8');

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('BOM Test');
  });

  // 16. Directory > 10MB → skipped
  it('skips directories exceeding 10MB', () => {
    const dir = createExampleDir('huge', {
      title: 'Huge',
      description: 'Too big',
    });
    // Create a large file (>10MB)
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');
    fs.writeFileSync(path.join(dir, 'big.bin'), bigBuffer);

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('exceeds 10MB'),
    );
  });

  // 17. tags: "not-array" → validation fails
  it('rejects non-array tags', () => {
    createExampleDir('bad-tags', {
      title: 'Bad Tags',
      description: 'Tags is a string',
      tags: 'not-array',
    });

    const result = scanExamples(tmpDir);
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed validation'),
    );
  });

  // 18. Auto-detect cover.png
  it('auto-detects cover.png when no cover in meta.json', () => {
    const dir = createExampleDir('auto-png', {
      title: 'Auto PNG',
      description: 'Has cover.png file',
    });
    fs.writeFileSync(path.join(dir, 'cover.png'), 'fake-png-data');

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].cover).toBe('cover.png');
  });

  // 19. Auto-detect cover.svg
  it('auto-detects cover.svg when no cover in meta.json', () => {
    const dir = createExampleDir('auto-svg', {
      title: 'Auto SVG',
      description: 'Has cover.svg file',
    });
    fs.writeFileSync(path.join(dir, 'cover.svg'), '<svg></svg>');

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].cover).toBe('cover.svg');
  });

  // 20. meta.json cover takes priority over auto-detected file
  it('prefers cover from meta.json over auto-detected file', () => {
    const dir = createExampleDir('explicit-cover', {
      title: 'Explicit Cover',
      description: 'Has explicit cover in meta.json',
      cover: 'custom.jpg',
    });
    fs.writeFileSync(path.join(dir, 'cover.svg'), '<svg></svg>');

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].cover).toBe('custom.jpg');
  });

  // 21. No cover file → cover remains undefined
  it('leaves cover undefined when no cover file exists', () => {
    createExampleDir('no-cover', {
      title: 'No Cover',
      description: 'No cover file at all',
    });

    const result = scanExamples(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].cover).toBeUndefined();
  });
});
