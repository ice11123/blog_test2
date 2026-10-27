import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

/** Resolve dir1/dir2 from post frontmatter or fall back to path segments. */
export function resolveDirs(post: BlogPost): { dir1: string; dir2: string; dir3: string } {
  const parts = post.id.split('/');
  return {
    dir1: post.data.dir1 ?? (parts.length >= 2 ? parts[0] : ''),
    dir2: post.data.dir2 ?? (parts.length >= 3 ? parts[1] : ''),
    dir3: post.data.dir3 ?? '',
  };
}

/** Count words in mixed Chinese/English text. Strips code blocks, HTML, and markdown syntax first. */
export function countWords(text: string): number {
  // Remove fenced code blocks
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  cleaned = cleaned.replace(/`[^`]*`/g, '');
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  // Remove markdown link syntax [text](url) → text, images ![alt](url) → alt
  cleaned = cleaned.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
  // Remove markdown formatting characters
  cleaned = cleaned.replace(/[*#_~>|]/g, '');
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/g, '');

  let count = 0;
  // Count CJK characters (each char = 1 word)
  const cjk = cleaned.match(/[一-鿿㐀-䶿豈-﫿぀-ゟ゠-ヿ가-힯]/g);
  if (cjk) count += cjk.length;

  // Count Latin/other words
  const latin = cleaned.replace(/[一-鿿㐀-䶿豈-﫿぀-ゟ゠-ヿ가-힯]/g, ' ');
  const words = latin.match(/\b\w+\b/g);
  if (words) count += words.length;

  return count;
}
