import { useTranslation } from 'react-i18next';
import { AlertTriangle, Monitor } from 'lucide-react';

export function BrowserProcessingNotice() {
  const { t, i18n } = useTranslation();
  const isKorean = i18n.language === 'ko';

  return (
    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-amber-600 dark:text-amber-400">
          {isKorean ? '브라우저 처리 안내' : 'Browser Processing Notice'}
        </p>
        <p className="text-muted-foreground">
          {isKorean 
            ? '브라우저에서 처리되어 화질이 다소 저하될 수 있습니다. 고품질이 필요한 경우 데스크톱 프로그램 사용을 권장합니다.'
            : 'Processing in browser may reduce quality. For high-quality output, consider using desktop software.'}
        </p>
      </div>
    </div>
  );
}
