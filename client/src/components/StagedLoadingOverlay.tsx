import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileSearch, Cog, Sparkles, Check, X } from 'lucide-react';
import type { ProcessingStage } from '@/hooks/useStagedProcessing';
import { AdSlot } from '@/components/AdSlot';

interface StagedLoadingOverlayProps {
  stage: ProcessingStage;
  progress: number;
  stageProgress: number;
  message?: string;
  error?: string | null;
  onCancel?: () => void;
  showAds?: boolean;
}

const stageIcons: Record<ProcessingStage, typeof Loader2> = {
  idle: Loader2,
  queued: Loader2,
  analyzing: FileSearch,
  processing: Cog,
  optimizing: Sparkles,
  complete: Check,
  error: X,
};

const stageColors: Record<ProcessingStage, string> = {
  idle: 'text-muted-foreground',
  queued: 'text-muted-foreground',
  analyzing: 'text-blue-500',
  processing: 'text-amber-500',
  optimizing: 'text-purple-500',
  complete: 'text-green-500',
  error: 'text-destructive',
};

export function StagedLoadingOverlay({
  stage,
  progress,
  stageProgress,
  message,
  error,
  onCancel,
  showAds = true,
}: StagedLoadingOverlayProps) {
  const { t } = useTranslation();
  const Icon = stageIcons[stage] || Loader2;
  const colorClass = stageColors[stage] || 'text-primary';
  
  const stages: ProcessingStage[] = ['analyzing', 'processing', 'optimizing'];
  const currentStageIndex = stages.indexOf(stage);
  
  const getStageLabel = (s: ProcessingStage) => {
    switch (s) {
      case 'analyzing': return t('Common.stages.analyzing', { defaultValue: 'Analyzing' });
      case 'processing': return t('Common.stages.processing', { defaultValue: 'Processing' });
      case 'optimizing': return t('Common.stages.optimizing', { defaultValue: 'Optimizing' });
      default: return s;
    }
  };

  if (stage === 'idle') return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className={`relative ${stage !== 'complete' && stage !== 'error' ? 'animate-pulse' : ''}`}>
              <div className={`w-20 h-20 rounded-full bg-muted flex items-center justify-center ${colorClass}`}>
                <Icon className={`w-10 h-10 ${stage !== 'complete' && stage !== 'error' ? 'animate-spin' : ''}`} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {stages.map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    idx < currentStageIndex 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : idx === currentStageIndex
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx < currentStageIndex && <Check className="w-3 h-3" />}
                    {getStageLabel(s)}
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`w-8 h-0.5 ${idx < currentStageIndex ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="w-full max-w-md space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{message || t('Common.messages.processing')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
            
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            
            {onCancel && stage !== 'complete' && stage !== 'error' && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                {t('Common.actions.cancel', { defaultValue: 'Cancel' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showAds && stage !== 'complete' && stage !== 'error' && (
        <div className="flex justify-center">
          <AdSlot position="loading" />
        </div>
      )}
      
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('Common.messages.processingTip', { defaultValue: 'Your files are being processed securely in your browser. No data is uploaded to any server.' })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
