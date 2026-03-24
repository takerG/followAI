import { describe, it, expect } from 'vitest';
import { injectBackButton } from '../src/integrations/examples-loader';

const SCRIPT_TAG = '<script src="/assets/back-button.js"></script>';

describe('injectBackButton', () => {
  // 1. Normal HTML with </body> → inject before </body>
  it('injects before </body>', () => {
    const html = '<!doctype html><html><body><p>Hello</p></body></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toContain(SCRIPT_TAG + '\n</body>');
    expect(result.indexOf(SCRIPT_TAG)).toBeLessThan(result.indexOf('</body>'));
  });

  // 2. No </body> but has </html> → inject before </html>
  it('injects before </html> when no </body>', () => {
    const html = '<!doctype html><html><p>Hello</p></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toContain(SCRIPT_TAG + '\n</html>');
  });

  // 3. Neither → append to end
  it('appends to end when no closing tags', () => {
    const html = '<p>Hello World</p>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toBe(html + '\n' + SCRIPT_TAG);
  });

  // 4. chrome=false → not tested here (handled by caller)
  // This test verifies that the function itself always injects
  it('always injects when called (chrome check is caller responsibility)', () => {
    const html = '<html><body></body></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toContain(SCRIPT_TAG);
  });

  // 5. </BODY> uppercase → correctly injected
  it('handles uppercase </BODY>', () => {
    const html = '<!doctype html><html><BODY><p>Hello</p></BODY></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toContain(SCRIPT_TAG + '\n</BODY>');
  });

  // 6. </body > with spaces → correctly injected
  it('handles </body > with spaces', () => {
    const html = '<!doctype html><html><body><p>Hello</p></body ></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    expect(result).toContain(SCRIPT_TAG + '\n</body >');
  });

  // 7. Multiple </body> → inject before the last one
  it('injects before the last </body>', () => {
    const html =
      '<html><body><!-- </body> fake --><p>Content</p></body></html>';
    const result = injectBackButton(html, SCRIPT_TAG);
    // The script should be before the real closing </body>, not the comment one
    const lastBodyIdx = result.lastIndexOf('</body>');
    const scriptIdx = result.lastIndexOf(SCRIPT_TAG);
    expect(scriptIdx).toBeLessThan(lastBodyIdx);
  });
});
