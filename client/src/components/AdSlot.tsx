import { useTranslation } from 'react-i18next';

type AdPosition = 'header' | 'sidebar' | 'loading' | 'results' | 'footer' | 'inline';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

const adSizes: Record<AdPosition, { width: string; height: string; label: string }> = {
  header: { width: 'w-full max-w-[728px]', height: 'h-[90px]', label: 'Leaderboard (728x90)' },
  sidebar: { width: 'w-[300px]', height: 'h-[250px]', label: 'Medium Rectangle (300x250)' },
  loading: { width: 'w-full max-w-[468px]', height: 'h-[60px]', label: 'Banner (468x60)' },
  results: { width: 'w-full max-w-[336px]', height: 'h-[280px]', label: 'Large Rectangle (336x280)' },
  footer: { width: 'w-full max-w-[728px]', height: 'h-[90px]', label: 'Leaderboard (728x90)' },
  inline: { width: 'w-full', height: 'h-[100px]', label: 'Inline Ad' },
};

export function AdSlot({ position, className = '' }: AdSlotProps) {
  const { t } = useTranslation();
  const size = adSizes[position];
  
  return (
    <div 
      className={`${size.width} ${size.height} ${className} bg-muted/50 border border-dashed border-muted-foreground/20 rounded-md flex flex-col items-center justify-center gap-1`}
      data-ad-position={position}
      data-testid={`ad-slot-${position}`}
    >
      <span className="text-xs text-muted-foreground/50">{size.label}</span>
      <span className="text-[10px] text-muted-foreground/30">
        {t('Common.messages.adPlaceholder', { defaultValue: 'Advertisement' })}
      </span>
    </div>
  );
}

export function AdSlotInline({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  
  return (
    <div 
      className={`w-full py-4 ${className}`}
      data-testid="ad-slot-inline"
    >
      <div className="max-w-2xl mx-auto bg-muted/30 border border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
        <span className="text-xs text-muted-foreground/50">
          {t('Common.messages.adPlaceholder', { defaultValue: 'Advertisement' })}
        </span>
      </div>
    </div>
  );
}
