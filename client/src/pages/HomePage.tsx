import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/layout/SearchBar';
import { categories, getPopularTools, allTools } from '@/data/tools';
import { 
  ArrowRight,
  FileText,
  Image,
  ImagePlus,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
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
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative py-20 md:py-32 px-4 bg-white dark:bg-background overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-foreground tracking-tight mb-4 md:mb-6 leading-tight" data-testid="text-hero-title">
              {t('Common.hero.titlePart1', { defaultValue: '모든 작업을' })}{' '}
              <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary font-black">{t('Common.hero.titlePart2', { defaultValue: '간편하게' })}</span>
                <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-4 bg-primary/20 -rotate-1 -z-10 rounded-full" />
              </span>{' '}
              <span className="font-black">{t('Common.hero.titlePart3', { defaultValue: '만드는 무료 도구' })}</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 dark:text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-10 font-medium px-4" data-testid="text-hero-description">
              {t('Common.siteDescription')}
            </p>

            <div className="flex justify-center mb-8 md:mb-16">
              <SearchBar variant="hero" autoFocus />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
              {categories.map((category) => {
                const colors = categoryColors[category.id] || categoryColors.pdf;
                const Icon = categoryIcons[category.id] || FileText;
                
                return (
                  <Link key={category.id} href={localizedPath(`/category/${category.id}`)}>
                    <div 
                      className={`relative overflow-hidden flex flex-col items-start p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 group ${colors.bg} border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1`}
                      data-testid={`card-category-${category.id}`}
                    >
                      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colors.iconBg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                      
                      <div className={`relative z-10 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110 ${colors.iconBg}`}>
                        <Icon className={`w-5 h-5 md:w-7 md:h-7 ${colors.icon}`} />
                      </div>
                      
                      <div className="relative z-10 text-left">
                        <h3 className={`text-sm md:text-xl font-black ${colors.icon.replace('text-', 'text-').replace('-600', '-700').replace('-400', '-300')} mb-0.5 md:mb-1`}>
                          {t(`Categories.${category.id}.name`)}
                        </h3>
                        <p className="text-slate-500 dark:text-muted-foreground font-medium text-xs md:text-sm">
                          {category.toolCount} {t('Common.home.tools', { defaultValue: 'tools' })}
                        </p>
                      </div>

                      <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.icon}`}>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12 text-slate-400 dark:text-muted-foreground font-medium text-xs md:text-sm">
              <span><strong className="text-slate-900 dark:text-foreground">1M+</strong> {t('Common.hero.activeUsers', { defaultValue: 'Active Users' })}</span>
              <span className="hidden md:block w-px h-4 bg-slate-300 dark:bg-border" />
              <span><strong className="text-slate-900 dark:text-foreground">10M+</strong> {t('Common.hero.filesProcessed', { defaultValue: 'Files Processed' })}</span>
              <span className="hidden md:block w-px h-4 bg-slate-300 dark:bg-border" />
              <span><strong className="text-slate-900 dark:text-foreground">200+</strong> {t('Common.home.onlineTools', { defaultValue: 'Online Tools' })}</span>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-slate-50 dark:bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-foreground mb-2 md:mb-4" data-testid="text-popular-heading">
                {t('Common.home.popularTitle', { defaultValue: 'Our Most Popular Tools' })}
              </h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-muted-foreground">
                {t('Common.home.popularSubtitle', { defaultValue: 'The best of the best. All free, no catch.' })}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
              {popularTools.slice(0, 8).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                    <div 
                      className="bg-white dark:bg-card p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex flex-col items-start h-full"
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-muted rounded-xl flex items-center justify-center text-slate-700 dark:text-muted-foreground mb-3 md:mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-foreground text-sm md:text-base mb-1 group-hover:text-primary transition-colors">
                        {t(`Tools.${tool.id}.title`)}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground line-clamp-2">
                        {t(`Tools.${tool.id}.shortDesc`)}
                      </p>
                    </div>
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

        <section className="py-12 md:py-20 bg-white dark:bg-card border-t border-slate-200 dark:border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-foreground mb-6 md:mb-8">
                {t('Common.home.exploreTitle', { defaultValue: 'Explore All Tools' })}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
              {allTools.filter(tool => tool.implemented).slice(0, 16).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                    <div className="bg-slate-50 dark:bg-muted p-4 md:p-5 rounded-xl border border-slate-200 dark:border-border hover:border-primary/50 hover:shadow-lg transition-all group flex flex-col md:flex-row items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-card rounded-lg flex items-center justify-center text-slate-600 dark:text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-foreground text-xs md:text-sm group-hover:text-primary transition-colors mb-1 truncate">
                          {t(`Tools.${tool.id}.title`)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-2 leading-relaxed hidden md:block">
                          {t(`Tools.${tool.id}.shortDesc`)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-full px-8 bg-white dark:bg-card border-2 hover:bg-slate-50 dark:hover:bg-muted text-slate-600 dark:text-foreground font-bold"
                asChild
              >
                <Link href={localizedPath('/all-tools')}>
                  {t('Common.home.showMoreTools', { defaultValue: 'Show More Tools' })}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
