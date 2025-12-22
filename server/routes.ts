import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { randomBytes, createHash } from "crypto";

const supportedLocales = ['en', 'ko', 'ja', 'es', 'fr'];

const allToolIds = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-png', 'png-to-pdf',
  'pdf-to-word', 'word-to-pdf', 'pdf-to-excel', 'excel-to-pdf', 'pdf-to-ppt', 'ppt-to-pdf',
  'rotate-pdf', 'delete-pdf-pages', 'extract-pdf-pages', 'organize-pdf', 'sign-pdf',
  'watermark-pdf', 'edit-pdf', 'ocr-pdf', 'repair-pdf', 'optimize-pdf', 'pdf-to-text',
  'html-to-pdf', 'add-page-numbers', 'crop-pdf', 'grayscale-pdf', 'resize-pdf', 'n-up-pdf',
  'jpg-to-png', 'png-to-jpg', 'heic-to-jpg', 'webp-converter', 'svg-to-png', 'convert-image',
  'bulk-convert-image', 'webp-to-jpg', 'webp-to-png', 'gif-to-png',
  'compress-image', 'resize-image', 'crop-image', 'rotate-image', 'flip-image', 'image-upscaler',
  'canvas-size', 'remove-background', 'image-mosaic', 'image-watermark', 'image-brightness',
  'grayscale-filter', 'image-text', 'remove-exif', 'round-corners', 'image-shadow', 'color-picker',
  'image-joiner', 'create-gif', 'image-border', 'image-opacity', 'image-ratio', 'favicon-generator',
  'video-to-gif', 'trim-video', 'mute-video', 'extract-audio', 'video-speed', 'video-capture',
  'convert-video', 'resize-video', 'compress-video', 'flip-video', 'trim-audio', 'join-audio',
  'convert-audio', 'boost-audio', 'reverse-audio', 'audio-bitrate', 'audio-visualizer',
  'video-metadata', 'voice-recorder', 'screen-recorder',
  'image-ocr', 'pdf-text-extract', 'character-count', 'case-converter', 'line-break-remover',
  'remove-duplicates', 'text-sort', 'find-replace', 'blank-line-remover', 'prefix-suffix',
  'csv-to-json', 'json-to-csv', 'xml-to-json', 'yaml-to-json', 'text-to-list', 'dummy-generator',
  'lorem-ipsum', 'markdown-preview', 'regex-tester', 'url-encode', 'base64-text', 'html-entity',
  'diff-checker', 'word-frequency', 'text-shuffle', 'binary-converter', 'web-text-extract',
  'instagram-line-break', 'hashtag-generator', 'instagram-font', 'tiktok-safe-zone', 'instagram-grid',
  'youtube-thumbnail', 'youtube-tags', 'youtube-channel-id', 'video-title-length', 'qr-code-generator',
  'barcode-generator', 'url-shortener', 'utm-builder', 'ad-banner-guide', 'logo-generator',
  'email-signature', 'random-picker', 'fake-profile', 'kaomoji-collection', 'timezone-converter',
  'sha256-hash', 'md5-hash', 'aes-encryption', 'base64-encode', 'bcrypt-generator', 'html-minifier',
  'css-minifier', 'js-minifier', 'sql-formatter', 'json-formatter', 'jwt-decoder', 'uuid-generator',
  'password-generator', 'cron-generator', 'epoch-converter', 'ipv4-to-ipv6', 'what-is-my-ip',
  'user-agent', 'http-header-analyzer', 'redirect-checker', 'speed-test', 'color-converter',
  'color-contrast', 'screen-resolution',
  'percentage-calculator', 'sales-tax-calculator', 'compound-interest', 'currency-converter',
  'discount-calculator', 'tip-calculator', 'salary-converter', 'metric-imperial', 'temperature-converter',
  'speed-converter', 'area-converter', 'volume-converter', 'age-calculator', 'date-calculator',
  'days-counter', 'bmi-calculator', 'bmr-calculator', 'pregnancy-calculator', 'sleep-calculator',
  'gpa-calculator', 'scientific-calculator', 'probability-calculator',
  'fancy-text', 'morse-code', 'binary-text', 'zalgo-text', 'random-choice', 'wheel-of-fortune',
  'dice-roller', 'coin-flipper', 'random-number', 'random-name', 'drawing-pad', 'white-noise',
  'metronome', 'morse-flasher',
];

