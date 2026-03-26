import { describe, it, expect, vi } from 'vitest';
import { groupExamples } from '../src/utils/group-examples.js';
import type { ResolvedExample } from '../src/types/example.js';
import type { OrderConfig } from '../src/types/example.js';

/** Helper to create a minimal ResolvedExample */
function makeExample(slug: string, date?: string): ResolvedExample {
  return {
    slug,
    title: `Title for ${slug}`,
    description: `Description for ${slug}`,
    hasIndex: true,
    date,
  };
}

describe('groupExamples', () => {
  const examples: ResolvedExample[] = [
    makeExample('alpha', '2025-03-24'),
    makeExample('bravo', '2025-03-23'),
    makeExample('charlie', '2025-03-22'),
    makeExample('delta', '2025-03-21'),
    makeExample('echo', '2025-03-20'),
  ];

  it('returns all as uncategorized when config is null', () => {
    const result = groupExamples(examples, null);

    expect(result.featured).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.uncategorized).toEqual(examples);
  });

  it('resolves featured slugs in order', () => {
    const config: OrderConfig = {
      featured: ['charlie', 'alpha'],
    };

    const result = groupExamples(examples, config);

    expect(result.featured).toHaveLength(2);
    expect(result.featured[0].slug).toBe('charlie');
    expect(result.featured[1].slug).toBe('alpha');
  });

  it('deduplicates across featured and categories', () => {
    const config: OrderConfig = {
      featured: ['alpha'],
      categories: [
        {
          title: 'Cat 1',
          icon: '🚀',
          items: ['alpha', 'bravo'], // alpha is in featured, should be deduped
        },
      ],
    };

    const result = groupExamples(examples, config);

    expect(result.featured).toHaveLength(1);
    expect(result.featured[0].slug).toBe('alpha');

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].examples).toHaveLength(1);
    expect(result.categories[0].examples[0].slug).toBe('bravo');
  });

  it('hides empty categories after dedup', () => {
    const config: OrderConfig = {
      featured: ['alpha', 'bravo'],
      categories: [
        {
          title: 'Will Be Empty',
          icon: '🔥',
          items: ['alpha', 'bravo'], // both already in featured
        },
        {
          title: 'Has Items',
          icon: '⚡',
          items: ['charlie'],
        },
      ],
    };

    const result = groupExamples(examples, config);

    // First category should be filtered out (empty after dedup)
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].title).toBe('Has Items');
  });

  it('puts unmatched examples in uncategorized sorted by date', () => {
    const config: OrderConfig = {
      featured: ['alpha'],
      categories: [
        { title: 'Cat', icon: '🚀', items: ['bravo'] },
      ],
    };

    const result = groupExamples(examples, config);

    expect(result.uncategorized).toHaveLength(3);
    // Should be sorted by date descending
    expect(result.uncategorized[0].slug).toBe('charlie'); // 03-22
    expect(result.uncategorized[1].slug).toBe('delta');   // 03-21
    expect(result.uncategorized[2].slug).toBe('echo');    // 03-20
  });

  it('skips unknown slugs without crashing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const config: OrderConfig = {
      featured: ['nonexistent', 'alpha'],
      categories: [
        { title: 'Cat', icon: '🚀', items: ['also-missing', 'bravo'] },
      ],
    };

    const result = groupExamples(examples, config);

    expect(result.featured).toHaveLength(1);
    expect(result.featured[0].slug).toBe('alpha');
    expect(result.categories[0].examples).toHaveLength(1);
    expect(result.categories[0].examples[0].slug).toBe('bravo');

    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('handles empty featured array', () => {
    const config: OrderConfig = {
      featured: [],
      categories: [
        { title: 'Cat', icon: '🚀', items: ['alpha', 'bravo'] },
      ],
    };

    const result = groupExamples(examples, config);

    expect(result.featured).toHaveLength(0);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].examples).toHaveLength(2);
  });

  it('handles empty categories array', () => {
    const config: OrderConfig = {
      featured: ['alpha', 'bravo'],
      categories: [],
    };

    const result = groupExamples(examples, config);

    expect(result.featured).toHaveLength(2);
    expect(result.categories).toHaveLength(0);
    expect(result.uncategorized).toHaveLength(3);
  });
});
