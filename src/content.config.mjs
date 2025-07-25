// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob, file, folder } from 'astro/loaders';
import { remoteCSVLoader } from '../loaders/remote_csv_loader'

// 3. Define your collection(s)
const members = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/members" }),
    schema: ({image}) => z.object({
        name: z.string(),
        pronouns: z.string(),
        photo: image(),
    }),
});

const specialEvents = defineCollection({
    loader: remoteCSVLoader({
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9lwK4u_pUe90Ff5o-2OpGSAjMv2gN-CQF1vTBbwfZgKFLYMuHhW8rjp4fsyhhL6R9ANYalYBQRjmh/pub?gid=548759105&single=true&output=csv',
    }),
    schema: () => z.object({
        'Name': z.optional(z.string()),
        'Description': z.optional(z.string()),
        'Date': z.optional(z.string()),
        'Image URL': z.optional(z.string()),
        'Image Description': z.optional(z.string()),
    })
})

const recurringEvents = defineCollection({
    loader: remoteCSVLoader({
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9lwK4u_pUe90Ff5o-2OpGSAjMv2gN-CQF1vTBbwfZgKFLYMuHhW8rjp4fsyhhL6R9ANYalYBQRjmh/pub?gid=0&single=true&output=csv'
    }),
    schema: () => z.object({
        'Name': z.optional(z.string()),
        'Description': z.optional(z.string()),
        'Date': z.optional(z.string()),
        'Image URL': z.optional(z.string()),
        'Image Description': z.optional(z.string()),
    })
})

const news = defineCollection({
    loader: remoteCSVLoader({
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9lwK4u_pUe90Ff5o-2OpGSAjMv2gN-CQF1vTBbwfZgKFLYMuHhW8rjp4fsyhhL6R9ANYalYBQRjmh/pub?gid=209937466&single=true&output=csv'
    }),
    schema: () => z.object({
        'Name': z.optional(z.string()),
        'Description': z.optional(z.string()),
        'Date': z.optional(z.string()),
        'Image URL': z.optional(z.string()),
        'Image Description': z.optional(z.string()),
        'Link URL': z.optional(z.string()),
    })
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { members, specialEvents, recurringEvents, news };

