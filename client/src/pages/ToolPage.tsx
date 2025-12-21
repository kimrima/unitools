import { Suspense, lazy, useEffect } from 'react';
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
import { ArrowLeft, AlertCircle, Loader2, ChevronRight, Home, ThumbsUp, Check } from 'lucide-react';
import { allTools } from '@/data/tools';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useFeatureVote } from '@/hooks/useFeatureVote';

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
const PdfToImageTool = lazy(() => import('@/components/tools/PdfToImageTool'));
const SignPdfTool = lazy(() => import('@/components/tools/SignPdfTool'));
const PdfToTextTool = lazy(() => import('@/components/tools/PdfToTextTool'));
const CropPdfTool = lazy(() => import('@/components/tools/CropPdfTool'));
const GrayscalePdfTool = lazy(() => import('@/components/tools/GrayscalePdfTool'));
const ResizePdfTool = lazy(() => import('@/components/tools/ResizePdfTool'));
const NupPdfTool = lazy(() => import('@/components/tools/NupPdfTool'));
const OcrPdfTool = lazy(() => import('@/components/tools/OcrPdfTool'));
const CreateGifTool = lazy(() => import('@/components/tools/CreateGifTool'));
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
const TrimVideoTool = lazy(() => import('@/components/tools/TrimVideoTool'));
const MuteVideoTool = lazy(() => import('@/components/tools/MuteVideoTool'));
const ExtractAudioTool = lazy(() => import('@/components/tools/ExtractAudioTool'));
const CompressVideoTool = lazy(() => import('@/components/tools/CompressVideoTool'));
const TrimAudioTool = lazy(() => import('@/components/tools/TrimAudioTool'));
const ConvertAudioTool = lazy(() => import('@/components/tools/ConvertAudioTool'));
const VoiceRecorderTool = lazy(() => import('@/components/tools/VoiceRecorderTool'));
const ScreenRecorderTool = lazy(() => import('@/components/tools/ScreenRecorderTool'));
const VideoMetadataTool = lazy(() => import('@/components/tools/VideoMetadataTool'));
const CharacterCountTool = lazy(() => import('@/components/tools/CharacterCountTool'));
const CaseConverterTool = lazy(() => import('@/components/tools/CaseConverterTool'));
const ImageOcrTool = lazy(() => import('@/components/tools/ImageOcrTool'));
const TextProcessingTool = lazy(() => import('@/components/tools/TextProcessingTool'));
const JsonFormatterTool = lazy(() => import('@/components/tools/JsonFormatterTool'));
const Base64Tool = lazy(() => import('@/components/tools/Base64Tool'));
const UrlEncodeTool = lazy(() => import('@/components/tools/UrlEncodeTool'));
const LoremIpsumTool = lazy(() => import('@/components/tools/LoremIpsumTool'));
const DiffCheckerTool = lazy(() => import('@/components/tools/DiffCheckerTool'));
const QrCodeTool = lazy(() => import('@/components/tools/QrCodeTool'));
const InstagramLineBreakTool = lazy(() => import('@/components/tools/InstagramLineBreakTool'));
const InstagramFontTool = lazy(() => import('@/components/tools/InstagramFontTool'));
const RandomPickerTool = lazy(() => import('@/components/tools/RandomPickerTool'));
const KaomojiTool = lazy(() => import('@/components/tools/KaomojiTool'));
const UtmBuilderTool = lazy(() => import('@/components/tools/UtmBuilderTool'));
const TimezoneConverterTool = lazy(() => import('@/components/tools/TimezoneConverterTool'));
const HashtagGeneratorTool = lazy(() => import('@/components/tools/HashtagGeneratorTool'));
const TiktokSafeZoneTool = lazy(() => import('@/components/tools/TiktokSafeZoneTool'));
const InstagramGridTool = lazy(() => import('@/components/tools/InstagramGridTool'));
const YoutubeThumbnailTool = lazy(() => import('@/components/tools/YoutubeThumbnailTool'));
const YoutubeTagsTool = lazy(() => import('@/components/tools/YoutubeTagsTool'));
const YoutubeChannelIdTool = lazy(() => import('@/components/tools/YoutubeChannelIdTool'));
const VideoTitleLengthTool = lazy(() => import('@/components/tools/VideoTitleLengthTool'));
const BarcodeGeneratorTool = lazy(() => import('@/components/tools/BarcodeGeneratorTool'));
const UrlShortenerTool = lazy(() => import('@/components/tools/UrlShortenerTool'));
const AdBannerGuideTool = lazy(() => import('@/components/tools/AdBannerGuideTool'));
const LogoGeneratorTool = lazy(() => import('@/components/tools/LogoGeneratorTool'));
const EmailSignatureTool = lazy(() => import('@/components/tools/EmailSignatureTool'));
const FakeProfileTool = lazy(() => import('@/components/tools/FakeProfileTool'));
const HashGeneratorTool = lazy(() => import('@/components/tools/HashGeneratorTool'));
const AesEncryptionTool = lazy(() => import('@/components/tools/AesEncryptionTool'));
const PasswordGeneratorTool = lazy(() => import('@/components/tools/PasswordGeneratorTool'));
const UuidGeneratorTool = lazy(() => import('@/components/tools/UuidGeneratorTool'));
const RegexTesterTool = lazy(() => import('@/components/tools/RegexTesterTool'));
const JwtDecoderTool = lazy(() => import('@/components/tools/JwtDecoderTool'));
const CronGeneratorTool = lazy(() => import('@/components/tools/CronGeneratorTool'));
const EpochConverterTool = lazy(() => import('@/components/tools/EpochConverterTool'));
const ColorConverterTool = lazy(() => import('@/components/tools/ColorConverterTool'));
const SqlFormatterTool = lazy(() => import('@/components/tools/SqlFormatterTool'));
const HtmlMinifierTool = lazy(() => import('@/components/tools/HtmlMinifierTool'));
const CssMinifierTool = lazy(() => import('@/components/tools/CssMinifierTool'));
const JsMinifierTool = lazy(() => import('@/components/tools/JsMinifierTool'));
const WhatIsMyIpTool = lazy(() => import('@/components/tools/WhatIsMyIpTool'));
const Ipv4ToIpv6Tool = lazy(() => import('@/components/tools/Ipv4ToIpv6Tool'));
const BcryptGeneratorTool = lazy(() => import('@/components/tools/BcryptGeneratorTool'));
const HttpHeaderAnalyzerTool = lazy(() => import('@/components/tools/HttpHeaderAnalyzerTool'));
const PercentageCalculatorTool = lazy(() => import('@/components/tools/PercentageCalculatorTool'));
const TipCalculatorTool = lazy(() => import('@/components/tools/TipCalculatorTool'));
const DiscountCalculatorTool = lazy(() => import('@/components/tools/DiscountCalculatorTool'));
const CompoundInterestTool = lazy(() => import('@/components/tools/CompoundInterestTool'));
const SalaryConverterTool = lazy(() => import('@/components/tools/SalaryConverterTool'));
const SalesTaxCalculatorTool = lazy(() => import('@/components/tools/SalesTaxCalculatorTool'));
const CurrencyConverterTool = lazy(() => import('@/components/tools/CurrencyConverterTool'));
const MetricImperialTool = lazy(() => import('@/components/tools/MetricImperialTool'));
const TemperatureConverterTool = lazy(() => import('@/components/tools/TemperatureConverterTool'));
const AreaConverterTool = lazy(() => import('@/components/tools/AreaConverterTool'));
const VolumeConverterTool = lazy(() => import('@/components/tools/VolumeConverterTool'));
const SpeedConverterTool = lazy(() => import('@/components/tools/SpeedConverterTool'));
const BmiCalculatorTool = lazy(() => import('@/components/tools/BmiCalculatorTool'));
const BmrCalculatorTool = lazy(() => import('@/components/tools/BmrCalculatorTool'));
const AgeCalculatorTool = lazy(() => import('@/components/tools/AgeCalculatorTool'));
const PregnancyCalculatorTool = lazy(() => import('@/components/tools/PregnancyCalculatorTool'));
const SleepCalculatorTool = lazy(() => import('@/components/tools/SleepCalculatorTool'));
const DaysCounterTool = lazy(() => import('@/components/tools/DaysCounterTool'));
const DateCalculatorTool = lazy(() => import('@/components/tools/DateCalculatorTool'));
const RandomNumberTool = lazy(() => import('@/components/tools/RandomNumberTool'));
const ProbabilityCalculatorTool = lazy(() => import('@/components/tools/ProbabilityCalculatorTool'));
const GpaCalculatorTool = lazy(() => import('@/components/tools/GpaCalculatorTool'));
const ScientificCalculatorTool = lazy(() => import('@/components/tools/ScientificCalculatorTool'));
const SpeedTestTool = lazy(() => import('@/components/tools/SpeedTestTool'));
const CoinFlipperTool = lazy(() => import('@/components/tools/CoinFlipperTool'));
const DiceRollerTool = lazy(() => import('@/components/tools/DiceRollerTool'));
const CalculatorTool = lazy(() => import('@/components/tools/CalculatorTool'));
const WhiteNoiseTool = lazy(() => import('@/components/tools/WhiteNoiseTool'));
const RandomNameTool = lazy(() => import('@/components/tools/RandomNameTool'));
const MetronomeTool = lazy(() => import('@/components/tools/MetronomeTool'));

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
  'pdf-to-jpg': PdfToImageTool,
  'pdf-to-png': PdfToImageTool,
  'sign-pdf': SignPdfTool,
  'pdf-to-text': PdfToTextTool,
  'crop-pdf': CropPdfTool,
  'grayscale-pdf': GrayscalePdfTool,
  'resize-pdf': ResizePdfTool,
  'n-up-pdf': NupPdfTool,
  'ocr-pdf': OcrPdfTool,
  'create-gif': CreateGifTool,
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
  'trim-video': TrimVideoTool,
  'mute-video': MuteVideoTool,
  'extract-audio': ExtractAudioTool,
  'video-speed': TrimVideoTool,
  'video-capture': TrimVideoTool,
  'convert-video': CompressVideoTool,
  'resize-video': CompressVideoTool,
  'compress-video': CompressVideoTool,
  'flip-video': TrimVideoTool,
  'trim-audio': TrimAudioTool,
  'join-audio': TrimAudioTool,
  'convert-audio': ConvertAudioTool,
  'boost-audio': ConvertAudioTool,
  'reverse-audio': ConvertAudioTool,
  'audio-bitrate': ConvertAudioTool,
  'audio-visualizer': VoiceRecorderTool,
  'video-metadata': VideoMetadataTool,
  'voice-recorder': VoiceRecorderTool,
  'screen-recorder': ScreenRecorderTool,
  'image-ocr': ImageOcrTool,
  'pdf-text-extract': ImageOcrTool,
  'character-count': CharacterCountTool,
  'case-converter': CaseConverterTool,
  'line-break-remover': TextProcessingTool,
  'remove-duplicates': TextProcessingTool,
  'text-sort': TextProcessingTool,
  'find-replace': TextProcessingTool,
  'blank-line-remover': TextProcessingTool,
  'prefix-suffix': TextProcessingTool,
  'csv-to-json': JsonFormatterTool,
  'json-to-csv': JsonFormatterTool,
  'excel-to-pdf': JsonFormatterTool,
  'xml-to-json': JsonFormatterTool,
  'yaml-to-json': JsonFormatterTool,
  'text-to-list': TextProcessingTool,
  'dummy-generator': LoremIpsumTool,
  'lorem-ipsum': LoremIpsumTool,
  'markdown-preview': CharacterCountTool,
  'url-encode': UrlEncodeTool,
  'base64-text': Base64Tool,
  'html-entity': UrlEncodeTool,
  'diff-checker': DiffCheckerTool,
  'word-frequency': CharacterCountTool,
  'text-shuffle': TextProcessingTool,
  'binary-converter': Base64Tool,
  'morse-code': Base64Tool,
  'web-text-extract': ImageOcrTool,
  'json-formatter': JsonFormatterTool,
  'instagram-line-break': InstagramLineBreakTool,
  'hashtag-generator': HashtagGeneratorTool,
  'instagram-font': InstagramFontTool,
  'tiktok-safe-zone': TiktokSafeZoneTool,
  'instagram-grid': InstagramGridTool,
  'youtube-thumbnail': YoutubeThumbnailTool,
  'youtube-tags': YoutubeTagsTool,
  'youtube-channel-id': YoutubeChannelIdTool,
  'video-title-length': VideoTitleLengthTool,
  'qr-code-generator': QrCodeTool,
  'barcode-generator': BarcodeGeneratorTool,
  'url-shortener': UrlShortenerTool,
  'utm-builder': UtmBuilderTool,
  'ad-banner-guide': AdBannerGuideTool,
  'logo-generator': LogoGeneratorTool,
  'email-signature': EmailSignatureTool,
  'random-picker': RandomPickerTool,
  'fake-profile': FakeProfileTool,
  'kaomoji-collection': KaomojiTool,
  'timezone-converter': TimezoneConverterTool,
  'sha256-hash': HashGeneratorTool,
  'md5-hash': HashGeneratorTool,
  'aes-encryption': AesEncryptionTool,
  'base64-encode': Base64Tool,
  'bcrypt-generator': BcryptGeneratorTool,
  'html-minifier': HtmlMinifierTool,
  'css-minifier': CssMinifierTool,
  'js-minifier': JsMinifierTool,
  'sql-formatter': SqlFormatterTool,
  'password-generator': PasswordGeneratorTool,
  'uuid-generator': UuidGeneratorTool,
  'jwt-decoder': JwtDecoderTool,
  'cron-generator': CronGeneratorTool,
  'regex-tester': RegexTesterTool,
  'ipv4-to-ipv6': Ipv4ToIpv6Tool,
  'what-is-my-ip': WhatIsMyIpTool,
  'http-header-analyzer': HttpHeaderAnalyzerTool,
  'epoch-converter': EpochConverterTool,
  'color-converter': ColorConverterTool,
  'percentage-calculator': PercentageCalculatorTool,
  'tip-calculator': TipCalculatorTool,
  'discount-calculator': DiscountCalculatorTool,
  'compound-interest': CompoundInterestTool,
  'salary-converter': SalaryConverterTool,
  'sales-tax-calculator': SalesTaxCalculatorTool,
  'currency-converter': CurrencyConverterTool,
  'metric-imperial': MetricImperialTool,
  'temperature-converter': TemperatureConverterTool,
  'area-converter': AreaConverterTool,
  'volume-converter': VolumeConverterTool,
  'speed-converter': SpeedConverterTool,
  'bmi-calculator': BmiCalculatorTool,
  'bmr-calculator': BmrCalculatorTool,
  'age-calculator': AgeCalculatorTool,
  'pregnancy-calculator': PregnancyCalculatorTool,
  'sleep-calculator': SleepCalculatorTool,
  'days-counter': DaysCounterTool,
  'date-calculator': DateCalculatorTool,
  'random-number': RandomNumberTool,
  'probability-calculator': ProbabilityCalculatorTool,
  'gpa-calculator': GpaCalculatorTool,
  'scientific-calculator': ScientificCalculatorTool,
  'speed-test': SpeedTestTool,
  'coin-flipper': CoinFlipperTool,
  'dice-roller': DiceRollerTool,
  'calculator': CalculatorTool,
  'wheel-of-fortune': RandomPickerTool,
  'random-choice': RandomPickerTool,
  'upside-down-text': CaseConverterTool,
  'fancy-text': InstagramFontTool,
  'zalgo-text': CaseConverterTool,
  'binary-text': Base64Tool,
  'screen-resolution': WhatIsMyIpTool,
  'user-agent': WhatIsMyIpTool,
  'color-contrast': ColorConverterTool,
  'white-noise': WhiteNoiseTool,
  'random-name': RandomNameTool,
  'metronome': MetronomeTool,
  'morse-flasher': Base64Tool,
  'drawing-pad': ColorPickerTool,
  'redirect-checker': WhatIsMyIpTool,
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
  const { voteForFeature, hasVoted, getVoteCount } = useFeatureVote();
  const voted = hasVoted(toolId);
  const voteCount = getVoteCount(toolId);

  const handleVote = () => {
    if (!voted) {
      voteForFeature(toolId);
    }
  };
  
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
        <Button 
          variant={voted ? "secondary" : "default"}
          onClick={handleVote}
          disabled={voted}
          className="mt-4"
          data-testid="button-vote-feature"
        >
          {voted ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {t('Common.tool.voted')}
            </>
          ) : (
            <>
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t('Common.tool.voteForFeature')}
            </>
          )}
        </Button>
        {voteCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {t('Common.tool.voteCount', { count: voteCount })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/:locale/:toolId');
  const localizedPath = useLocalizedPath();
  const { addRecentTool } = useRecentTools();
  
  const toolId = params?.toolId || '';
  
  useEffect(() => {
    if (toolId) {
      addRecentTool(toolId);
    }
  }, [toolId, addRecentTool]);
  
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
