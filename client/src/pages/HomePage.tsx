import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/layout/SearchBar';
import { categories, getPopularTools, getToolsByCategory, allTools } from '@/data/tools';
import { 
  ArrowRight,
  Shield,
  Zap,
  FileText,
  Image,
  ImagePlus,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
  Sparkles,
} from 'lucide-react';

const categoryColors: Record<string, { bg: string; icon: string; iconBg: string }> = {
  pdf: { bg: 'bg-purple-50 dark:bg-purple-950/50', icon: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/50' },
  imageEdit: { bg: 'bg-teal-50 dark:bg-teal-950/50', icon: 'text-teal-600 dark:text-teal-400', iconBg: 'bg-teal-100 dark:bg-teal-900/50' },
  imageConvert: { bg: 'bg-rose-50 dark:bg-rose-950/50', icon: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-900/50' },
  videoAudio: { bg: 'bg-orange-50 dark:bg-orange-950/50', icon: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900/50' },
  text: { bg: 'bg-green-50 dark:bg-green-950/50', icon: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900/50' },
  social: { bg: 'bg-pink-50 dark:bg-pink-950/50', icon: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-100 dark:bg-pink-900/50' },
  developer: { bg: 'bg-cyan-50 dark:bg-cyan-950/50', icon: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-100 dark:bg-cyan-900/50' },
  calculator: { bg: 'bg-blue-50 dark:bg-blue-950/50', icon: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/50' },
};

const categoryIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  imageEdit: Image,
  imageConvert: ImagePlus,
  videoAudio: Film,
  text: Type,
  social: Share2,
  developer: Code,
  calculator: Calculator,
};

export default function HomePage() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const popularTools = getPopularTools();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-hero-title">
              {t('Common.hero.titlePart1', { defaultValue: 'Free Tools to Make' })}{' '}
              <span className="text-primary">{t('Common.hero.titlePart2', { defaultValue: 'Everything Simple' })}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
              {t('Common.siteDescription')}
            </p>

            <div className="flex justify-center mb-16">
              <SearchBar variant="hero" autoFocus />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => {
                const colors = categoryColors[category.id] || categoryColors.pdf;
                const Icon = categoryIcons[category.id] || FileText;
                
                return (
                  <Link key={category.id} href={localizedPath(`/category/${category.id}`)}>
                    <div 
                      className={`${colors.bg} rounded-2xl p-5 hover-elevate cursor-pointer transition-all group`}
                      data-testid={`card-category-${category.id}`}
                    >
                      <div className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-7 h-7 ${colors.icon}`} />
                      </div>
                      <p className="font-semibold text-sm text-center">
                        {t(`Categories.${category.id}.name`)}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {category.toolCount} {t('Common.home.tools', { defaultValue: 'tools' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-6 px-4 border-y bg-card">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-12 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{t('Common.hero.trustFree', { defaultValue: 'Free to Use' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{t('Common.hero.trustNoUpload', { defaultValue: '100% Free and secure' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">200+ {t('Common.home.onlineTools', { defaultValue: 'Online Tools' })}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-popular-heading">
                {t('Common.home.popularTitle', { defaultValue: 'Our Most Popular Tools' })}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('Common.home.popularSubtitle', { defaultValue: 'The best of the best. All free, no catch.' })}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularTools.slice(0, 8).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                    <Card 
                      className="hover-elevate cursor-pointer h-full border group"
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-1.5">
                              {t(`Tools.${tool.id}.title`)}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {t(`Tools.${tool.id}.shortDesc`)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link href={localizedPath('/all-tools')}>
                  {t('Common.home.viewAllTools', { defaultValue: 'View All Tools' })}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {t('Common.home.exploreTitle', { defaultValue: 'Explore All Tools' })}
              </h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-10">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2">
                  {t('Common.home.allTools', { defaultValue: 'All Tools' })}
                </TabsTrigger>
                {categories.slice(0, 7).map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
                  >
                    {t(`Categories.${category.id}.name`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTools.filter(t => t.implemented).slice(0, 12).map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover-elevate cursor-pointer">
                          <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{t(`Tools.${tool.id}.title`)}</p>
                            <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getToolsByCategory(category.id).filter(t => t.implemented).slice(0, 12).map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                          <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover-elevate cursor-pointer">
                            <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{t(`Tools.${tool.id}.title`)}</p>
                              <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}

              <div className="text-center mt-10">
                <Button variant="outline" size="lg" asChild>
                  <Link href={localizedPath('/all-tools')}>
                    {t('Common.home.showMoreTools', { defaultValue: 'Show More Tools' })}
                  </Link>
                </Button>
              </div>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
