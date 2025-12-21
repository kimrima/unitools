import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";

const supportedLocales = ['en', 'ko'];

const pdfTools = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf',
  'pdf-to-png', 'png-to-pdf', 'pdf-to-word', 'word-to-pdf', 'pdf-to-excel',
  'excel-to-pdf', 'pdf-to-ppt', 'ppt-to-pdf', 'rotate-pdf', 'delete-pdf-pages',
  'extract-pdf-pages', 'organize-pdf', 'protect-pdf', 'unlock-pdf', 'sign-pdf',
  'watermark-pdf', 'edit-pdf', 'ocr-pdf', 'repair-pdf', 'optimize-pdf',
  'pdf-to-text', 'html-to-pdf', 'add-page-numbers', 'crop-pdf', 'grayscale-pdf',
  'resize-pdf', 'n-up-pdf',
];

const imageConvertTools = ['png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'convert-image'];
const imageEditTools = ['resize-image', 'crop-image', 'compress-image'];
const videoAudioTools = ['video-to-gif'];
const developerTools = ['json-formatter', 'base64-encode', 'hash-generator'];
const calculatorTools = ['unit-converter', 'percentage-calculator'];

const allToolIds = [
  ...pdfTools,
  ...imageConvertTools,
  ...imageEditTools,
  ...videoAudioTools,
  ...developerTools,
  ...calculatorTools,
];

const categories = ['pdf', 'imageConvert', 'imageEdit', 'videoAudio', 'text', 'social', 'developer', 'calculator'];

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = process.env.SITE_URL || 'https://unitools.app';
    const lastmod = new Date().toISOString().split('T')[0];

    const urls: string[] = [];

    supportedLocales.forEach((locale) => {
      urls.push(`
    <url>
      <loc>${baseUrl}/${locale}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
      ${supportedLocales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}"/>`).join('\n      ')}
      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en"/>
    </url>`);
    });

    allToolIds.forEach((toolId) => {
      supportedLocales.forEach((locale) => {
        urls.push(`
    <url>
      <loc>${baseUrl}/${locale}/${toolId}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
      ${supportedLocales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}/${toolId}"/>`).join('\n      ')}
      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/${toolId}"/>
    </url>`);
      });
    });

    categories.forEach((category) => {
      supportedLocales.forEach((locale) => {
        urls.push(`
    <url>
      <loc>${baseUrl}/${locale}/category/${category}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
      ${supportedLocales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}/category/${category}"/>`).join('\n      ')}
      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/category/${category}"/>
    </url>`);
      });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    const baseUrl = process.env.SITE_URL || 'https://unitools.app';
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  app.get('/api/tools', (_req: Request, res: Response) => {
    res.json({ tools: allToolIds, categories });
  });
}
