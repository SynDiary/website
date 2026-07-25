import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    // Extra maintenance frontmatter so pages can be audited against the real app.
    // These are informational — surface them in review, not necessarily on-page.
    schema: docsSchema({
      extend: z.object({
        // Editorial state of the page.
        status: z.enum(['draft', 'in-review', 'published']).default('draft'),
        // Which platforms the page's guidance applies to.
        platforms: z.array(z.enum(['ios', 'android'])).optional(),
        // App version/build the content was written/verified against.
        appliesTo: z.string().optional(),
        // ISO date (YYYY-MM-DD) the content was last checked against the real app.
        // Validated as a date string without converting to a Date (avoids
        // timezone/serialization quirks in content collections).
        lastVerified: z.string().date().optional(),
        // Who owns keeping this page accurate.
        owner: z.string().optional(),
      }),
    }),
  }),
};
