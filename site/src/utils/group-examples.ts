import type { ResolvedExample } from '../types/example.js';
import type { OrderConfig } from '../types/example.js';

export interface GroupedExamples {
  featured: ResolvedExample[];
  categories: { title: string; icon: string; examples: ResolvedExample[] }[];
  uncategorized: ResolvedExample[];
}

/**
 * Groups examples by order config (featured, categories, uncategorized).
 * Deduplicates: featured takes priority, then categories in order.
 * Unknown slugs are warned and skipped. Missing config returns all as uncategorized.
 */
export function groupExamples(
  allExamples: ResolvedExample[],
  config: OrderConfig | null,
): GroupedExamples {
  if (!config) {
    return { featured: [], categories: [], uncategorized: allExamples };
  }

  const bySlug = new Map(allExamples.map((e) => [e.slug, e]));
  const usedSlugs = new Set<string>();

  // Resolve featured
  const featured = (config.featured || [])
    .map((slug) => {
      const example = bySlug.get(slug);
      if (!example) {
        console.warn(`[order.json] Featured slug not found: "${slug}"`);
      }
      return example;
    })
    .filter((e): e is ResolvedExample => e !== undefined);
  featured.forEach((e) => usedSlugs.add(e.slug));

  // Resolve categories (dedup against featured and prior categories)
  const categories = (config.categories || [])
    .map((cat) => ({
      title: cat.title,
      icon: cat.icon,
      examples: cat.items
        .map((slug) => {
          const example = bySlug.get(slug);
          if (!example) {
            console.warn(
              `[order.json] Category "${cat.title}" slug not found: "${slug}"`,
            );
          }
          return example;
        })
        .filter(
          (e): e is ResolvedExample =>
            e !== undefined && !usedSlugs.has(e.slug),
        ),
    }))
    .filter((cat) => cat.examples.length > 0);

  // Track category slugs
  categories.forEach((cat) =>
    cat.examples.forEach((e) => usedSlugs.add(e.slug)),
  );

  // Uncategorized = everything not used, sorted by date
  const uncategorized = allExamples
    .filter((e) => !usedSlugs.has(e.slug))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return { featured, categories, uncategorized };
}
