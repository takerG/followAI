/// <reference types="astro/client" />

declare module 'virtual:examples' {
  import type { ResolvedExample } from './types/example';
  const examples: ResolvedExample[];
  export default examples;
}
