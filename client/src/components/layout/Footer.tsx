import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Shield, Zap, Globe } from 'lucide-react';

const categoryTools: Record<string, string[]> = {
  pdf: [
    'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf',
    'rotate-pdf', 'pdf-page-delete', 'pdf-page-extract', 'pdf-watermark',
    'pdf-to-png', 'png-to-pdf', 'pdf-to-word', 'word-to-pdf', 'pdf-text-extract'
  ],
  imageConvert: [
    'png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'jpg-to-webp', 'convert-image',
    'heic-to-jpg', 'gif-to-png', 'bmp-to-jpg', 'svg-to-png', 'bulk-image-convert'
  ],
  imageEdit: [
    'resize-image', 'crop-image', 'compress-image', 'rotate-image', 'flip-image',
    'round-corners', 'add-border', 'image-to-base64', 'add-watermark',
    'brightness-contrast', 'blur-image', 'sharpen-image', 'grayscale-image', 'sepia-image', 'invert-colors'
  ],
  videoAudio: [
    'video-to-gif', 'trim-video', 'compress-video', 'video-to-mp3', 'mute-video',
    'rotate-video', 'trim-audio', 'compress-audio', 'audio-format-convert',
    'video-format-convert', 'screen-recorder', 'voice-recorder', 'webcam-recorder'
  ],
  textData: [
    'ocr', 'pdf-text-extract', 'character-counter', 'word-counter', 'line-counter',
    'uppercase-converter', 'lowercase-converter', 'text-reverse', 'text-sort',
    'duplicate-remover', 'lorem-ipsum', 'markdown-preview', 'diff-checker'
  ],
  socialMedia: [
    'instagram-line-break', 'hashtag-generator', 'instagram-font',
    'youtube-thumbnail', 'youtube-channel-id', 'twitter-card-preview',
    'qr-generator', 'barcode-generator'
  ],
  developer: [
    'json-formatter', 'base64-encode', 'base64-decode', 'url-encode', 'url-decode',
    'sha256-hash', 'md5-hash', 'uuid-generator', 'aes-encrypt', 'aes-decrypt',
    'jwt-decoder', 'html-minify', 'css-minify', 'js-minify', 'regex-tester', 'color-converter'
  ],
  calculator: [
    'unit-converter', 'percentage-calculator', 'sales-tax-calculator', 'tip-calculator',
    'compound-interest', 'bmi-calculator', 'age-calculator', 'date-calculator',
    'timezone-converter', 'epoch-converter', 'scientific-calculator', 'random-number',
    'dice-roller', 'random-picker', 'password-generator'
  ],
};

export default function Footer() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 pb-8 border-b border-muted-foreground/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{t('Common.footer.trustClientSide')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('Common.footer.trustClientSideDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{t('Common.footer.trustFreeTools')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('Common.footer.trustFreeToolsDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{t('Common.footer.trustMultiLang')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('Common.footer.trustMultiLangDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          {Object.entries(categoryTools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-3" data-testid={`text-footer-category-${category}`}>
                {t(`Categories.${category}.name`)}
              </h3>
              <ul className="space-y-1.5">
                {tools.map((toolId) => (
                  <li key={toolId}>
                    <Link
                      href={localizedPath(`/${toolId}`)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors block truncate"
                      data-testid={`link-footer-tool-${toolId}`}
                    >
                      {t(`Tools.${toolId}.title`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-muted-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">U</span>
            </div>
            <span className="font-semibold">{t('Common.siteName')}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <Link href={localizedPath('/about')} className="hover:text-foreground transition-colors" data-testid="link-footer-about">
              {t('Common.footer.about')}
            </Link>
            <Link href={localizedPath('/privacy')} className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">
              {t('Common.footer.privacy')}
            </Link>
            <Link href={localizedPath('/terms')} className="hover:text-foreground transition-colors" data-testid="link-footer-terms">
              {t('Common.footer.terms')}
            </Link>
            <Link href={localizedPath('/contact')} className="hover:text-foreground transition-colors" data-testid="link-footer-contact">
              {t('Common.footer.contact')}
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} UniTools. {t('Common.footer.allRightsReserved')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
