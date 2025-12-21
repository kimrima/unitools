import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'wouter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { allTools, type Tool } from '@/data/tools';

interface RelatedToolsProps {
  currentToolId: string;
  category?: string;
  maxTools?: number;
}

export function RelatedTools({ currentToolId, category, maxTools = 4 }: RelatedToolsProps) {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();

  const relatedTools = allTools
    .filter(tool => {
      if (tool.id === currentToolId) return false;
      if (category && tool.category !== category) return false;
      return true;
    })
    .slice(0, maxTools);

  if (relatedTools.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {t('Common.messages.relatedTools', { defaultValue: 'You might also like' })}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {relatedTools.map(tool => (
          <Link key={tool.id} href={`/${locale}/${tool.id}`}>
            <Card className="p-4 hover-elevate cursor-pointer h-full group">
              <div className="flex flex-col gap-3">
                <Badge variant="secondary" className="text-xs w-fit">
                  {t(`Categories.${tool.category}.name`)}
                </Badge>
                <span className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {t(`Tools.${tool.id}.title`)}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
