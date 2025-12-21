import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, ArrowLeft, Share2, ExternalLink } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { allTools, type Tool } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface ResultData {
  blob: Blob;
  fileName: string;
  originalSize: number;
  outputSize: number;
  mimeType: string;
  toolId: string;
  timestamp: number;
}

export default function ResultPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ locale: string; toolId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const locale = params.locale || i18n.language;
  const toolId = params.toolId || '';
  
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const tool = allTools.find((t: Tool) => t.id === toolId);
  const relatedTools = tool?.relatedTools?.slice(0, 4).map((id: string) => allTools.find((t: Tool) => t.id === id)).filter(Boolean) as Tool[] || [];
  
  useEffect(() => {
    const stored = sessionStorage.getItem('unitools_result');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const blobData = data.blobData;
        const blob = new Blob([Uint8Array.from(atob(blobData), c => c.charCodeAt(0))], { type: data.mimeType });
        
        setResultData({
          ...data,
          blob,
        });
        
        if (data.mimeType.startsWith('image/') || data.mimeType === 'application/pdf') {
          setPreviewUrl(URL.createObjectURL(blob));
        }
      } catch {
        setLocation(`/${locale}/${toolId}`);
      }
    } else {
      setLocation(`/${locale}/${toolId}`);
    }
    
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [locale, toolId, setLocation]);
  
  const handleDownload = () => {
    if (!resultData) return;
    const url = URL.createObjectURL(resultData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('Common.messages.downloadStarted', { defaultValue: 'Download started' }),
      description: resultData.fileName,
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(`Tools.${toolId}.title`),
          text: t('Common.messages.shareText', { defaultValue: 'Check out this free tool!' }),
          url: window.location.origin + `/${locale}/${toolId}`,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.origin + `/${locale}/${toolId}`);
      toast({
        title: t('Common.messages.copied', { defaultValue: 'Link copied!' }),
      });
    }
  };
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleNewFile = () => {
    sessionStorage.removeItem('unitools_result');
    setLocation(`/${locale}/${toolId}`);
  };
  
  if (!resultData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={`/${locale}/${toolId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('Common.actions.back', { defaultValue: 'Back to tool' })}
          </Link>
        </div>
        
        <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-700 dark:text-green-300">
                  {t('Common.messages.processingComplete', { defaultValue: 'Processing Complete!' })}
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {t('Common.messages.readyToDownload', { defaultValue: 'Your file is ready to download' })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-background/50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.originalSize', { defaultValue: 'Original' })}</p>
                <p className="font-medium">{formatSize(resultData.originalSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.newSize', { defaultValue: 'New Size' })}</p>
                <p className="font-medium">{formatSize(resultData.outputSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.saved', { defaultValue: 'Saved' })}</p>
                <p className="font-medium text-green-600">
                  {resultData.originalSize > resultData.outputSize 
                    ? `-${Math.round((1 - resultData.outputSize / resultData.originalSize) * 100)}%`
                    : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('Common.messages.format', { defaultValue: 'Format' })}</p>
                <p className="font-medium uppercase">{resultData.fileName.split('.').pop()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {previewUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{t('Common.messages.preview', { defaultValue: 'Preview' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {resultData.mimeType.startsWith('image/') ? (
                <img src={previewUrl} alt="Result preview" className="max-h-64 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  {t('Common.messages.previewNotAvailable', { defaultValue: 'Preview not available' })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button onClick={handleDownload} size="lg" className="flex-1" data-testid="button-download-result">
            <Download className="w-5 h-5 mr-2" />
            {t('Common.actions.download', { defaultValue: 'Download' })} ({resultData.fileName})
          </Button>
          <Button variant="outline" size="lg" onClick={handleNewFile} data-testid="button-new-file">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Common.actions.processAnother', { defaultValue: 'Process Another File' })}
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare} data-testid="button-share">
            <Share2 className="w-4 h-4 mr-2" />
            {t('Common.actions.share', { defaultValue: 'Share' })}
          </Button>
        </div>
        
        <div className="flex justify-center mb-8">
          <AdSlot position="results" />
        </div>
        
        <Card className="mb-8 bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('Common.messages.thankYou', { defaultValue: 'Thank you for using UniTools! Your support helps us maintain and improve this free service.' })}
            </p>
          </CardContent>
        </Card>
        
        {relatedTools.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {t('Common.messages.relatedTools', { defaultValue: 'You might also like' })}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedTools.map(relatedTool => (
                <Link key={relatedTool.id} href={`/${locale}/${relatedTool.id}`}>
                  <Card className="p-3 hover-elevate cursor-pointer h-full">
                    <div className="flex flex-col items-center text-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {t(`Categories.${relatedTool.category}`)}
                      </Badge>
                      <span className="text-sm font-medium line-clamp-2">
                        {t(`Tools.${relatedTool.id}.title`)}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <AdSlot position="footer" />
        </div>
      </div>
    </div>
  );
}
