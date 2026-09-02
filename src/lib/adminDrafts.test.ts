import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_DRAFTS_STORAGE_KEY,
  LEGACY_ADMIN_DRAFTS_STORAGE_KEY,
  DraftStorageError,
  LocalStorageDraftStore,
  draftToMarkdown,
  type AdminPostDraft,
  type DraftStorage,
} from './adminDrafts.ts';

class MemoryStorage implements DraftStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

class FailingStorage extends MemoryStorage {
  failWrites = false;
  failRemovals = false;

  override setItem(key: string, value: string): void {
    if (this.failWrites) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    super.setItem(key, value);
  }

  override removeItem(key: string): void {
    if (this.failRemovals) throw new Error('storage disabled');
    super.removeItem(key);
  }
}

class IgnoringWriteStorage extends MemoryStorage {
  override setItem(): void {}
}

function post(id: string, title: string, published = true): AdminPostDraft {
  return {
    id,
    title,
    description: `${title}描述`,
    pubDate: '2026-08-21',
    dir1: '测试',
    dir2: '',
    tags: [],
    body: `# ${title}`,
    format: 'mdx',
    ...(published ? { publishedPath: `src/content/blog/${id}.mdx` } : {}),
  };
}

test('只持久化实际编辑项，未编辑文章继续采用新的仓库版本', () => {
  const storage = new MemoryStorage();
  const initial = [post('a', '文章 A'), post('b', '文章 B')];
  const store = new LocalStorageDraftStore(initial, storage);
  store.save({ ...initial[0], title: '文章 A 本地修改', localEditedAt: '2026-08-21T10:00:00Z' });

  const persisted = JSON.parse(storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) || '[]');
  assert.deepEqual(persisted.map((item: AdminPostDraft) => item.id), ['a']);

  const refreshed = new LocalStorageDraftStore(
    [post('a', '文章 A 仓库更新'), post('b', '文章 B 仓库更新')],
    storage,
  ).list();
  assert.equal(refreshed.find(item => item.id === 'a')?.title, '文章 A 本地修改');
  assert.equal(refreshed.find(item => item.id === 'b')?.title, '文章 B 仓库更新');
});

test('放弃正式文章的本地修改后恢复仓库版本', () => {
  const storage = new MemoryStorage();
  const initial = [post('a', '仓库版本')];
  const store = new LocalStorageDraftStore(initial, storage);
  store.save({ ...initial[0], title: '本地版本', localEditedAt: '2026-08-21T10:00:00Z' });
  assert.equal(store.hasLocal(initial[0]), true);

  store.remove('a');
  assert.equal(store.hasLocal(initial[0]), false);
  assert.equal(store.list()[0].title, '仓库版本');
});

test('本地新草稿可以保存和删除', () => {
  const storage = new MemoryStorage();
  const store = new LocalStorageDraftStore([], storage);
  const local = post('draft/local', '本地草稿', false);
  store.save(local);
  assert.deepEqual(store.list().map(item => item.id), ['draft/local']);
  store.remove(local.id);
  assert.deepEqual(store.list(), []);
});

test('v1 迁移丢弃未修改快照并保留真实本地改动', () => {
  const storage = new MemoryStorage();
  const initial = [post('a', '文章 A'), post('b', '文章 B')];
  storage.setItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY, JSON.stringify([
    initial[0],
    { ...initial[1], title: '文章 B 本地修改', localEditedAt: '2026-08-21T10:00:00Z' },
    post('draft/local', '本地草稿', false),
  ]));

  const store = new LocalStorageDraftStore(initial, storage);
  const listed = store.list();
  const migrated = JSON.parse(storage.getItem(ADMIN_DRAFTS_STORAGE_KEY) || '[]');
  assert.deepEqual(migrated.map((item: AdminPostDraft) => item.id), ['b', 'draft/local']);
  assert.equal(listed.find(item => item.id === 'a')?.title, '文章 A');
  assert.equal(listed.find(item => item.id === 'b')?.title, '文章 B 本地修改');
  assert.equal(storage.getItem(LEGACY_ADMIN_DRAFTS_STORAGE_KEY), null);
});

test('导出 Markdown 时 frontmatter 与正文之间保留空行', () => {
  assert.match(draftToMarkdown(post('draft/local', '导出文章', false)), /---\n\n# 导出文章\n$/);
});

test('草稿写入失败时抛出可识别错误且不会伪造持久化结果', () => {
  const storage = new FailingStorage();
  const store = new LocalStorageDraftStore([post('a', '仓库版本')], storage);
  storage.failWrites = true;

  assert.throws(
    () => store.save({ ...post('a', '本地修改'), localEditedAt: '2026-09-02T10:00:00Z' }),
    (error) => error instanceof DraftStorageError && error.operation === 'save',
  );
  assert.equal(storage.getItem(ADMIN_DRAFTS_STORAGE_KEY), null);
  assert.equal(store.list()[0].title, '仓库版本');
});

test('存储静默忽略写入时由读回校验识别失败', () => {
  const storage = new IgnoringWriteStorage();
  const store = new LocalStorageDraftStore([], storage);

  assert.throws(
    () => store.save(post('draft/local', '本地草稿', false)),
    (error) => error instanceof DraftStorageError && error.operation === 'save',
  );
  assert.equal(storage.getItem(ADMIN_DRAFTS_STORAGE_KEY), null);
});

test('损坏的现有草稿会阻止覆盖写入', () => {
  const storage = new MemoryStorage();
  storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, '{broken');
  const store = new LocalStorageDraftStore([], storage);

  assert.throws(
    () => store.save(post('draft/local', '本地草稿', false)),
    (error) => error instanceof DraftStorageError && /取消写入/.test(error.message),
  );
  assert.equal(storage.getItem(ADMIN_DRAFTS_STORAGE_KEY), '{broken');
});

test('清空草稿失败时不会报告成功', () => {
  const storage = new FailingStorage();
  storage.setItem(ADMIN_DRAFTS_STORAGE_KEY, '[]');
  storage.failRemovals = true;
  const store = new LocalStorageDraftStore([], storage);

  assert.throws(
    () => store.reset(),
    (error) => error instanceof DraftStorageError && error.operation === 'reset',
  );
});
