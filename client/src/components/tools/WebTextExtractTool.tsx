import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Globe, Download, CheckCircle, Copy, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ToolStatus = 'idle' | 'success';

export default function WebTextExtractTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [htmlInput, setHtmlInput] = useState('');
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [extractedText, setExtractedText] = useState('');

  const extractTextFromHtml = useCallback((html: string): string => {
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™')
      .replace(/&#(\d+);/g, (_match, num) => String.fromCharCode(parseInt(num, 10)))
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();

    return textContent;
  }, []);

  const handleExtract = useCallback(() => {
    if (!htmlInput.trim()) return;
    
    const text = extractTextFromHtml(htmlInput);
    setExtractedText(text);
    setStatus('success');
  }, [htmlInput, extractTextFromHtml]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: t('Common.copied'),
        description: t('Tools.web-text-extract.copiedMessage'),
      });
    } catch {
      toast({
        title: t('Common.error'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const reset = () => {
    setHtmlInput('');
    setStatus('idle');
    setExtractedText('');
  };

  return (
    <div className="space-y-6">
      {status === 'idle' && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="html-input">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                {t('Tools.web-text-extract.htmlLabel', { defaultValue: 'HTML Code' })}
              </div>
            </Label>
            <Textarea
              id="html-input"
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder={t('Tools.web-text-extract.htmlPlaceholder', { defaultValue: 'Paste HTML code here (Ctrl+U in browser to view source)...' })}
              rows={12}
              className="font-mono text-sm"
              data-testid="textarea-html-input"
            />
            <p className="text-xs text-muted-foreground">
              {t('Tools.web-text-extract.instructions')}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleExtract}
            disabled={!htmlInput.trim()}
            data-testid="button-extract"
          >
            <Globe className="w-4 h-4 mr-2" />
            {t('Tools.web-text-extract.extractButton')}
          </Button>
        </Card>
      )}

      {status === 'success' && extractedText && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('Common.success')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.web-text-extract.successMessage')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <Label>{t('Tools.web-text-extract.resultLabel', { defaultValue: 'Extracted Text' })}</Label>
            <Textarea
              value={extractedText}
              readOnly
              rows={15}
              className="font-mono text-sm"
              data-testid="textarea-result"
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleCopy} variant="outline" data-testid="button-copy">
                <Copy className="w-4 h-4 mr-2" />
                {t('Common.copy')}
              </Button>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.download')}
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                data-testid="button-new"
              >
                {t('Common.processAnother')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {status === 'success' && !extractedText && (
        <Card className="p-6 space-y-4">
          <div className="text-center text-muted-foreground py-4">
            <p>{t('Tools.web-text-extract.noTextFound', { defaultValue: 'No text content found in the provided HTML.' })}</p>
          </div>
          <Button variant="outline" onClick={reset} className="w-full" data-testid="button-retry">
            {t('Common.workflow.startOver')}
          </Button>
        </Card>
      )}
    </div>
  );
}
