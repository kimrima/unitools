import { useEffect, useRef } from 'react';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSlot({ slot, format = 'auto', className = '', style }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (isAdLoaded.current) return;
    
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      isAdLoaded.current = true;
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div 
      ref={adRef}
      className={`ad-container ${className}`}
      style={{ minHeight: '90px', ...style }}
      data-testid={`ad-slot-${slot}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function InFeedAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 ${className}`} data-testid="ad-infeed">
      <div className="text-center text-xs text-muted-foreground mb-1">Advertisement</div>
      <div className="bg-muted/30 rounded-lg p-4 min-h-[100px] flex items-center justify-center border border-dashed border-muted-foreground/20">
        <span className="text-muted-foreground text-sm">Ad Space</span>
      </div>
    </div>
  );
}

export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-6 ${className}`} data-testid="ad-banner">
      <div className="text-center text-xs text-muted-foreground mb-1">Advertisement</div>
      <div className="bg-muted/30 rounded-lg p-4 min-h-[90px] flex items-center justify-center border border-dashed border-muted-foreground/20">
        <span className="text-muted-foreground text-sm">Banner Ad Space</span>
      </div>
    </div>
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`} data-testid="ad-sidebar">
      <div className="text-center text-xs text-muted-foreground mb-1">Advertisement</div>
      <div className="bg-muted/30 rounded-lg p-4 min-h-[250px] flex items-center justify-center border border-dashed border-muted-foreground/20">
        <span className="text-muted-foreground text-sm">Sidebar Ad</span>
      </div>
    </div>
  );
}
