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
export default defineConfig({
  site: 'https://ice11123.github.io',
  base: '/blog_test2',
  outDir: './dist',

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
