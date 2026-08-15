export interface AdminPostDraft {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  dir1: string;
  dir2: string;
  tags: string[];
  body: string;
  format: 'md' | 'mdx';
  deleted?: boolean;
  localEditedAt?: string;
  publishedPath?: string;
  orphaned?: boolean;
  repositoryPending?: boolean;
}

export const ADMIN_DRAFTS_STORAGE_KEY = 'blog-test2-admin-drafts-v1';

export interface DraftStore {
  list(): AdminPostDraft[];
  save(post: AdminPostDraft): void;
  remove(id: string): void;
  reset(): void;
}

function clonePost(post: AdminPostDraft): AdminPostDraft {
  return { ...post, tags: [...post.tags] };
}

export class LocalStorageDraftStore implements DraftStore {
  private readonly initial: AdminPostDraft[];

  constructor(initial: AdminPostDraft[]) {
    this.initial = initial.map(clonePost);
  }

  list(): AdminPostDraft[] {
    if (typeof window === 'undefined') return this.initial.map(clonePost);
    try {
      const raw = window.localStorage.getItem(ADMIN_DRAFTS_STORAGE_KEY);
      if (!raw) return this.initial.map(clonePost);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return this.initial.map(clonePost);
      return parsed.filter(isAdminPostDraft).map(clonePost);
    } catch {
      return this.initial.map(clonePost);
    }
  }

  save(post: AdminPostDraft): void {
    const posts = this.list().filter(item => item.id !== post.id);
    posts.push(clonePost(post));
    this.write(posts);
  }

  remove(id: string): void {
    this.write(this.list().filter(post => post.id !== id));
  }

  reset(): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(ADMIN_DRAFTS_STORAGE_KEY); } catch {}
  }

  private write(posts: AdminPostDraft[]): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(ADMIN_DRAFTS_STORAGE_KEY, JSON.stringify(posts)); } catch {}
  }
}

function isAdminPostDraft(value: unknown): value is AdminPostDraft {
  if (!value || typeof value !== 'object') return false;
  const post = value as Partial<AdminPostDraft>;
  return typeof post.id === 'string'
    && typeof post.title === 'string'
    && typeof post.description === 'string'
    && typeof post.pubDate === 'string'
    && typeof post.dir1 === 'string'
    && typeof post.dir2 === 'string'
    && Array.isArray(post.tags)
    && post.tags.every(tag => typeof tag === 'string')
    && typeof post.body === 'string'
    && (post.format === 'md' || post.format === 'mdx');
}

export function slugifyAdminId(title: string): string {
  const slug = title.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return `draft/${slug || 'untitled'}-${Date.now()}`;
}

export function draftToMarkdown(post: AdminPostDraft): string {
  const frontmatter = [
    '---',
    `title: ${yamlQuote(post.title)}`,
    `description: ${yamlQuote(post.description)}`,
    `pubDate: ${post.pubDate || new Date().toISOString().slice(0, 10)}`,
    ...(post.updatedDate ? [`updatedDate: ${post.updatedDate}`] : []),
    ...(post.dir1 ? [`dir1: ${yamlQuote(post.dir1)}`] : []),
    ...(post.dir2 ? [`dir2: ${yamlQuote(post.dir2)}`] : []),
    `tags: [${post.tags.map(yamlQuote).join(', ')}]`,
    '---',
    '',
  ].join('\n');
  return `${frontmatter}${post.body.replace(/^\s+|\s+$/g, '')}\n`;
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}
