import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, AlertCircle, Loader2, ChevronRight, Home } from 'lucide-react';
import { allTools } from '@/data/tools';

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
  const locale = useLocale();
  
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">
            {locale === 'ko' ? '이 도구는 준비 중입니다' : 'Coming Soon'}
          </p>
          <p className="text-muted-foreground mt-2 max-w-md">
            {locale === 'ko' 
              ? `"${toolId}" 기능은 현재 개발 중입니다. 곧 사용하실 수 있습니다!`
              : `The "${toolId}" feature is currently under development. Check back soon!`
            }
          </p>
        </div>
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
  const toolShortDesc = t(`Tools.${toolId}.shortDesc`, { defaultValue: '' });
  
  const toolExists = toolTitle !== '' && toolTitle !== `Tools.${toolId}.title`;
  const tool = allTools.find(t => t.id === toolId);
  const categoryName = tool ? t(`Categories.${tool.category}.name`) : '';

  if (!toolExists) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl" data-testid="text-tool-not-found">
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
                <Button data-testid="button-go-home">
                  <Home className="w-4 h-4 mr-2" />
                  {locale === 'ko' ? '홈으로 돌아가기' : 'Go Home'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const ToolComponent = toolComponents[toolId];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm" data-testid="breadcrumb">
            <Link href={localizedPath('/')} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span data-testid="link-breadcrumb-home">{t('Common.nav.home')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            {tool && (
              <>
                <Link href={localizedPath(`/category/${tool.category}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <span data-testid="link-breadcrumb-category">{categoryName}</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </>
            )}
            <span data-testid="text-breadcrumb-tool" className="text-foreground font-medium">{toolTitle}</span>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-muted/50 to-background py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start gap-4">
            <Link href={localizedPath('/')}>
              <Button variant="ghost" size="icon" className="flex-shrink-0 mt-1" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-tool-title">
                  {toolTitle}
                </h1>
                {tool && !tool.implemented && (
                  <Badge variant="outline">{locale === 'ko' ? '개발 중' : 'Coming Soon'}</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg" data-testid="text-tool-description">
                {toolDescription || toolShortDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {ToolComponent ? (
              <Suspense fallback={<ToolLoading />}>
                <ToolComponent />
              </Suspense>
            ) : (
              <GenericToolPlaceholder toolId={toolId} />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === 'ko' 
              ? '파일은 브라우저에서 직접 처리되며 서버로 전송되지 않습니다.'
              : 'Files are processed directly in your browser and never uploaded to any server.'
            }
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
