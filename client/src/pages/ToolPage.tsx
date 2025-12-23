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
import { ShareActions } from '@/components/ShareActions';
import { ArrowLeft, AlertCircle, Loader2, ChevronRight, Home, ThumbsUp, Check, Star } from 'lucide-react';
import { allTools, formatUsageCount } from '@/data/tools';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useFeatureVote } from '@/hooks/useFeatureVote';

const categoryColors: Record<string, { iconBg: string; icon: string; headerBg: string }> = {
  pdf: { 
    iconBg: 'bg-purple-100 dark:bg-purple-900/50', 
    icon: 'text-purple-600 dark:text-purple-400',
    headerBg: 'from-purple-50/80 via-purple-50/30 to-background dark:from-purple-950/30 dark:via-purple-950/10 dark:to-background'
  },
  imageEdit: { 
    iconBg: 'bg-teal-100 dark:bg-teal-900/50', 
    icon: 'text-teal-600 dark:text-teal-400',
    headerBg: 'from-teal-50/80 via-teal-50/30 to-background dark:from-teal-950/30 dark:via-teal-950/10 dark:to-background'
  },
  imageConvert: { 
    iconBg: 'bg-rose-100 dark:bg-rose-900/50', 
    icon: 'text-rose-600 dark:text-rose-400',
    headerBg: 'from-rose-50/80 via-rose-50/30 to-background dark:from-rose-950/30 dark:via-rose-950/10 dark:to-background'
  },
  videoAudio: { 
    iconBg: 'bg-orange-100 dark:bg-orange-900/50', 
    icon: 'text-orange-600 dark:text-orange-400',
    headerBg: 'from-orange-50/80 via-orange-50/30 to-background dark:from-orange-950/30 dark:via-orange-950/10 dark:to-background'
  },
  text: { 
    iconBg: 'bg-green-100 dark:bg-green-900/50', 
    icon: 'text-green-600 dark:text-green-400',
    headerBg: 'from-green-50/80 via-green-50/30 to-background dark:from-green-950/30 dark:via-green-950/10 dark:to-background'
  },
  social: { 
    iconBg: 'bg-pink-100 dark:bg-pink-900/50', 
    icon: 'text-pink-600 dark:text-pink-400',
    headerBg: 'from-pink-50/80 via-pink-50/30 to-background dark:from-pink-950/30 dark:via-pink-950/10 dark:to-background'
  },
  developer: { 
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50', 
    icon: 'text-cyan-600 dark:text-cyan-400',
    headerBg: 'from-cyan-50/80 via-cyan-50/30 to-background dark:from-cyan-950/30 dark:via-cyan-950/10 dark:to-background'
  },
  calculator: { 
    iconBg: 'bg-blue-100 dark:bg-blue-900/50', 
    icon: 'text-blue-600 dark:text-blue-400',
    headerBg: 'from-blue-50/80 via-blue-50/30 to-background dark:from-blue-950/30 dark:via-blue-950/10 dark:to-background'
  },
};

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
const PdfToJpgTool = lazy(() => import('@/components/tools/PdfToJpgTool'));
const PdfToPngTool = lazy(() => import('@/components/tools/PdfToPngTool'));
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
const PdfTextExtractTool = lazy(() => import('@/components/tools/PdfTextExtractTool'));
const TextProcessingTool = lazy(() => import('@/components/tools/TextProcessingTool'));
const JsonFormatterTool = lazy(() => import('@/components/tools/JsonFormatterTool'));
const Base64Tool = lazy(() => import('@/components/tools/Base64Tool'));
const UrlEncodeTool = lazy(() => import('@/components/tools/UrlEncodeTool'));
const LoremIpsumTool = lazy(() => import('@/components/tools/LoremIpsumTool'));
const DummyDataGeneratorTool = lazy(() => import('@/components/tools/DummyDataGeneratorTool'));
const DiffCheckerTool = lazy(() => import('@/components/tools/DiffCheckerTool'));
const HtmlEntityTool = lazy(() => import('@/components/tools/HtmlEntityTool'));
const WordFrequencyTool = lazy(() => import('@/components/tools/WordFrequencyTool'));
const BinaryConverterTool = lazy(() => import('@/components/tools/BinaryConverterTool'));
const MorseCodeTool = lazy(() => import('@/components/tools/MorseCodeTool'));
const QrCodeTool = lazy(() => import('@/components/tools/QrCodeTool'));
const InstagramLineBreakTool = lazy(() => import('@/components/tools/InstagramLineBreakTool'));
const RandomPickerTool = lazy(() => import('@/components/tools/RandomPickerTool'));
const KaomojiTool = lazy(() => import('@/components/tools/KaomojiTool'));
const UtmBuilderTool = lazy(() => import('@/components/tools/UtmBuilderTool'));
const TimezoneConverterTool = lazy(() => import('@/components/tools/TimezoneConverterTool'));
const HashtagGeneratorTool = lazy(() => import('@/components/tools/HashtagGeneratorTool'));
const TiktokSafeZoneTool = lazy(() => import('@/components/tools/TiktokSafeZoneTool'));
const InstagramGridTool = lazy(() => import('@/components/tools/InstagramGridTool'));
const CanvasSizeTool = lazy(() => import('@/components/tools/CanvasSizeTool'));
const YoutubeThumbnailTool = lazy(() => import('@/components/tools/YoutubeThumbnailTool'));
const TwitterCharCountTool = lazy(() => import('@/components/tools/TwitterCharCountTool'));
const YoutubeChannelIdTool = lazy(() => import('@/components/tools/YoutubeChannelIdTool'));
const VideoTitleLengthTool = lazy(() => import('@/components/tools/VideoTitleLengthTool'));
const BarcodeGeneratorTool = lazy(() => import('@/components/tools/BarcodeGeneratorTool'));
const WebTextExtractTool = lazy(() => import('@/components/tools/WebTextExtractTool'));
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
const ImageMosaicTool = lazy(() => import('@/components/tools/ImageMosaicTool'));
const ShadowAddTool = lazy(() => import('@/components/tools/ShadowAddTool'));
const RemoveExifTool = lazy(() => import('@/components/tools/RemoveExifTool'));
const ImageJoinerTool = lazy(() => import('@/components/tools/ImageJoinerTool'));
const FaviconGeneratorTool = lazy(() => import('@/components/tools/FaviconGeneratorTool'));
const CoinFlipTool = lazy(() => import('@/components/tools/CoinFlipTool'));
const RandomColorTool = lazy(() => import('@/components/tools/RandomColorTool'));
const CountdownTimerTool = lazy(() => import('@/components/tools/CountdownTimerTool'));
const StopwatchTool = lazy(() => import('@/components/tools/StopwatchTool'));
const WheelSpinnerTool = lazy(() => import('@/components/tools/WheelSpinnerTool'));
const TypingTestTool = lazy(() => import('@/components/tools/TypingTestTool'));
const ScreenInfoTool = lazy(() => import('@/components/tools/ScreenInfoTool'));
const Magic8BallTool = lazy(() => import('@/components/tools/Magic8BallTool'));
const LoveCalculatorTool = lazy(() => import('@/components/tools/LoveCalculatorTool'));
const BreathingExerciseTool = lazy(() => import('@/components/tools/BreathingExerciseTool'));
const PomodoroTimerTool = lazy(() => import('@/components/tools/PomodoroTimerTool'));
const ReactionTimeTool = lazy(() => import('@/components/tools/ReactionTimeTool'));
const NumberGuessingTool = lazy(() => import('@/components/tools/NumberGuessingTool'));
const QuotesGeneratorTool = lazy(() => import('@/components/tools/QuotesGeneratorTool'));
const FlipTextTool = lazy(() => import('@/components/tools/FlipTextTool'));
const EmojiSearchTool = lazy(() => import('@/components/tools/EmojiSearchTool'));
const YesNoGeneratorTool = lazy(() => import('@/components/tools/YesNoGeneratorTool'));
const EliminationWheelTool = lazy(() => import('@/components/tools/EliminationWheelTool'));
const TeamPickerTool = lazy(() => import('@/components/tools/TeamPickerTool'));
const BalanceGameTool = lazy(() => import('@/components/tools/BalanceGameTool'));
const ChosungQuizTool = lazy(() => import('@/components/tools/ChosungQuizTool'));
const CpsTestTool = lazy(() => import('@/components/tools/CpsTestTool'));
const BingoGeneratorTool = lazy(() => import('@/components/tools/BingoGeneratorTool'));
const StopwatchChallengeTool = lazy(() => import('@/components/tools/StopwatchChallengeTool'));
const SilentShoutTool = lazy(() => import('@/components/tools/SilentShoutTool'));
const BigWheelTool = lazy(() => import('@/components/tools/BigWheelTool'));
const HearingAgeTool = lazy(() => import('@/components/tools/HearingAgeTool'));
const TournamentTool = lazy(() => import('@/components/tools/TournamentTool'));

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
  'pdf-to-jpg': PdfToJpgTool,
  'pdf-to-png': PdfToPngTool,
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
  'image-mosaic': ImageMosaicTool,
  'image-text': ImageWatermarkTool,
  'remove-exif': RemoveExifTool,
  'image-shadow': ShadowAddTool,
  'add-shadow': ShadowAddTool,
  'image-joiner': ImageJoinerTool,
  'favicon-generator': FaviconGeneratorTool,
  'canvas-size': CanvasSizeTool,
  'video-to-gif': VideoToGifTool,
  'trim-video': TrimVideoTool,
  'mute-video': MuteVideoTool,
  'extract-audio': ExtractAudioTool,
  'compress-video': CompressVideoTool,
  'trim-audio': TrimAudioTool,
  'convert-audio': ConvertAudioTool,
  'boost-audio': ConvertAudioTool,
  'reverse-audio': ConvertAudioTool,
  'audio-bitrate': ConvertAudioTool,
  'audio-visualizer': VoiceRecorderTool,
  'video-metadata': VideoMetadataTool,
  'voice-recorder': VoiceRecorderTool,
  'screen-recorder': ScreenRecorderTool,
  'image-ocr': ImageOcrTool,
  'pdf-text-extract': PdfTextExtractTool,
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
  'xml-to-json': JsonFormatterTool,
  'yaml-to-json': JsonFormatterTool,
  'text-to-list': TextProcessingTool,
  'dummy-generator': DummyDataGeneratorTool,
  'lorem-ipsum': LoremIpsumTool,
  'markdown-preview': CharacterCountTool,
  'url-encode': UrlEncodeTool,
  'base64-text': Base64Tool,
  'html-entity': HtmlEntityTool,
  'diff-checker': DiffCheckerTool,
  'word-frequency': WordFrequencyTool,
  'text-shuffle': TextProcessingTool,
  'binary-converter': BinaryConverterTool,
  'morse-code': MorseCodeTool,
  'web-text-extract': WebTextExtractTool,
  'json-formatter': JsonFormatterTool,
  'instagram-line-break': InstagramLineBreakTool,
  'hashtag-generator': HashtagGeneratorTool,
  'tiktok-safe-zone': TiktokSafeZoneTool,
  'instagram-grid': InstagramGridTool,
  'youtube-thumbnail': YoutubeThumbnailTool,
  'twitter-char-count': TwitterCharCountTool,
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
  'calculator': CalculatorTool,
  'coin-flip': CoinFlipTool,
  'dice-roller': DiceRollerTool,
  'random-color': RandomColorTool,
  'countdown-timer': CountdownTimerTool,
  'stopwatch': StopwatchTool,
  'wheel-spinner': WheelSpinnerTool,
  'typing-test': TypingTestTool,
  'screen-info': ScreenInfoTool,
  'magic-8-ball': Magic8BallTool,
  'love-calculator': LoveCalculatorTool,
  'breathing-exercise': BreathingExerciseTool,
  'pomodoro-timer': PomodoroTimerTool,
  'reaction-time': ReactionTimeTool,
  'number-guessing': NumberGuessingTool,
  'quotes-generator': QuotesGeneratorTool,
  'flip-text': FlipTextTool,
  'emoji-search': EmojiSearchTool,
  'yes-no-generator': YesNoGeneratorTool,
  'elimination-wheel': EliminationWheelTool,
  'team-picker': TeamPickerTool,
  'balance-game': BalanceGameTool,
  'tournament-game': TournamentTool,
  'chosung-quiz': ChosungQuizTool,
  'cps-test': CpsTestTool,
  'bingo-generator': BingoGeneratorTool,
  'stopwatch-challenge': StopwatchChallengeTool,
  'silent-shout': SilentShoutTool,
  'big-wheel': BigWheelTool,
  'hearing-age': HearingAgeTool,
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
  
  const toolsNeedingId = new Set([
    'convert-image', 'png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'webp-to-png',
    'png-to-webp', 'jpg-to-webp', 'webp-converter', 'bulk-convert',
    'gif-to-png', 'svg-to-png', 'bulk-convert-image',
    'grayscale-filter', 'image-brightness', 'image-opacity',
    'convert-audio', 'boost-audio', 'reverse-audio', 'audio-bitrate',
    'json-formatter', 'csv-to-json', 'json-to-csv', 'xml-to-json', 'yaml-to-json',
  ]);
  const needsToolId = toolsNeedingId.has(toolId);
  
  const colors = tool ? (categoryColors[tool.category] || categoryColors.pdf) : categoryColors.pdf;
  const ToolIcon = tool?.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead toolId={toolId} pageType="tool" />
      <Header />
      
      <div className="bg-muted/30 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
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

      <div className={`bg-gradient-to-b ${colors.headerBg} py-10 md:py-14`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-5">
            {ToolIcon && (
              <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <ToolIcon className={`w-8 h-8 ${colors.icon}`} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-tool-title">
                  {toolTitle}
                </h1>
                {tool && !tool.implemented && (
                  <Badge variant="outline">{t('Common.tool.comingSoon')}</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-4" data-testid="text-tool-description">
                {toolDescription || toolShortDesc}
              </p>
              {tool && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{tool.rating}</span>
                  </div>
                  <span>{formatUsageCount(tool.usageCount)} {t('Common.tool.uses', { defaultValue: 'uses' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Card>
          <CardContent className="p-6 md:p-8">
            {ToolComponent ? (
              <Suspense fallback={<ToolLoading />}>
                {needsToolId ? <ToolComponent toolId={toolId} /> : <ToolComponent />}
              </Suspense>
            ) : (
              <GenericToolPlaceholder toolId={toolId} />
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <ShareActions 
            title={toolTitle} 
            description={toolDescription || toolShortDesc} 
          />
        </div>

        <div className="mt-6 text-center">
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
