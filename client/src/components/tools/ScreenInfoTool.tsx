import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScreenInfo {
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  colorDepth: number;
  orientation: string;
  touchSupport: boolean;
  onlineStatus: boolean;
  language: string;
  platform: string;
  userAgent: string;
  cookiesEnabled: boolean;
  javaEnabled: boolean;
}

export default function ScreenInfoTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [info, setInfo] = useState<ScreenInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const gatherInfo = () => {
    const screenInfo: ScreenInfo = {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'unknown',
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      onlineStatus: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      javaEnabled: false,
    };
    setInfo(screenInfo);
  };

  useEffect(() => {
    gatherInfo();
    
    const handleResize = () => gatherInfo();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const copyAll = async () => {
    if (!info) return;
    const text = Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: t('Common.messages.copied', 'Copied!') });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!info) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{String(value)}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={gatherInfo} data-testid="button-refresh">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('Common.actions.refresh', 'Refresh')}
        </Button>
        <Button variant="outline" onClick={copyAll} data-testid="button-copy">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {t('Common.actions.copy', 'Copy')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('Tools.screen-info.display', 'Display')}</h3>
            <InfoRow 
              label={t('Tools.screen-info.screenResolution', 'Screen Resolution')} 
              value={`${info.screenWidth} x ${info.screenHeight}`} 
            />
            <InfoRow 
              label={t('Tools.screen-info.viewportSize', 'Viewport Size')} 
              value={`${info.viewportWidth} x ${info.viewportHeight}`} 
            />
            <InfoRow 
              label={t('Tools.screen-info.pixelRatio', 'Device Pixel Ratio')} 
              value={info.devicePixelRatio} 
            />
            <InfoRow 
              label={t('Tools.screen-info.colorDepth', 'Color Depth')} 
              value={`${info.colorDepth}-bit`} 
            />
            <InfoRow 
              label={t('Tools.screen-info.orientation', 'Orientation')} 
              value={info.orientation} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('Tools.screen-info.browser', 'Browser & System')}</h3>
            <InfoRow 
              label={t('Tools.screen-info.language', 'Language')} 
              value={info.language} 
            />
            <InfoRow 
              label={t('Tools.screen-info.platform', 'Platform')} 
              value={info.platform} 
            />
            <InfoRow 
              label={t('Tools.screen-info.touchSupport', 'Touch Support')} 
              value={info.touchSupport ? 'Yes' : 'No'} 
            />
            <InfoRow 
              label={t('Tools.screen-info.onlineStatus', 'Online Status')} 
              value={info.onlineStatus ? 'Online' : 'Offline'} 
            />
            <InfoRow 
              label={t('Tools.screen-info.cookiesEnabled', 'Cookies Enabled')} 
              value={info.cookiesEnabled ? 'Yes' : 'No'} 
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t('Tools.screen-info.userAgent', 'User Agent')}</h3>
          <div className="font-mono text-sm bg-muted p-4 rounded-lg break-all" data-testid="user-agent">
            {info.userAgent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
