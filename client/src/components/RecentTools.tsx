import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useRecentTools } from '@/hooks/useRecentTools';
import { allTools } from '@/data/tools';

export default function RecentTools() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const { recentTools, clearRecentTools } = useRecentTools();

  if (recentTools.length === 0) {
    return null;
  }

  const toolsToShow = recentTools
    .map((id) => allTools.find((tool) => tool.id === id))
    .filter(Boolean)
    .slice(0, 5);

  if (toolsToShow.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8" data-testid="section-recent-tools">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-recent-heading">
            {t('Common.home.recentTools')}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearRecentTools}
          className="text-muted-foreground"
          data-testid="button-clear-recent"
        >
          <X className="w-4 h-4 mr-1" />
          {t('Common.actions.clear')}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {toolsToShow.map((tool) => (
          <Link key={tool!.id} href={localizedPath(`/${tool!.id}`)}>
            <Card 
              className="hover-elevate cursor-pointer h-full"
              data-testid={`card-recent-${tool!.id}`}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate mb-1">
                  {t(`Tools.${tool!.id}.title`)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {t(`Categories.${tool!.category}.name`)}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
