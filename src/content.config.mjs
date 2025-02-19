// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file, folder } from 'astro/loaders';

// 3. Define your collection(s)
const members = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/members" }),
    schema: ({image}) => z.object({
        name: z.string(),
        photo: image(),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { members };