const categories = ['pdf', 'imageConvert', 'imageEdit', 'videoAudio', 'text', 'social', 'developer', 'calculator', 'misc'];

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token || req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = await storage.getAdminSession(token);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }
  
  (req as any).adminId = session.adminId;
  next();
}

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = process.env.SITE_URL || 'https://unitools.store';
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
    const baseUrl = process.env.SITE_URL || 'https://unitools.store';
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /자리관

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  app.get('/ads.txt', (_req: Request, res: Response) => {
    const adsTxt = `google.com, pub-2706292385168262, DIRECT, f08c47fec0942fa0`;
    res.header('Content-Type', 'text/plain');
    res.send(adsTxt);
  });

  app.get('/api/tools', (_req: Request, res: Response) => {
    res.json({ tools: allToolIds, categories });
  });

  app.post('/api/events/tool-usage', async (req: Request, res: Response) => {
    try {
      const { toolId, locale } = req.body;
      if (!toolId) {
        return res.status(400).json({ error: 'toolId required' });
      }
      
      const countryCode = req.headers['cf-ipcountry'] as string || 
                          req.headers['x-vercel-ip-country'] as string || 
                          null;
      
      const sessionId = req.cookies?.session_id || randomBytes(16).toString('hex');
      
      await storage.logToolUsage({
        toolId,
        locale: locale || 'en',
        countryCode,
        sessionId,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error logging tool usage:', error);
      res.status(500).json({ error: 'Failed to log usage' });
    }
  });

  app.post('/api/feature-vote', async (req: Request, res: Response) => {
    try {
      const { toolId, locale } = req.body;
      if (!toolId) {
        return res.status(400).json({ error: 'toolId required' });
      }
      
      const sessionId = req.cookies?.session_id || randomBytes(16).toString('hex');
      
      await storage.createFeatureVote({
        toolId,
        locale: locale || 'en',
        sessionId,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating feature vote:', error);
      res.status(500).json({ error: 'Failed to create vote' });
    }
  });

  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password required' });
      }
      
      const envPassword = process.env.ADMIN_PASSWORD;
      
      if (!envPassword) {
        return res.status(500).json({ error: 'Admin password not configured' });
      }
      
      if (password !== envPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      const adminUsername = 'admin';
      let admin = await storage.getAdminByUsername(adminUsername);
      
      if (!admin) {
        admin = await storage.createAdmin({
          username: adminUsername,
          passwordHash: hashPassword(envPassword),
        });
      }
      
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await storage.createAdminSession(admin.id, token, expiresAt);
      await storage.updateAdminLastLogin(admin.id);
      
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.json({ success: true, username: admin.username });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/admin/logout', async (req: Request, res: Response) => {
    const token = req.cookies?.admin_token;
    if (token) {
      await storage.deleteAdminSession(token);
    }
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  app.get('/api/admin/check', async (req: Request, res: Response) => {
    const token = req.cookies?.admin_token;
    if (!token) {
      return res.json({ authenticated: false });
    }
    
    const session = await storage.getAdminSession(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.json({ authenticated: false });
    }
    
    res.json({ authenticated: true });
  });

  app.get('/api/admin/overview', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const [todayUsage, topTools, countryStats] = await Promise.all([
        storage.getTotalUsageToday(),
        storage.getTopTools(5),
        storage.getCountryStats(),
      ]);
      
      res.json({
        todayUsage,
        topTools,
        countryStats: countryStats.slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching overview:', error);
      res.status(500).json({ error: 'Failed to fetch overview' });
    }
  });

  app.get('/api/admin/tools', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const [toolSettingsList, usageStats] = await Promise.all([
        storage.getAllToolSettings(),
        storage.getToolUsageStats(),
      ]);
      
      const settingsMap = new Map(toolSettingsList.map(s => [s.toolId, s]));
      const usageMap = new Map(usageStats.map(u => [u.toolId, u.count]));
      
      const tools = allToolIds.map(toolId => ({
        toolId,
        isActive: settingsMap.get(toolId)?.isActive ?? true,
        usageCount: usageMap.get(toolId) || 0,
      }));
      
      res.json({ tools });
    } catch (error) {
      console.error('Error fetching tools:', error);
      res.status(500).json({ error: 'Failed to fetch tools' });
    }
  });

  app.patch('/api/admin/tools/:toolId', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { toolId } = req.params;
      const { isActive, spotlightRank } = req.body;
      
      const settings = await storage.upsertToolSettings({
        toolId,
        isActive: isActive ?? true,
        spotlightRank: spotlightRank ?? null,
      });
      
      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error updating tool settings:', error);
      res.status(500).json({ error: 'Failed to update tool' });
    }
  });

  app.get('/api/admin/feature-votes', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const votes = await storage.getFeatureVotesByTool();
      res.json({ votes });
    } catch (error) {
      console.error('Error fetching feature votes:', error);
      res.status(500).json({ error: 'Failed to fetch votes' });
    }
  });
}
