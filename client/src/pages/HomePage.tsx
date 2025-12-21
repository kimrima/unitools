import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Palette, 
  Video, 
  Type, 
  Share2, 
  Code, 
  Calculator,
  Globe,
  ArrowRight
} from 'lucide-react';
import { supportedLocales, localeNames, type SupportedLocale } from '@/i18n';

const categoryIcons = {
  pdf: FileText,
  imageConvert: Image,
  imageEdit: Palette,
  videoAudio: Video,
  text: Type,
  social: Share2,
  developer: Code,
  calculator: Calculator,
};

const categoryTools: Record<string, string[]> = {
  pdf: ['pdf-to-jpg', 'jpg-to-pdf', 'merge-pdf', 'split-pdf', 'compress-pdf'],
  imageConvert: ['png-to-jpg', 'jpg-to-png', 'webp-to-jpg'],
  imageEdit: ['resize-image', 'crop-image', 'compress-image'],
  developer: ['json-formatter', 'base64-encode', 'hash-generator'],
  calculator: ['unit-converter', 'percentage-calculator'],
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();

  const changeLocale = (newLocale: SupportedLocale) => {
    i18n.changeLanguage(newLocale);
    window.location.href = `/${newLocale}`;
  };

  const categories = Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href={localizedPath('/')}>
            <h1 className="text-xl font-bold" data-testid="text-site-name">
              {t('Common.siteName')}
            </h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {supportedLocales.map((loc) => (
              <Button
                key={loc}
                variant={locale === loc ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeLocale(loc)}
                data-testid={`button-locale-${loc}`}
              >
                {localeNames[loc]}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 px-4 text-center bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
              {t('Common.siteTitle')}
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-hero-description">
              {t('Common.siteDescription')}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-semibold mb-8" data-testid="text-categories-heading">
            {locale === 'ko' ? '카테고리' : 'Categories'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((categoryKey) => {
              const Icon = categoryIcons[categoryKey];
              const tools = categoryTools[categoryKey] || [];
              
              return (
                <Card key={categoryKey} className="hover-elevate" data-testid={`card-category-${categoryKey}`}>
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {t(`Categories.${categoryKey}.name`)}
                    </CardTitle>
                    <CardDescription>
                      {t(`Categories.${categoryKey}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {tools.slice(0, 3).map((toolId) => (
                        <Badge key={toolId} variant="secondary" className="text-xs">
                          {t(`Tools.${toolId}.shortDesc`, { defaultValue: toolId })}
                        </Badge>
                      ))}
                      {tools.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tools.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-2xl font-semibold mb-8" data-testid="text-tools-heading">
            {locale === 'ko' ? '인기 도구' : 'Popular Tools'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['pdf-to-jpg', 'png-to-jpg', 'resize-image', 'json-formatter', 'compress-pdf', 'hash-generator'].map((toolId) => (
              <Link key={toolId} href={localizedPath(`/${toolId}`)}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-tool-${toolId}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      {t(`Tools.${toolId}.title`)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t(`Tools.${toolId}.shortDesc`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div data-testid="feature-client-side">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">
                  {locale === 'ko' ? '100% 클라이언트 처리' : '100% Client-Side'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ko' 
                    ? '파일이 서버로 전송되지 않습니다. 모든 처리는 브라우저에서 직접 수행됩니다.'
                    : 'Files never leave your device. All processing happens directly in your browser.'
                  }
                </p>
              </div>
              <div data-testid="feature-free">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">
                  {locale === 'ko' ? '완전 무료' : 'Completely Free'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ko' 
                    ? '모든 도구를 무료로 사용할 수 있습니다. 숨겨진 비용이 없습니다.'
                    : 'Use all tools for free. No hidden costs or subscriptions.'
                  }
                </p>
              </div>
              <div data-testid="feature-multilang">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">
                  {locale === 'ko' ? '다국어 지원' : 'Multi-Language'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ko' 
                    ? '한국어, 영어 등 다양한 언어로 사용할 수 있습니다.'
                    : 'Available in multiple languages including Korean and English.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © 2024 UniTools. {t('Common.footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground" data-testid="link-footer-privacy">
              {t('Common.footer.privacy')}
            </span>
            <span className="text-muted-foreground" data-testid="link-footer-terms">
              {t('Common.footer.terms')}
            </span>
            <span className="text-muted-foreground" data-testid="link-footer-contact">
              {t('Common.footer.contact')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
