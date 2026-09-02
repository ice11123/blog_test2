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
  save(post: AdminPostDraft): true;
  remove(id: string): true;
  hasLocal(post: AdminPostDraft | string): boolean;
  reset(): true;
}

export type DraftStorageOperation = 'save' | 'remove' | 'reset';

export class DraftStorageError extends Error {
  readonly operation: DraftStorageOperation;

  constructor(operation: DraftStorageOperation, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DraftStorageError';
    this.operation = operation;
  }
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

  save(post: AdminPostDraft): true {
    const posts = this.readLocalForMutation('save').filter(item => item.id !== post.id);
    posts.push(clonePost(post));
    this.write(posts, 'save');
    return true;
  }

  remove(id: string): true {
    this.write(this.readLocalForMutation('remove').filter(post => post.id !== id), 'remove');
    return true;
  }

  hasLocal(post: AdminPostDraft | string): boolean {
    const id = typeof post === 'string' ? post : post.id;
    const publishedPath = typeof post === 'string' ? undefined : post.publishedPath;
    return this.readLocal().some(item => item.id === id
      || Boolean(publishedPath && item.publishedPath === publishedPath));
  }

  reset(): true {
    if (!this.storage) throw unavailableStorageError('reset');
    try {
      this.storage.removeItem(ADMIN_DRAFTS_STORAGE_KEY);
      this.storage.removeItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
      if (this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) !== null
        || this.storage.getItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY) !== null) {
        throw new Error('存储未确认删除');
      }
      return true;
    } catch (cause) {
      throw new DraftStorageError('reset', '无法清除本地草稿存储', { cause });
    }
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

  private readLocalForMutation(operation: DraftStorageOperation): AdminPostDraft[] {
    if (!this.storage) throw unavailableStorageError(operation);
    try {
      this.migrateLegacy(true);
      const raw = this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY);
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new TypeError('草稿存储内容不是数组');
      }
      return parsed.filter(isAdminPostDraft).map(clonePost);
    } catch (cause) {
      if (cause instanceof DraftStorageError) throw cause;
      throw new DraftStorageError(operation, '无法读取现有本地草稿，已取消写入以避免覆盖数据', { cause });
    }
  }

  private migrateLegacy(throwOnFailure = false): void {
    if (!this.storage) return;
    try {
      if (this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) !== null) return;
      const raw = this.storage.getItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
      if (raw === null) return;
      const parsed = JSON.parse(raw);
      const migrated = migrateLegacyDrafts(this.initial, Array.isArray(parsed) ? parsed : []);
      const serialized = JSON.stringify(migrated);
      this.storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, serialized);
      if (this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) !== serialized) {
        throw new Error('迁移写入后校验失败');
      }
      this.storage.removeItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY);
    } catch (cause) {
      if (throwOnFailure) {
        throw new DraftStorageError('save', '无法迁移旧版草稿，已取消写入以避免覆盖数据', { cause });
      }
    }
  }

  private write(posts: AdminPostDraft[], operation: 'save' | 'remove'): void {
    if (!this.storage) throw unavailableStorageError(operation);
    try {
      const serialized = JSON.stringify(posts);
      this.storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, serialized);
      if (this.storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) !== serialized) {
        throw new Error('存储写入后校验失败');
      }
    } catch (cause) {
      throw new DraftStorageError(operation, '无法写入本地草稿存储', { cause });
    }
  }
}

function unavailableStorageError(operation: DraftStorageOperation): DraftStorageError {
  return new DraftStorageError(operation, '当前浏览器不提供可用的本地草稿存储');
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
