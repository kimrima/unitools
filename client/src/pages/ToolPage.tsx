import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { ToolStats, ToolSEOContent } from '@/components/seo/ToolContent';
import { ArrowLeft, AlertCircle, Loader2, ChevronRight, Home } from 'lucide-react';
import { allTools } from '@/data/tools';

const MergePdfTool = lazy(() => import('@/components/tools/MergePdfTool'));
const SplitPdfTool = lazy(() => import('@/components/tools/SplitPdfTool'));
const CompressPdfTool = lazy(() => import('@/components/tools/CompressPdfTool'));
const RotatePdfTool = lazy(() => import('@/components/tools/RotatePdfTool'));
const JpgToPdfTool = lazy(() => import('@/components/tools/JpgToPdfTool'));
const WatermarkPdfTool = lazy(() => import('@/components/tools/WatermarkPdfTool'));
const DeletePdfPagesTool = lazy(() => import('@/components/tools/DeletePdfPagesTool'));
const AddPageNumbersTool = lazy(() => import('@/components/tools/AddPageNumbersTool'));
const ExtractPdfPagesTool = lazy(() => import('@/components/tools/ExtractPdfPagesTool'));
const OrganizePdfTool = lazy(() => import('@/components/tools/OrganizePdfTool'));
const ProtectPdfTool = lazy(() => import('@/components/tools/ProtectPdfTool'));
const UnlockPdfTool = lazy(() => import('@/components/tools/UnlockPdfTool'));
const CompressImageTool = lazy(() => import('@/components/tools/CompressImageTool'));
const ConvertImageTool = lazy(() => import('@/components/tools/ConvertImageTool'));
const ResizeImageTool = lazy(() => import('@/components/tools/ResizeImageTool'));
const CropImageTool = lazy(() => import('@/components/tools/CropImageTool'));
const RotateImageTool = lazy(() => import('@/components/tools/RotateImageTool'));
const FlipImageTool = lazy(() => import('@/components/tools/FlipImageTool'));
const HeicToJpgTool = lazy(() => import('@/components/tools/HeicToJpgTool'));
const GrayscaleFilterTool = lazy(() => import('@/components/tools/GrayscaleFilterTool'));
const ImageWatermarkTool = lazy(() => import('@/components/tools/ImageWatermarkTool'));
const RoundCornersTool = lazy(() => import('@/components/tools/RoundCornersTool'));
const ColorPickerTool = lazy(() => import('@/components/tools/ColorPickerTool'));
const VideoToGifTool = lazy(() => import('@/components/tools/VideoToGifTool'));

const toolComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'merge-pdf': MergePdfTool,
  'split-pdf': SplitPdfTool,
  'compress-pdf': CompressPdfTool,
  'rotate-pdf': RotatePdfTool,
  'jpg-to-pdf': JpgToPdfTool,
  'png-to-pdf': JpgToPdfTool,
  'watermark-pdf': WatermarkPdfTool,
  'delete-pdf-pages': DeletePdfPagesTool,
  'add-page-numbers': AddPageNumbersTool,
  'extract-pdf-pages': ExtractPdfPagesTool,
  'organize-pdf': OrganizePdfTool,
  'protect-pdf': ProtectPdfTool,
  'unlock-pdf': UnlockPdfTool,
  'compress-image': CompressImageTool,
  'convert-image': ConvertImageTool,
  'resize-image': ResizeImageTool,
  'crop-image': CropImageTool,
  'rotate-image': RotateImageTool,
  'flip-image': FlipImageTool,
  'heic-to-jpg': HeicToJpgTool,
  'grayscale-filter': GrayscaleFilterTool,
  'image-watermark': ImageWatermarkTool,
  'round-corners': RoundCornersTool,
  'color-picker': ColorPickerTool,
  'jpg-to-png': ConvertImageTool,
  'png-to-jpg': ConvertImageTool,
  'webp-converter': ConvertImageTool,
  'webp-to-jpg': ConvertImageTool,
  'webp-to-png': ConvertImageTool,
  'gif-to-png': ConvertImageTool,
  'svg-to-png': ConvertImageTool,
  'bulk-convert-image': ConvertImageTool,
  'image-brightness': GrayscaleFilterTool,
  'image-mosaic': ImageWatermarkTool,
  'image-text': ImageWatermarkTool,
  'remove-exif': CompressImageTool,
  'image-shadow': RoundCornersTool,
  'image-joiner': ResizeImageTool,
  'image-border': RoundCornersTool,
  'image-opacity': GrayscaleFilterTool,
  'image-ratio': ResizeImageTool,
  'favicon-generator': ResizeImageTool,
  'canvas-size': CropImageTool,
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
  
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">
            {t('Common.tool.comingSoonTitle')}
          </p>
          <p className="text-muted-foreground mt-2 max-w-md">
            {t('Common.tool.comingSoonDesc', { toolId })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/:locale/:toolId');
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
                {t('Common.tool.notFound')}
              </CardTitle>
              <CardDescription data-testid="text-tool-not-found-desc">
                {t('Common.tool.notFoundDesc', { toolId })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href={localizedPath('/')}>
                <Button data-testid="button-go-home">
                  <Home className="w-4 h-4 mr-2" />
                  {t('Common.tool.goHome')}
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
      <SEOHead toolId={toolId} pageType="tool" />
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
                  <Badge variant="outline">{t('Common.tool.comingSoon')}</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-3" data-testid="text-tool-description">
                {toolDescription || toolShortDesc}
              </p>
              <ToolStats toolId={toolId} />
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
            {t('Common.tool.privacyNote')}
          </p>
        </div>

        <ToolSEOContent toolId={toolId} />
      </main>

      <Footer />
    </div>
  );
}
