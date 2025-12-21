import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', maxLength: 100, optimalLength: 60, searchCutoff: 70 },
  { id: 'tiktok', name: 'TikTok', maxLength: 150, optimalLength: 80, searchCutoff: 100 },
  { id: 'instagram', name: 'Instagram Reels', maxLength: 2200, optimalLength: 125, searchCutoff: 125 },
];

export default function VideoTitleLengthTool() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  const analysis = useMemo(() => {
    const length = title.length;
    const words = title.trim() ? title.trim().split(/\s+/).length : 0;
    
    return PLATFORMS.map(platform => {
      const percentage = (length / platform.maxLength) * 100;
      let status: 'good' | 'warning' | 'danger';
      let message: string;
      
      if (length === 0) {
        status = 'good';
        message = t('Tools.video-title-length.empty');
      } else if (length <= platform.optimalLength) {
        status = 'good';
        message = t('Tools.video-title-length.optimal');
      } else if (length <= platform.searchCutoff) {
        status = 'warning';
        message = t('Tools.video-title-length.mayCutOff');
      } else if (length <= platform.maxLength) {
        status = 'danger';
        message = t('Tools.video-title-length.willCutOff');
      } else {
        status = 'danger';
        message = t('Tools.video-title-length.tooLong');
      }
      
      return {
        ...platform,
        length,
        percentage: Math.min(percentage, 100),
        status,
        message,
        remaining: platform.maxLength - length,
      };
    });
  }, [title, t]);

  const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getProgressColor = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('Tools.video-title-length.titleLabel')}</Label>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {title.length} {t('Tools.video-title-length.chars')}
                  </Badge>
                  <Badge variant="outline">
                    {title.trim() ? title.trim().split(/\s+/).length : 0} {t('Tools.video-title-length.words')}
                  </Badge>
                </div>
              </div>
              <Textarea
                placeholder={t('Tools.video-title-length.placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-[100px] text-lg resize-none"
                data-testid="textarea-title"
              />
            </div>

            <div className="space-y-4">
              <Label>{t('Tools.video-title-length.platformAnalysis')}</Label>
              
              {analysis.map((platform) => (
                <div 
                  key={platform.id}
                  className="p-4 rounded-lg bg-muted/30 border space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(platform.status)}
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {platform.length} / {platform.maxLength}
                    </span>
                  </div>
                  
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full transition-all ${getProgressColor(platform.status)}`}
                      style={{ width: `${platform.percentage}%` }}
                    />
                    <div 
                      className="absolute h-full w-0.5 bg-green-600"
                      style={{ left: `${(platform.optimalLength / platform.maxLength) * 100}%` }}
                    />
                    <div 
                      className="absolute h-full w-0.5 bg-yellow-600"
                      style={{ left: `${(platform.searchCutoff / platform.maxLength) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className={`${
                      platform.status === 'good' ? 'text-green-600' :
                      platform.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {platform.message}
                    </span>
                    <span className="text-muted-foreground">
                      {platform.remaining > 0 
                        ? `${platform.remaining} ${t('Tools.video-title-length.remaining')}`
                        : `${Math.abs(platform.remaining)} ${t('Tools.video-title-length.over')}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                {t('Tools.video-title-length.legendOptimal')}
              </p>
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                {t('Tools.video-title-length.legendWarning')}
              </p>
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                {t('Tools.video-title-length.legendDanger')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
