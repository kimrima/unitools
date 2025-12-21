import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Server, Search, AlertCircle, ExternalLink } from 'lucide-react';

export default function HttpHeaderAnalyzerTool() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);

  const analyzeHeaders = async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    setHeaders(null);

    try {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const response = await fetch(targetUrl, {
        method: 'HEAD',
        mode: 'cors',
      });

      const headerObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      setHeaders(headerObj);
    } catch {
      setError(t('Tools.http-header-analyzer.corsError'));
      setHeaders({
        'Note': t('Tools.http-header-analyzer.corsNote'),
        'Status': 'Unable to fetch due to CORS policy',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{t('Tools.http-header-analyzer.notice')}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          {t('Tools.http-header-analyzer.urlLabel')}
        </Label>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('Tools.http-header-analyzer.placeholder')}
            className="font-mono"
            data-testid="input-url"
          />
          <Button onClick={analyzeHeaders} disabled={!url || loading} data-testid="button-analyze">
            <Search className="w-4 h-4 mr-2" />
            {loading ? t('Common.messages.processing') : t('Tools.http-header-analyzer.analyze')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {headers && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('Tools.http-header-analyzer.headersLabel')}</Label>
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              {t('Tools.http-header-analyzer.openUrl')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {Object.entries(headers).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-2 p-2 bg-muted/50 rounded-md text-sm"
              >
                <span className="font-mono font-medium text-primary shrink-0">{key}:</span>
                <span className="font-mono break-all text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!headers && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          {t('Tools.http-header-analyzer.empty')}
        </div>
      )}
    </div>
  );
}
