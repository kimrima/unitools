import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/layout/SearchBar';
import { categories, getPopularTools, getToolsByCategory, allTools } from '@/data/tools';
import { 
  ArrowRight,
  Shield,
  Zap,
  Star,
  Users,
  FileText,
  Image,
  ImagePlus,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
  Sparkles,
  Check,
} from 'lucide-react';

const categoryColors: Record<string, { bg: string; icon: string; iconBg: string }> = {
  pdf: { bg: 'bg-purple-50 dark:bg-purple-950', icon: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900' },
  imageEdit: { bg: 'bg-teal-50 dark:bg-teal-950', icon: 'text-teal-600 dark:text-teal-400', iconBg: 'bg-teal-100 dark:bg-teal-900' },
  imageConvert: { bg: 'bg-rose-50 dark:bg-rose-950', icon: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-900' },
  videoAudio: { bg: 'bg-orange-50 dark:bg-orange-950', icon: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900' },
  text: { bg: 'bg-green-50 dark:bg-green-950', icon: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900' },
  social: { bg: 'bg-pink-50 dark:bg-pink-950', icon: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-100 dark:bg-pink-900' },
  developer: { bg: 'bg-cyan-50 dark:bg-cyan-950', icon: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-100 dark:bg-cyan-900' },
  calculator: { bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900' },
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

  const premiumTools = allTools.filter(tool => 
    ['pdf-to-word', 'remove-background', 'compress-video'].includes(tool.id)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              {t('Common.hero.titlePart1', { defaultValue: 'Free Tools to Make' })}{' '}
              <span className="text-primary">{t('Common.hero.titlePart2', { defaultValue: 'Everything Simple' })}</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto" data-testid="text-hero-description">
              {t('Common.siteDescription')}
            </p>

            <div className="flex justify-center mb-10">
              <SearchBar variant="hero" autoFocus />
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((category) => {
                const colors = categoryColors[category.id] || categoryColors.pdf;
                const Icon = categoryIcons[category.id] || FileText;
                
                return (
                  <Link key={category.id} href={localizedPath(`/category/${category.id}`)}>
                    <Card 
                      className={`${colors.bg} border-0 hover-elevate cursor-pointer h-full`}
                      data-testid={`card-category-${category.id}`}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {t(`Categories.${category.id}.name`)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.toolCount} {t('Common.home.tools', { defaultValue: 'tools' })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>{t('Common.hero.trustFree', { defaultValue: 'Free to Use' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>{t('Common.hero.trustNoUpload', { defaultValue: '100% Free and secure' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>200+ {t('Common.home.onlineTools', { defaultValue: 'Online Tools' })}</span>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-popular-heading">
                {t('Common.home.popularTitle', { defaultValue: 'Our Most Popular Tools' })}
              </h2>
              <p className="text-muted-foreground">
                {t('Common.home.popularSubtitle', { defaultValue: 'The best of the best. All free, no catch.' })}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTools.slice(0, 8).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                    <Card 
                      className="hover-elevate cursor-pointer h-full border group"
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1 truncate">
                              {t(`Tools.${tool.id}.title`)}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
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
          </div>
        </section>

        {premiumTools.length > 0 && (
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    {t('Common.home.premiumTitle', { defaultValue: "Free Tools You'd Usually Pay For" })}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('Common.home.premiumSubtitle', { defaultValue: 'Professional-grade tools available for free.' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {premiumTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                      <Card className="hover-elevate cursor-pointer h-full overflow-hidden group">
                        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-destructive" />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{t(`Tools.${tool.id}.title`)}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {t(`Tools.${tool.id}.shortDesc`)}
                          </p>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:underline">
                            {t('Common.home.learnMore', { defaultValue: 'Learn more' })}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 md:py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t('Common.home.exploreTitle', { defaultValue: 'Explore All Tools' })}
              </h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-1 bg-transparent h-auto mb-8">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
                  {t('Common.home.allTools', { defaultValue: 'All Tools' })}
                </TabsTrigger>
                {categories.slice(0, 7).map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                  >
                    {t(`Categories.${category.id}.name`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allTools.slice(0, 12).map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t(`Tools.${tool.id}.title`)}</p>
                            <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getToolsByCategory(category.id).slice(0, 12).map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{t(`Tools.${tool.id}.title`)}</p>
                              <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}

              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link href={localizedPath('/all-tools')}>
                    {t('Common.home.showMoreTools', { defaultValue: 'Show More Tools' })}
                  </Link>
                </Button>
              </div>
            </Tabs>
          </div>
        </section>

        <section className="py-16 px-4 bg-[hsl(222,47%,11%)] text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t('Common.home.proTitle', { defaultValue: 'Get more with Pro' })}
                </h2>
                <p className="text-gray-300 mb-6">
                  {t('Common.home.proDesc', { defaultValue: 'Take your projects further with premium tools that stay out of your way and work smarter. Ad-free, unlimited usage, and faster processing.' })}
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{t('Common.home.proFeature1', { defaultValue: 'Ad-Free' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{t('Common.home.proFeature2', { defaultValue: 'Unlimited' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{t('Common.home.proFeature3', { defaultValue: 'Faster' })}</span>
                  </div>
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  {t('Common.home.getStarted', { defaultValue: 'Get Started' })}
                </Button>
              </div>
              <div className="hidden md:block">
                <Card className="bg-[hsl(222,47%,15%)] border-[hsl(217,33%,20%)]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t('Common.home.proPlan', { defaultValue: 'Pro Plan' })}</p>
                        <p className="text-sm text-gray-400">{t('Common.home.proUnlock', { defaultValue: 'Everything unlocked' })}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('Common.home.proBenefit1', { defaultValue: 'All premium tools' })}</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('Common.home.proBenefit2', { defaultValue: 'Priority support' })}</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {t('Common.home.proBenefit3', { defaultValue: 'No file size limits' })}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
