import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { allTools, categories } from '@/data/tools';
import { Search, ArrowRight } from 'lucide-react';

export default function AllToolsPage() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const implementedTools = allTools.filter(tool => tool.implemented);
  
  const filteredTools = implementedTools.filter(tool => {
    const matchesSearch = searchQuery === '' || 
      t(`Tools.${tool.id}.title`).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(`Tools.${tool.id}.shortDesc`).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedTools = categories.reduce((acc, category) => {
    const tools = filteredTools.filter(tool => tool.category === category.id);
    if (tools.length > 0) {
      acc[category.id] = tools;
    }
    return acc;
  }, {} as Record<string, typeof filteredTools>);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-foreground mb-4">
              {t('Common.home.allToolsTitle', { defaultValue: 'All Tools' })}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('Common.home.allToolsDesc', { defaultValue: 'Browse all available tools. All processing happens in your browser.' })}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t('Common.nav.search', { defaultValue: 'Search tools...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-search-tools"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-filter-all"
              >
                {t('Common.messages.all', { defaultValue: 'All' })}
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`button-filter-${cat.id}`}
                >
                  {t(`Categories.${cat.id}.name`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-6">
            {t('Common.messages.showing', { defaultValue: 'Showing' })} {filteredTools.length} {t('Common.home.tools', { defaultValue: 'tools' })}
          </div>

          {Object.entries(groupedTools).map(([categoryId, tools]) => (
            <div key={categoryId} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
                  {t(`Categories.${categoryId}.name`)}
                </h2>
                <Link href={localizedPath(`/category/${categoryId}`)}>
                  <Button variant="ghost" size="sm">
                    {t('Common.home.viewAll', { defaultValue: 'View All' })}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                      <div 
                        className="bg-white dark:bg-card p-4 rounded-xl border border-slate-200 dark:border-border hover:border-primary/50 hover:shadow-lg transition-all group flex items-start gap-3"
                        data-testid={`card-tool-${tool.id}`}
                      >
                        <div className="w-10 h-10 bg-slate-50 dark:bg-muted rounded-lg flex items-center justify-center text-slate-600 dark:text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-foreground text-sm group-hover:text-primary transition-colors mb-1 truncate">
                            {t(`Tools.${tool.id}.title`)}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-2">
                            {t(`Tools.${tool.id}.shortDesc`)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('Common.messages.noResults', { defaultValue: 'No tools found matching your search.' })}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
