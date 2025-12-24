import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Globe, Search, Share2, Code, Eye } from 'lucide-react';
import { SiGoogle, SiFacebook, SiX } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  url: string;
  siteName: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  robots: {
    index: boolean;
    follow: boolean;
    noarchive: boolean;
    nosnippet: boolean;
  };
  charset: string;
  viewport: string;
  language: string;
  themeColor: string;
}

const defaultMeta: MetaData = {
  title: '',
  description: '',
  keywords: '',
  author: '',
  url: '',
  siteName: '',
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
  },
  charset: 'UTF-8',
  viewport: 'width=device-width, initial-scale=1.0',
  language: 'en',
  themeColor: '#6366f1',
};

export default function MetaTagGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [meta, setMeta] = useState<MetaData>(defaultMeta);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const updateMeta = useCallback((field: keyof MetaData, value: any) => {
    setMeta(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateRobots = useCallback((field: keyof MetaData['robots'], value: boolean) => {
    setMeta(prev => ({
      ...prev,
      robots: { ...prev.robots, [field]: value }
    }));
  }, []);

  const generateRobotsContent = () => {
    const parts: string[] = [];
    if (meta.robots.index) parts.push('index');
    else parts.push('noindex');
    if (meta.robots.follow) parts.push('follow');
    else parts.push('nofollow');
    if (meta.robots.noarchive) parts.push('noarchive');
    if (meta.robots.nosnippet) parts.push('nosnippet');
    return parts.join(', ');
  };

  const generateCode = () => {
    const lines: string[] = [];
    
    lines.push(`<meta charset="${meta.charset}">`);
    lines.push(`<meta name="viewport" content="${meta.viewport}">`);
    
    if (meta.title) {
      lines.push(`<title>${meta.title}</title>`);
    }
    if (meta.description) {
      lines.push(`<meta name="description" content="${meta.description}">`);
    }
    if (meta.keywords) {
      lines.push(`<meta name="keywords" content="${meta.keywords}">`);
    }
    if (meta.author) {
      lines.push(`<meta name="author" content="${meta.author}">`);
    }
    
    lines.push(`<meta name="robots" content="${generateRobotsContent()}">`);
    
    if (meta.language) {
      lines.push(`<meta http-equiv="content-language" content="${meta.language}">`);
    }
    if (meta.themeColor) {
      lines.push(`<meta name="theme-color" content="${meta.themeColor}">`);
    }
    
    lines.push('');
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push(`<meta property="og:type" content="${meta.ogType}">`);
    if (meta.url) {
      lines.push(`<meta property="og:url" content="${meta.url}">`);
    }
    if (meta.title) {
      lines.push(`<meta property="og:title" content="${meta.title}">`);
    }
    if (meta.description) {
      lines.push(`<meta property="og:description" content="${meta.description}">`);
    }
    if (meta.ogImage) {
      lines.push(`<meta property="og:image" content="${meta.ogImage}">`);
    }
    if (meta.siteName) {
      lines.push(`<meta property="og:site_name" content="${meta.siteName}">`);
    }
    
    lines.push('');
    lines.push('<!-- Twitter -->');
    lines.push(`<meta property="twitter:card" content="${meta.twitterCard}">`);
    if (meta.url) {
      lines.push(`<meta property="twitter:url" content="${meta.url}">`);
    }
    if (meta.title) {
      lines.push(`<meta property="twitter:title" content="${meta.title}">`);
    }
    if (meta.description) {
      lines.push(`<meta property="twitter:description" content="${meta.description}">`);
    }
    if (meta.ogImage) {
      lines.push(`<meta property="twitter:image" content="${meta.ogImage}">`);
    }
    if (meta.twitterSite) {
      lines.push(`<meta property="twitter:site" content="${meta.twitterSite}">`);
    }
    
    return lines.join('\n');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
      setCopied(true);
      toast({
        title: t('Tools.meta-tag-generator.copied') || 'Copied!',
        description: t('Tools.meta-tag-generator.copiedDesc') || 'Meta tags copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('Common.error') || 'Error',
        description: t('Common.copyFailed') || 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {t('Tools.meta-tag-generator.settings') || 'Meta Tag Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" data-testid="tab-basic">
                  <Globe className="w-4 h-4 mr-1" />
                  {t('Tools.meta-tag-generator.basic') || 'Basic'}
                </TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social">
                  <Share2 className="w-4 h-4 mr-1" />
                  {t('Tools.meta-tag-generator.social') || 'Social'}
                </TabsTrigger>
                <TabsTrigger value="seo" data-testid="tab-seo">
                  <Search className="w-4 h-4 mr-1" />
                  {t('Tools.meta-tag-generator.seo') || 'SEO'}
                </TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">
                  <Code className="w-4 h-4 mr-1" />
                  {t('Tools.meta-tag-generator.advanced') || 'Advanced'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.pageTitle') || 'Page Title'}</Label>
                  <Input
                    value={meta.title}
                    onChange={(e) => updateMeta('title', e.target.value)}
                    placeholder={t('Tools.meta-tag-generator.titlePlaceholder') || 'My Awesome Website'}
                    maxLength={60}
                    data-testid="input-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    {meta.title.length}/60 {t('Tools.meta-tag-generator.characters') || 'characters'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.description') || 'Description'}</Label>
                  <Textarea
                    value={meta.description}
                    onChange={(e) => updateMeta('description', e.target.value)}
                    placeholder={t('Tools.meta-tag-generator.descPlaceholder') || 'A brief description of your page...'}
                    maxLength={160}
                    rows={3}
                    data-testid="input-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    {meta.description.length}/160 {t('Tools.meta-tag-generator.characters') || 'characters'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.pageUrl') || 'Page URL'}</Label>
                  <Input
                    value={meta.url}
                    onChange={(e) => updateMeta('url', e.target.value)}
                    placeholder="https://example.com/page"
                    type="url"
                    data-testid="input-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.author') || 'Author'}</Label>
                  <Input
                    value={meta.author}
                    onChange={(e) => updateMeta('author', e.target.value)}
                    placeholder={t('Tools.meta-tag-generator.authorPlaceholder') || 'John Doe'}
                    data-testid="input-author"
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.siteName') || 'Site Name'}</Label>
                  <Input
                    value={meta.siteName}
                    onChange={(e) => updateMeta('siteName', e.target.value)}
                    placeholder={t('Tools.meta-tag-generator.siteNamePlaceholder') || 'My Website'}
                    data-testid="input-sitename"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.ogImage') || 'Social Image URL'}</Label>
                  <Input
                    value={meta.ogImage}
                    onChange={(e) => updateMeta('ogImage', e.target.value)}
                    placeholder="https://example.com/og-image.png"
                    type="url"
                    data-testid="input-ogimage"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('Tools.meta-tag-generator.ogImageHint') || 'Recommended: 1200x630 pixels'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.ogType') || 'Content Type'}</Label>
                  <Select value={meta.ogType} onValueChange={(v) => updateMeta('ogType', v)}>
                    <SelectTrigger data-testid="select-ogtype">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="profile">Profile</SelectItem>
                      <SelectItem value="video.movie">Video</SelectItem>
                      <SelectItem value="music.song">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.twitterCard') || 'Twitter Card Type'}</Label>
                  <Select value={meta.twitterCard} onValueChange={(v) => updateMeta('twitterCard', v)}>
                    <SelectTrigger data-testid="select-twittercard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.twitterSite') || 'Twitter @username'}</Label>
                  <Input
                    value={meta.twitterSite}
                    onChange={(e) => updateMeta('twitterSite', e.target.value)}
                    placeholder="@username"
                    data-testid="input-twittersite"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.keywords') || 'Keywords'}</Label>
                  <Textarea
                    value={meta.keywords}
                    onChange={(e) => updateMeta('keywords', e.target.value)}
                    placeholder={t('Tools.meta-tag-generator.keywordsPlaceholder') || 'keyword1, keyword2, keyword3'}
                    rows={2}
                    data-testid="input-keywords"
                  />
                </div>

                <div className="space-y-4">
                  <Label>{t('Tools.meta-tag-generator.robotsSettings') || 'Robots Settings'}</Label>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Index</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Tools.meta-tag-generator.indexDesc') || 'Allow search engines to index this page'}
                      </p>
                    </div>
                    <Switch
                      checked={meta.robots.index}
                      onCheckedChange={(v) => updateRobots('index', v)}
                      data-testid="switch-index"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Follow</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Tools.meta-tag-generator.followDesc') || 'Allow search engines to follow links'}
                      </p>
                    </div>
                    <Switch
                      checked={meta.robots.follow}
                      onCheckedChange={(v) => updateRobots('follow', v)}
                      data-testid="switch-follow"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">No Archive</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Tools.meta-tag-generator.noarchiveDesc') || 'Prevent cached copies'}
                      </p>
                    </div>
                    <Switch
                      checked={meta.robots.noarchive}
                      onCheckedChange={(v) => updateRobots('noarchive', v)}
                      data-testid="switch-noarchive"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">No Snippet</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Tools.meta-tag-generator.nosnippetDesc') || 'Prevent text snippets in search results'}
                      </p>
                    </div>
                    <Switch
                      checked={meta.robots.nosnippet}
                      onCheckedChange={(v) => updateRobots('nosnippet', v)}
                      data-testid="switch-nosnippet"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.charset') || 'Character Set'}</Label>
                  <Select value={meta.charset} onValueChange={(v) => updateMeta('charset', v)}>
                    <SelectTrigger data-testid="select-charset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTF-8">UTF-8</SelectItem>
                      <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                      <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.viewport') || 'Viewport'}</Label>
                  <Input
                    value={meta.viewport}
                    onChange={(e) => updateMeta('viewport', e.target.value)}
                    data-testid="input-viewport"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.language') || 'Language'}</Label>
                  <Select value={meta.language} onValueChange={(v) => updateMeta('language', v)}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tools.meta-tag-generator.themeColor') || 'Theme Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={meta.themeColor}
                      onChange={(e) => updateMeta('themeColor', e.target.value)}
                      className="w-14 h-9 p-1"
                      data-testid="input-themecolor"
                    />
                    <Input
                      value={meta.themeColor}
                      onChange={(e) => updateMeta('themeColor', e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('Tools.meta-tag-generator.preview') || 'Preview'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SiGoogle className="w-4 h-4" />
                  Google
                </div>
                <div className="p-4 rounded-md border bg-card">
                  <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
                    {truncate(meta.title || 'Page Title', 60)}
                  </p>
                  <p className="text-green-700 dark:text-green-500 text-sm">
                    {meta.url || 'https://example.com/page'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {truncate(meta.description || 'Page description will appear here...', 160)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SiFacebook className="w-4 h-4" />
                  Facebook
                </div>
                <div className="rounded-md border overflow-hidden bg-card">
                  {meta.ogImage ? (
                    <div className="w-full h-32 bg-muted flex items-center justify-center">
                      <img 
                        src={meta.ogImage} 
                        alt="OG Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      1200 x 630
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground uppercase">
                      {meta.url ? new URL(meta.url).hostname : 'example.com'}
                    </p>
                    <p className="font-semibold mt-1">
                      {truncate(meta.title || 'Page Title', 60)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncate(meta.description || 'Page description...', 100)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SiX className="w-4 h-4" />
                  X (Twitter)
                </div>
                <div className="rounded-xl border overflow-hidden bg-card">
                  {meta.ogImage ? (
                    <div className="w-full h-32 bg-muted flex items-center justify-center">
                      <img 
                        src={meta.ogImage} 
                        alt="Twitter Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      1200 x 630
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-medium">
                      {truncate(meta.title || 'Page Title', 70)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncate(meta.description || 'Page description...', 100)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {meta.url ? new URL(meta.url).hostname : 'example.com'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {t('Tools.meta-tag-generator.generatedCode') || 'Generated Code'}
              </CardTitle>
              <Button onClick={copyCode} size="sm" data-testid="button-copy">
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied 
                  ? (t('Tools.meta-tag-generator.copied') || 'Copied') 
                  : (t('Tools.meta-tag-generator.copy') || 'Copy')
                }
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-md bg-muted text-xs overflow-x-auto max-h-80 overflow-y-auto">
                <code>{generateCode()}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
