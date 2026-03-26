export interface ExampleMeta {
  title: string;
  description: string;
  tags?: string[];
  author?: string;
  date?: string;
  cover?: string;
  lang?: string;
  /** Whether to inject the back-button chrome. Defaults to true. */
  chrome?: boolean;
}

/** Runtime type guard — zero dependencies, safe validation. */
export function isValidExampleMeta(obj: unknown): obj is ExampleMeta {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;

  // Required fields
  if (typeof o.title !== 'string' || o.title.trim().length === 0) return false;
  if (typeof o.description !== 'string' || o.description.trim().length === 0)
    return false;

  // Length limits
  if (o.title.length > 200) return false;
  if (o.description.length > 1000) return false;

  // Optional: tags must be an array if present
  if (o.tags !== undefined && !Array.isArray(o.tags)) return false;

  // Optional: cover must be a safe relative path
  if (o.cover !== undefined) {
    const c = String(o.cover);
    if (
      c.includes('://') ||
      c.startsWith('//') ||
      c.startsWith('javascript:') ||
      c.startsWith('data:')
    )
      return false;
  }

  // Optional: chrome must be boolean if present
  if (o.chrome !== undefined && typeof o.chrome !== 'boolean') return false;

  return true;
}

export interface ResolvedExample extends ExampleMeta {
  slug: string;
  hasIndex: boolean;
}

export interface CategoryConfig {
  title: string;
  icon: string;
  items: string[];
}

export interface OrderConfig {
  featured?: string[];
  categories?: CategoryConfig[];
}
