import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, FileSearch, Cog, Sparkles, Check, X } from 'lucide-react';
import type { ProcessingStage } from '@/hooks/useStagedProcessing';

interface StagedLoadingOverlayProps {
  stage: ProcessingStage;
  progress: number;
  stageProgress: number;
  message?: string;
  error?: string | null;
  onCancel?: () => void;
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

export function StagedLoadingOverlay({
  stage,
  progress,
  stageProgress,
  message,
  error,
  onCancel,
}: StagedLoadingOverlayProps) {
  const { t } = useTranslation();
  const Icon = stageIcons[stage] || Loader2;
  
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

  if (stage === 'idle' || stage === 'complete' || stage === 'error') return null;

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Icon className={`w-8 h-8 text-primary ${stage !== 'complete' && stage !== 'error' ? 'animate-spin' : ''}`} />
            </div>
          </div>
          {stage !== 'complete' && stage !== 'error' && (
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: '1.5s' }} />
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {stages.map((s, idx) => {
            const isComplete = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            
            return (
              <div key={s} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isComplete 
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-white scale-110'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {getStageLabel(s)}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className={`w-12 h-1 rounded-full transition-colors ${
                    isComplete ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="w-full space-y-3">
          <div className="relative">
            <Progress value={progress} className="h-2 bg-muted" />
            <div 
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">{message || t('Common.messages.processing')}</span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </div>
        
        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}
        
        {onCancel && stage !== 'complete' && stage !== 'error' && (
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            {t('Common.actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          {t('Common.messages.processingTip', { defaultValue: 'Your files are being processed securely in your browser. No data is uploaded to any server.' })}
        </p>
      </div>
    </div>
  );
}
