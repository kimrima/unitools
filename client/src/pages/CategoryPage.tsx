import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowLeft, Home, ChevronRight, ThumbsUp, Check } from 'lucide-react';
import { allTools, categories, formatUsageCount } from '@/data/tools';
import { useFeatureVote } from '@/hooks/useFeatureVote';

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
  const CategoryIcon = category.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead 
        pageType="category"
        categoryId={categoryId}
      />
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap" data-testid="nav-breadcrumb">
            <Link href={localizedPath('/')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              {t('Common.nav.home')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">
              {t(`Categories.${categoryId}.name`)}
            </span>
          </nav>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <CategoryIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-category-title">
                {t(`Categories.${categoryId}.name`)}
              </h1>
              <p className="text-muted-foreground">
                {categoryTools.length} {t('Common.home.tools')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryTools.map((tool) => {
              const ToolIcon = tool.icon;
              const voted = hasVoted(tool.id);
              const voteCount = getVoteCount(tool.id);
              
              if (!tool.implemented) {
                return (
                  <Card 
                    key={tool.id} 
                    className="relative overflow-visible"
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
              }

              return (
                <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                  <Card 
                    className="hover-elevate cursor-pointer h-full"
                    data-testid={`card-tool-${tool.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ToolIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-1 truncate">
                            {t(`Tools.${tool.id}.title`, tool.id)}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {t(`Tools.${tool.id}.shortDesc`, t(`Tools.${tool.id}.description`, ''))}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatUsageCount(tool.usageCount)} uses</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{tool.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <Link href={localizedPath('/')}>
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Common.nav.home')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
