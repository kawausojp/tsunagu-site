import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const companies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/companies' }),
  schema: z.object({
    name: z.string(),
    nameJa: z.string().optional(),   // 繁中化寫法的品牌名（麵屋 豬一）在 ja/en 頁需要各自表記
    nameEn: z.string().optional(),
    corporateName: z.string().optional(),
    category: z.enum(['apparel','jewelry','kimono','bag','shoes','hat','eyewear','socks','food','goods','group','other']),
    categoryLabel: z.string(),
    categoryLabelJa: z.string().optional(),
    categoryLabelEn: z.string().optional(),
    areas: z.array(z.enum(['tokyo','osaka','kyoto','fukuoka','kobe','hokkaido'])),
    jlpt: z.enum(['N1','N2','N3']).nullable().default(null),
    placements: z.number().int().nonnegative().default(0),
    fullTimeConverted: z.number().int().nonnegative().default(0),
    onlineInterview: z.boolean().default(false),
    tagline: z.string(),
    taglineJa: z.string().optional(),
    taglineEn: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    sourceSlide: z.number().int().positive().optional(),
  }).strict().refine(d => d.fullTimeConverted <= d.placements, { message: 'fullTimeConverted 不能大於 placements' }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    name: z.string(),
    visa: z.enum(['打工度假', '留學', '留學生', '交換留學', '打工度假 → 工作簽證']),   // 新值要同步 site.ts VISA_LABEL，否則 ja/en 會露繁中
    started: z.string().regex(/^\d{4}\.\d{2}$/),       // 2025.06
    company: z.string(),
    location: z.string(),
    lead: z.string(),          // 開場那句
    messages: z.array(z.string()).default([]),
    advice: z.array(z.string()).default([]),
    igCode: z.string().regex(/^[A-Za-z0-9_-]{10,12}$/),   // IG 貼文 shortcode，用來回連原文
    igPosted: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // ISO 日期
    order: z.number().int().default(99),
  }).strict(),
});

export const collections = { companies, stories };
