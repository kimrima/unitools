import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
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
              {t('Common.hero.badge')}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              {t('Common.hero.titlePart1')}<br />
              <span className="text-primary">{t('Common.hero.titlePart2')}</span>
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
                <span>{t('Common.hero.trustFree')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>{t('Common.hero.trustNoUpload')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>{t('Common.hero.trustMultiLang')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-semibold" data-testid="text-categories-heading">
              {t('Common.home.categoriesTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('Common.home.categoriesSubtitle')}
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
                          {category.toolCount} {t('Common.home.tools')}
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
                {t('Common.home.popularTitle')}
              </h2>
              <Button variant="ghost" asChild>
                <Link href={localizedPath('/all-tools')}>
                  {t('Common.home.viewAllTools')}
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
              {t('Common.home.whyChoose')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center" data-testid="feature-client-side">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('Common.home.clientSideTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('Common.home.clientSideDesc')}
                </p>
              </div>
              
              <div className="text-center" data-testid="feature-free">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('Common.home.fastFreeTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('Common.home.fastFreeDesc')}
                </p>
              </div>
              
              <div className="text-center" data-testid="feature-multilang">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('Common.home.multiLangTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('Common.home.multiLangDesc')}
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
              {t('Common.home.getStarted')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('Common.home.getStartedDesc')}
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
