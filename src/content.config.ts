import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({
		base: './src/content/blog',
		pattern: '**/*.{md,mdx}',
	}),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			author: z.string().trim().min(1).optional(),
			sourceUrl: z.url().refine((value) => value.startsWith('https://github.com/'), '源地址须为 GitHub HTTPS 链接').optional(),
			heroImage: z.optional(image()),

			dir1: z.string().optional(), // 一级目录
			dir2: z.string().optional(), // 二级目录
			tags: z.array(z.string()).default([]), // 标签
		}),
});

export const collections = { blog };
