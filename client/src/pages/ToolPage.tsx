import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

const MergePdfTool = lazy(() => import('@/components/tools/MergePdfTool'));
const SplitPdfTool = lazy(() => import('@/components/tools/SplitPdfTool'));
const CompressImageTool = lazy(() => import('@/components/tools/CompressImageTool'));
const ConvertImageTool = lazy(() => import('@/components/tools/ConvertImageTool'));
const VideoToGifTool = lazy(() => import('@/components/tools/VideoToGifTool'));

const toolComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'merge-pdf': MergePdfTool,
  'split-pdf': SplitPdfTool,
  'compress-image': CompressImageTool,
  'convert-image': ConvertImageTool,
  'video-to-gif': VideoToGifTool,
};

function ToolLoading() {
  return (
    <div className="flex items-center justify-center min-h-40">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function GenericToolPlaceholder({ toolId }: { toolId: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-64 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">
            {locale === 'ko' ? '이 도구는 준비 중입니다' : 'This tool is coming soon'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'ko' 
              ? `"${toolId}" 기능은 현재 개발 중입니다.`
              : `The "${toolId}" feature is currently under development.`
            }
          </p>
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <h2 className="font-medium mb-2">
          {locale === 'ko' ? '디버그 정보' : 'Debug Info'}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Tool ID: <code className="bg-muted px-1 rounded">{toolId}</code></li>
          <li>Status: <code className="bg-muted px-1 rounded">Not Implemented</code></li>
        </ul>
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/:locale/:toolId');
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  
  const toolId = params?.toolId || '';
  
  const toolTitle = t(`Tools.${toolId}.title`, { defaultValue: '' });
  const toolDescription = t(`Tools.${toolId}.description`, { defaultValue: '' });
  
  const toolExists = toolTitle !== '' && toolTitle !== `Tools.${toolId}.title`;

  if (!toolExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle data-testid="text-tool-not-found">
              {locale === 'ko' ? '도구를 찾을 수 없습니다' : 'Tool Not Found'}
            </CardTitle>
            <CardDescription data-testid="text-tool-not-found-desc">
              {locale === 'ko' 
                ? `"${toolId}" 도구가 존재하지 않습니다.`
                : `The tool "${toolId}" does not exist.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={localizedPath('/')}>
              <Button variant="outline" data-testid="button-go-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Common.nav.home')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ToolComponent = toolComponents[toolId];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={localizedPath('/')} className="hover:text-foreground transition-colors">
              <span data-testid="link-breadcrumb-home">{t('Common.nav.home')}</span>
            </Link>
            <span>/</span>
            <span data-testid="text-breadcrumb-tool" className="text-foreground">{toolTitle}</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href={localizedPath('/')}>
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-tool-title">
                {toolTitle}
              </h1>
              <p className="text-muted-foreground" data-testid="text-tool-description">
                {toolDescription}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            {ToolComponent ? (
              <Suspense fallback={<ToolLoading />}>
                <ToolComponent />
              </Suspense>
            ) : (
              <GenericToolPlaceholder toolId={toolId} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
