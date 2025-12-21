import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Home, ChevronRight, ThumbsUp, Check, ArrowRight, Star } from 'lucide-react';
import { allTools, categories, formatUsageCount } from '@/data/tools';
import { useFeatureVote } from '@/hooks/useFeatureVote';

const categoryColors: Record<string, { bg: string; iconBg: string; icon: string; headerBg: string }> = {
  pdf: { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    iconBg: 'bg-purple-100 dark:bg-purple-900/50', 
    icon: 'text-purple-600 dark:text-purple-400',
    headerBg: 'from-purple-100/80 via-purple-50/50 to-background dark:from-purple-950/50 dark:via-purple-950/20 dark:to-background'
  },
  imageEdit: { 
    bg: 'bg-teal-50 dark:bg-teal-950/30', 
    iconBg: 'bg-teal-100 dark:bg-teal-900/50', 
    icon: 'text-teal-600 dark:text-teal-400',
    headerBg: 'from-teal-100/80 via-teal-50/50 to-background dark:from-teal-950/50 dark:via-teal-950/20 dark:to-background'
  },
  imageConvert: { 
    bg: 'bg-rose-50 dark:bg-rose-950/30', 
    iconBg: 'bg-rose-100 dark:bg-rose-900/50', 
    icon: 'text-rose-600 dark:text-rose-400',
    headerBg: 'from-rose-100/80 via-rose-50/50 to-background dark:from-rose-950/50 dark:via-rose-950/20 dark:to-background'
  },
  videoAudio: { 
    bg: 'bg-orange-50 dark:bg-orange-950/30', 
    iconBg: 'bg-orange-100 dark:bg-orange-900/50', 
    icon: 'text-orange-600 dark:text-orange-400',
    headerBg: 'from-orange-100/80 via-orange-50/50 to-background dark:from-orange-950/50 dark:via-orange-950/20 dark:to-background'
  },
  text: { 
    bg: 'bg-green-50 dark:bg-green-950/30', 
    iconBg: 'bg-green-100 dark:bg-green-900/50', 
    icon: 'text-green-600 dark:text-green-400',
    headerBg: 'from-green-100/80 via-green-50/50 to-background dark:from-green-950/50 dark:via-green-950/20 dark:to-background'
  },
  social: { 
    bg: 'bg-pink-50 dark:bg-pink-950/30', 
    iconBg: 'bg-pink-100 dark:bg-pink-900/50', 
    icon: 'text-pink-600 dark:text-pink-400',
    headerBg: 'from-pink-100/80 via-pink-50/50 to-background dark:from-pink-950/50 dark:via-pink-950/20 dark:to-background'
  },
  developer: { 
    bg: 'bg-cyan-50 dark:bg-cyan-950/30', 
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50', 
    icon: 'text-cyan-600 dark:text-cyan-400',
    headerBg: 'from-cyan-100/80 via-cyan-50/50 to-background dark:from-cyan-950/50 dark:via-cyan-950/20 dark:to-background'
  },
  calculator: { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    iconBg: 'bg-blue-100 dark:bg-blue-900/50', 
    icon: 'text-blue-600 dark:text-blue-400',
    headerBg: 'from-blue-100/80 via-blue-50/50 to-background dark:from-blue-950/50 dark:via-blue-950/20 dark:to-background'
  },
};

export default function CategoryPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/:locale/category/:categoryId');
  const localizedPath = useLocalizedPath();
  const { hasVoted, voteForFeature, getVoteCount } = useFeatureVote();
  
  const categoryId = params?.categoryId;
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold mb-4">{t('Common.errors.categoryNotFound', 'Category not found')}</h1>
            <Link href={localizedPath('/')}>
              <Button data-testid="button-go-home">
                <Home className="w-4 h-4 mr-2" />
                {t('Common.nav.home')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryTools = allTools.filter(tool => tool.category === categoryId);
  const implementedTools = categoryTools.filter(t => t.implemented);
  const comingSoonTools = categoryTools.filter(t => !t.implemented);
  const CategoryIcon = category.icon;
  const colors = categoryColors[categoryId as string] || categoryColors.pdf;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead 
        pageType="category"
        categoryId={categoryId}
      />
      <Header />
      
      <main className="flex-1">
        <div className={`bg-gradient-to-b ${colors.headerBg} py-12 md:py-16`}>
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" data-testid="nav-breadcrumb">
              <Link href={localizedPath('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                {t('Common.nav.home')}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">
                {t(`Categories.${categoryId}.name`)}
              </span>
            </nav>

            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 ${colors.iconBg} rounded-2xl flex items-center justify-center`}>
                <CategoryIcon className={`w-10 h-10 ${colors.icon}`} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-category-title">
                  {t(`Categories.${categoryId}.name`)}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {t(`Categories.${categoryId}.description`)} - {categoryTools.length} {t('Common.home.tools', { defaultValue: 'tools' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {implementedTools.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6">{t('Common.category.availableTools', { defaultValue: 'Available Tools' })}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {implementedTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  
                  return (
                    <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                      <Card 
                        className="hover-elevate cursor-pointer h-full group"
                        data-testid={`card-tool-${tool.id}`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <ToolIcon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors">
                                {t(`Tools.${tool.id}.title`, tool.id)}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {t(`Tools.${tool.id}.shortDesc`, t(`Tools.${tool.id}.description`, ''))}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                          </div>
                          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatUsageCount(tool.usageCount)} {t('Common.tool.uses', { defaultValue: 'uses' })}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span>{tool.rating}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {comingSoonTools.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-muted-foreground">{t('Common.category.comingSoon', { defaultValue: 'Coming Soon' })}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {comingSoonTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const voted = hasVoted(tool.id);
                  const voteCount = getVoteCount(tool.id);
                  
                  return (
                    <Card 
                      key={tool.id} 
                      className="relative overflow-visible bg-muted/30"
                      data-testid={`card-tool-${tool.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <ToolIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1 truncate text-muted-foreground">
                              {t(`Tools.${tool.id}.title`, tool.id)}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant={voted ? "secondary" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={() => voteForFeature(tool.id)}
                            data-testid={`button-vote-${tool.id}`}
                          >
                            {voted ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                {t('Common.actions.voted', 'Voted')} ({voteCount})
                              </>
                            ) : (
                              <>
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {t('Common.actions.vote', 'Vote')} ({voteCount})
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
