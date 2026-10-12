import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { writingSchema, projectSchema, aboutSchema } from './lib/schema';
export const collections = {
 writing: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/writing' }), schema: writingSchema }),
 projects: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/projects' }), schema: projectSchema }),
 about: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/about' }), schema: aboutSchema }),
 fixtures: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/fixtures' }), schema: writingSchema }),
};
