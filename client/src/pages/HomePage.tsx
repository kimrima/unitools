import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/layout/SearchBar';
import { categories, getPopularTools, getToolsByCategory } from '@/data/tools';
import { 
  ArrowRight,
  Shield,
  Zap,
  Globe,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const popularTools = getPopularTools();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6" data-testid="badge-tools-count">
              <Zap className="w-3 h-3 mr-1" />
              200+ Free Tools
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              {locale === 'ko' ? (
                <>
                  <span className="text-primary">모든 온라인 도구</span>를<br />
                  한 곳에서
                </>
              ) : (
                <>
                  All Your Tools,<br />
                  <span className="text-primary">One Place</span>
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
              {t('Common.siteDescription')}
            </p>

            <div className="flex justify-center mb-8">
              <SearchBar variant="hero" autoFocus />
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{locale === 'ko' ? '무료' : 'Free'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>{locale === 'ko' ? '서버 업로드 없음' : 'No Server Upload'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>{locale === 'ko' ? '다국어' : 'Multi-language'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-semibold" data-testid="text-categories-heading">
              {locale === 'ko' ? '카테고리별 도구' : 'Tools by Category'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ko' ? '8개 카테고리, 200+ 도구' : '8 categories, 200+ tools'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryTools = getToolsByCategory(category.id);
              
              return (
                <Link key={category.id} href={localizedPath(`/category/${category.id}`)}>
                  <Card 
                    className="h-full hover-elevate cursor-pointer group transition-all"
                    data-testid={`card-category-${category.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.toolCount} {locale === 'ko' ? '개' : 'tools'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">
                        {t(`Categories.${category.id}.name`)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {t(`Categories.${category.id}.description`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {categoryTools.slice(0, 3).map((tool) => (
                          <Badge key={tool.id} variant="secondary" className="text-xs">
                            {t(`Tools.${tool.id}.title`)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-muted/30 py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-semibold" data-testid="text-popular-heading">
                {locale === 'ko' ? '인기 도구' : 'Popular Tools'}
              </h2>
              <Button variant="ghost" asChild>
                <Link href={localizedPath('/all-tools')}>
                  {locale === 'ko' ? '모든 도구 보기' : 'View All Tools'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                    <Card 
                      className="hover-elevate cursor-pointer h-full group"
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base flex items-center justify-between gap-2">
                              <span className="truncate">{t(`Tools.${tool.id}.title`)}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {t(`Tools.${tool.id}.shortDesc`)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
              {locale === 'ko' ? 'UniTools를 선택하는 이유' : 'Why Choose UniTools'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center" data-testid="feature-client-side">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {locale === 'ko' ? '100% 클라이언트 처리' : '100% Client-Side'}
                </h3>
                <p className="text-muted-foreground">
                  {locale === 'ko' 
                    ? '파일이 서버로 전송되지 않습니다. 모든 처리는 브라우저에서 직접 수행되어 개인정보가 안전합니다.'
                    : 'Files never leave your device. All processing happens in your browser for complete privacy.'
                  }
                </p>
              </div>
              
              <div className="text-center" data-testid="feature-free">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {locale === 'ko' ? '빠르고 무료' : 'Fast & Free'}
                </h3>
                <p className="text-muted-foreground">
                  {locale === 'ko' 
                    ? '업로드/다운로드 대기 시간 없이 즉시 처리됩니다. 모든 도구를 무료로 사용하세요.'
                    : 'Instant processing with no upload wait. All tools are completely free to use.'
                  }
                </p>
              </div>
              
              <div className="text-center" data-testid="feature-multilang">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {locale === 'ko' ? '다국어 지원' : 'Multi-Language'}
                </h3>
                <p className="text-muted-foreground">
                  {locale === 'ko' 
                    ? '한국어, 영어 등 다양한 언어로 사용할 수 있습니다. 더 많은 언어가 추가될 예정입니다.'
                    : 'Available in Korean, English, and more languages coming soon.'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-background border mb-6">
              <span className="text-4xl font-bold text-primary">U</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {locale === 'ko' ? '지금 바로 시작하세요' : 'Get Started Now'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {locale === 'ko' 
                ? '회원가입 없이 모든 도구를 무료로 사용할 수 있습니다.'
                : 'Use all tools for free without registration.'
              }
            </p>
            <div className="flex justify-center">
              <SearchBar variant="compact" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
