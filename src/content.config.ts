import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const companies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/companies' }),
  schema: z.object({
    name: z.string(),
    corporateName: z.string().optional(),
    category: z.enum(['apparel','jewelry','kimono','bag','shoes','hat','eyewear','socks','food','goods','group','other']),
    categoryLabel: z.string(),
    categoryLabelJa: z.string().optional(),
    categoryLabelEn: z.string().optional(),
    areas: z.array(z.enum(['tokyo','osaka','kyoto','fukuoka','kobe','hokkaido'])),
    jlpt: z.enum(['N1','N2','N3']).nullable().default(null),
    placements: z.number().default(0),
    fullTimeConverted: z.number().default(0),
    onlineInterview: z.boolean().default(false),
    tagline: z.string(),
    taglineJa: z.string().optional(),
    taglineEn: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    sourceSlide: z.number().optional(),
    verified: z.boolean().default(false),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    name: z.string(),
    visa: z.string(),          // 打工度假 / 留學 / 交換留學 / 正職
    started: z.string(),       // 2025.06
    company: z.string(),
    location: z.string(),
    lead: z.string(),          // 開場那句
    messages: z.array(z.string()).default([]),
    advice: z.array(z.string()).default([]),
    igCode: z.string(),        // IG 貼文 shortcode，用來回連原文
    igPosted: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { companies, stories };
