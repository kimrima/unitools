import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'wouter';
import { ArrowRight, FileText, Image, ImagePlus, Film, Type, Share2, Code, Calculator } from 'lucide-react';
import { allTools } from '@/data/tools';

interface RelatedToolsProps {
  currentToolId: string;
  category?: string;
  maxTools?: number;
}

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

const categoryColors: Record<string, { bg: string; icon: string }> = {
  pdf: { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-500' },
  imageEdit: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-500' },
  imageConvert: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-500' },
  videoAudio: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-500' },
  text: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-500' },
  social: { bg: 'bg-pink-50 dark:bg-pink-950/30', icon: 'text-pink-500' },
  developer: { bg: 'bg-slate-50 dark:bg-slate-800/50', icon: 'text-slate-500' },
  calculator: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', icon: 'text-cyan-500' },
};

export function RelatedTools({ currentToolId, category, maxTools = 4 }: RelatedToolsProps) {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();

  const relatedTools = allTools
    .filter(tool => {
      if (tool.id === currentToolId) return false;
      if (!tool.implemented) return false;
      if (category && tool.category !== category) return false;
      return true;
    })
    .slice(0, maxTools);

  if (relatedTools.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">
        {t('Common.messages.relatedTools', { defaultValue: 'You might also like' })}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedTools.map(tool => {
          const Icon = categoryIcons[tool.category] || FileText;
          const colors = categoryColors[tool.category] || categoryColors.pdf;
          
          return (
            <Link key={tool.id} href={`/${locale}/${tool.id}`}>
              <div className={`group relative p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer ${colors.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-background shadow-sm`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {t(`Tools.${tool.id}.title`)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`Categories.${tool.category}.name`)}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className={`w-4 h-4 ${colors.icon}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
