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

// 前輩分享（2026-10-25 網誌化改版）：內文一律是 IG 貼文原文，一字不改（紅線 #1）。
// 段落＝IG 原文以空行分段，段內的手動換行保留（\n）。title／pull 是文章頁的標題與大字引言，
// 必須是原文的子字串——build 時在這裡驗證，改寫過的句子進不來。
const para = z.array(z.string().min(1)).default([]);
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    name: z.string(),
    visa: z.enum(['打工度假', '留學', '留學生', '交換留學', '打工度假 → 工作簽證']),   // 新值要同步 site.ts VISA_LABEL，否則 ja 會露繁中
    started: z.string().regex(/^\d{4}\.\d{2}$/),       // 2025.06
    company: z.string(),          // 品牌名（實績總表與「同品牌前輩」用）
    companyNote: z.string().optional(),   // IG 原文工作地點後的括號說明，例：誕生於日本的流行珠寶品牌
    location: z.string(),
    title: z.string(),            // messages 的子字串
    pull: z.string().optional(),  // messages／advice 的子字串
    messages: para,
    advice: para,
    titleJa: z.string().optional(),
    messagesJa: para,             // IG「〜メッセージ日本語〜」原文（Tsunagu 撰寫的日文版）
    jaExcerpt: z.boolean().default(true),   // 日文段標了「抜粋」
    igCode: z.string().regex(/^[A-Za-z0-9_-]{10,12}$/),
    igPosted: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).strict().superRefine((d, ctx) => {
    const need = (s: string | undefined, hay: string[], path: string) => {
      if (s && !hay.some(p => p.includes(s))) ctx.addIssue({ code: 'custom', path: [path], message: `${path} 必須是 IG 原文同一段裡的子字串（紅線 #1）` });
    };
    need(d.title, d.messages, 'title');
    need(d.pull, [...d.messages, ...d.advice], 'pull');
    need(d.titleJa, d.messagesJa, 'titleJa');
    if (d.titleJa && !d.messagesJa.length) ctx.addIssue({ code: 'custom', path: ['titleJa'], message: '有日文標題就要有日文原文' });
  }),
});

export const collections = { companies, stories };
