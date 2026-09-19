import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDefinitionList, { defListHastHandlers } from 'remark-definition-list';
import rehypeKatex from 'rehype-katex';
import expressiveCode from 'astro-expressive-code';

import tailwindcss from '@tailwindcss/vite';

import remarkEmoji from 'remark-emoji';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remarkMark } from 'remark-mark-highlight';
import { unified } from '@astrojs/markdown-remark';

import compress from 'astro-compress';
import { remarkMermaid } from './src/plugins/remark-mermaid';
import { remarkGithubAlerts } from './src/plugins/remark-github-alerts';
import { remarkSubSuper } from './src/plugins/remark-sub-super';

const publicBaseUrl = 'https://ice11123.github.io/blog_test2';
const tiCarArticleSlugs = [
  '01-ti-car-start',
  '02-system-architecture',
  '03-first-motor-run',
  '04-software-architecture',
  '05-motor-execution-chain',
  '06-encoder-motion-metrics',
  '07-speed-position-control',
  '08-line-tracking-system',
  '09-observability-and-hmi',
  '10-integration-and-delivery',
];

const tiCarRedirects = Object.fromEntries(tiCarArticleSlugs.map((slug) => [
  `/blog/小车组/ti小车实战/${slug}`,
  `${publicBaseUrl}/blog/电控/ti小车实战/${slug}/`,
]));

export default defineConfig({
  site: 'https://ice11123.github.io',
  base: '/blog_test2',
  outDir: './dist',
  redirects: {
    ...tiCarRedirects,
    '/blog/category/小车组': `${publicBaseUrl}/blog/category/电控/`,
    '/blog/category/小车组/TI小车实战': `${publicBaseUrl}/blog/category/电控/TI小车实战/`,
  },

  integrations: [
    expressiveCode(),
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/admin/'),
    }),
    compress({
      HTML: {
        'html-minifier-terser': {
          conservativeCollapse: true,
        },
      },
    }),
  ],

  markdown: {
    processor: unified({
      remarkPlugins: [
        [remarkGfm, { singleTilde: false }],
        remarkDefinitionList,
        remarkEmoji,
        remarkMath,
        remarkMark,
        remarkSubSuper,
        remarkGithubAlerts,
        remarkMermaid,
      ],
      rehypePlugins: [
        [rehypeKatex, { output: 'html' }],
        rehypeSlug,
        rehypeAutolinkHeadings,
      ],
      remarkRehype: {
        handlers: defListHastHandlers,
      },
    }),
    syntaxHighlight: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
