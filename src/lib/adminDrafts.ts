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

export const ADMIN_DRAFTS_STORAGE_KEY = 'blog-test2-admin-drafts-v2';
export const LEGACY_ADMIN_DRAFTS_STORAGE_KEY = 'blog-test2-admin-drafts-v1';

export interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DraftStore {
  list(): AdminPostDraft[];
  save(post: AdminPostDraft): void;
  remove(id: string): void;
  hasLocal(post: AdminPostDraft | string): boolean;
  reset(): void;
}

function clonePost(post: AdminPostDraft): AdminPostDraft {
  return { ...post, tags: [...post.tags] };
}

export class LocalStorageDraftStore implements DraftStore {
  private readonly initial: AdminPostDraft[];
  private readonly storage: DraftStorage | null;

  constructor(initial: AdminPostDraft[], storage: DraftStorage | null = browserStorage()) {
    this.initial = initial.map(clonePost);
    this.storage = storage;
  }

  list(): AdminPostDraft[] {
    return mergeDrafts(this.initial, this.readLocal());
  }

  save(post: AdminPostDraft): void {
    const posts = this.readLocal().filter(item => item.id !== post.id);
    posts.push(clonePost(post));
    this.write(posts);
  }

  remove(id: string): void {
    this.write(this.readLocal().filter(post => post.id !== id));
  }

  hasLocal(post: AdminPostDraft | string): boolean {
    const id = typeof post === 'string' ? post : post.id;
    const publishedPath = typeof post === 'string' ? undefined : post.publishedPath;
    return this.readLocal().some(item => item.id === id
      || Boolean(publishedPath && item.publishedPath === publishedPath));
  }

  reset(): void {
    if (!this.storage) return;
    try {
      this.storage.removeItem(ADMIN_DRAFTS_STORAGE_KEY);
      this.storage.removeItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
    } catch {}
  }

  private readLocal(): AdminPostDraft[] {
    if (!this.storage) return [];
    this.migrateLegacy();
    try {
      const parsed = JSON.parse(this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(isAdminPostDraft).map(clonePost) : [];
    } catch {
      return [];
    }
  }

  private migrateLegacy(): void {
    if (!this.storage) return;
    try {
      if (this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) !== null) return;
      const raw = this.storage.getItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
      if (raw === null) return;
      const parsed = JSON.parse(raw);
      const migrated = migrateLegacyDrafts(this.initial, Array.isArray(parsed) ? parsed : []);
      this.storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, JSON.stringify(migrated));
      this.storage.removeItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
    } catch {}
  }

  private write(posts: AdminPostDraft[]): void {
    if (!this.storage) return;
    try { this.storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, JSON.stringify(posts)); } catch {}
  }
}

export function mergeDrafts(initial: AdminPostDraft[], local: AdminPostDraft[]): AdminPostDraft[] {
  const initialCopies = initial.map(clonePost);
  const localCopies = local.filter(isAdminPostDraft).map(clonePost);
  const initialIds = new Set(initialCopies.map(post => post.id));
  const initialPaths = new Set(initialCopies.map(post => post.publishedPath).filter(Boolean));
  const merged = initialCopies.map(post => {
    const override = localCopies.find(item => item.id === post.id
      || Boolean(item.publishedPath && item.publishedPath === post.publishedPath));
    return override
      ? clonePost({ ...post, ...override, orphaned: false, repositoryPending: false })
      : post;
  });

  for (const post of localCopies) {
    if (initialIds.has(post.id) || (post.publishedPath && initialPaths.has(post.publishedPath))) continue;
    if (post.deleted) continue;
    merged.push({ ...post, orphaned: Boolean(post.publishedPath) && !post.repositoryPending });
  }
  return merged;
}

export function migrateLegacyDrafts(initial: AdminPostDraft[], legacy: unknown[]): AdminPostDraft[] {
  const initialIds = new Set(initial.map(post => post.id));
  const initialPaths = new Set(initial.map(post => post.publishedPath).filter(Boolean));
  return legacy
    .filter(isAdminPostDraft)
    .filter(post => {
      const repositoryBacked = initialIds.has(post.id)
        || Boolean(post.publishedPath && initialPaths.has(post.publishedPath));
      return !repositoryBacked || Boolean(post.localEditedAt || post.repositoryPending || post.deleted);
    })
    .map(clonePost);
}

function browserStorage(): DraftStorage | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
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
  return `${frontmatter}\n${post.body.replace(/^\s+|\s+$/g, '')}\n`;
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}
