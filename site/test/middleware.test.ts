import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { resolveSafePath } from '../src/integrations/examples-loader';

const ROOT = path.resolve('/tmp/test-examples');

describe('middleware path safety (resolveSafePath)', () => {
  // 1. Normal file request → resolves within root
  it('resolves normal paths within root', () => {
    const result = resolveSafePath(ROOT, 'my-example/index.html');
    expect(result).toBe(path.join(ROOT, 'my-example', 'index.html'));
  });

  // 2. Path traversal ../../.env → null (403)
  it('rejects path traversal with ../', () => {
    const result = resolveSafePath(ROOT, '../../.env');
    expect(result).toBeNull();
  });

  // 3. URL-encoded traversal ..%2F..%2F → null (403)
  it('rejects URL-encoded path traversal', () => {
    // The caller decodes first, so we test with decoded path
    const decoded = decodeURIComponent('..%2F..%2F.env');
    const result = resolveSafePath(ROOT, decoded);
    expect(result).toBeNull();
  });

  // 4. Non-existent file → still resolves (404 is handled by caller)
  it('resolves non-existent files within root', () => {
    const result = resolveSafePath(ROOT, 'nonexistent/file.txt');
    expect(result).toBe(path.join(ROOT, 'nonexistent', 'file.txt'));
  });
});
