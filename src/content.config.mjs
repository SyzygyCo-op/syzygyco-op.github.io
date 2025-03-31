// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file, folder } from 'astro/loaders';

// 3. Define your collection(s)
const members = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/members" }),
    schema: ({image}) => z.object({
        name: z.string(),
        photo: image(),
    }),
});

const news = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/news" }),
    schema: ({image}) => z.object({
        publisher: z.string(),
        author: z.string(),
        title: z.string(),
        url: z.string(),
        image: image(),
        imageAlt: z.string()
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { members, news };
