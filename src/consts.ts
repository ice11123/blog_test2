export const SITE_TITLE = '离子怪的博客';
export const SITE_DESCRIPTION = '记录学习、技术与思考的个人博客。';
export const SITE_AUTHOR = '离子怪';
export const SITE_START_DATE = new Date('2026-08-11');

export const GITHUB_USERNAME = 'ice11123';
export const GITHUB_URL = 'https://github.com/ice11123';
export const BILIBILI_URL = 'https://www.bilibili.com/video/BV1GJ411x7h7/?spm_id_from=333.337.search-card.all.click';
export const SITE_URL = 'https://ice11123.github.io/blog_test2/';

// 前端原型密码门槛：这里只保存 SHA-256 哈希，不要提交真实密码。
// 请在本地生成哈希后替换此占位符；该机制不能替代服务端认证。
export const ADMIN_PASSWORD_HASH = '7e54a220c203783d049a2769a84ae09d716d288d54a8369a6691bbba84b9e052';
export const ADMIN_UNLOCK_STORAGE_KEY = 'blog-test2-admin-unlocked';
export const ADMIN_SYNC_API_URL = '';
export const CLOUD_PUBLISH_ENABLED = false;
export const TARGET_REPOSITORY = 'ice11123/blog_test2';

// 留空时按文章目录名称自动排序；需要固定顺序时可在这里追加名称。
export const DIR1_ORDER: string[] = [];
export const DIR2_ORDER: Record<string, string[]> = {};

export const VALID_THEMES = ['light', 'dark'] as const;
export const DEFAULT_DARK_THEME = 'dark';
export const DEFAULT_LIGHT_THEME = 'light';
export const THEME_STORAGE_KEY = 'blog-test2-theme';

export const EXT_MAP: Record<string, { name: string; color: string }> = {
  '.ts': { name: 'TypeScript', color: '#3178c6' },
  '.tsx': { name: 'TypeScript', color: '#3178c6' },
  '.js': { name: 'JavaScript', color: '#f1e05a' },
  '.jsx': { name: 'JavaScript', color: '#f1e05a' },
  '.mjs': { name: 'JavaScript', color: '#f1e05a' },
  '.astro': { name: 'Astro', color: '#ff5a03' },
  '.md': { name: 'Markdown', color: '#083fa1' },
  '.mdx': { name: 'MDX', color: '#fcb32c' },
  '.css': { name: 'CSS', color: '#563d7c' },
  '.scss': { name: 'SCSS', color: '#c6538c' },
  '.json': { name: 'JSON', color: '#292929' },
  '.yaml': { name: 'YAML', color: '#cb171e' },
  '.yml': { name: 'YAML', color: '#cb171e' },
  '.html': { name: 'HTML', color: '#e34c26' },
  '.svg': { name: 'SVG', color: '#ff9900' },
  '.sh': { name: 'Shell', color: '#89e051' },
  '.bash': { name: 'Shell', color: '#89e051' },
  '.py': { name: 'Python', color: '#3572a5' },
  '.toml': { name: 'TOML', color: '#9c4221' },
  '.xml': { name: 'XML', color: '#0060ac' },
  '.sql': { name: 'SQL', color: '#e38c00' },
};

export const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.zip', '.gz', '.tar', '.mp4', '.mp3',
  '.lock',
]);

export const SKIP_FILES = new Set([
  'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb',
]);

export function fmtNum(value: number): string {
  return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value);
}
