import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { SiX, SiFacebook, SiLinkedin, SiInstagram } from 'react-icons/si';

const categoryTools: Record<string, string[]> = {
  pdf: [
    'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf',
    'rotate-pdf', 'pdf-page-delete', 'pdf-page-extract', 'pdf-watermark',
    'pdf-to-png', 'png-to-pdf', 'pdf-to-word', 'word-to-pdf', 'pdf-text-extract'
  ],
  imageEdit: [
    'resize-image', 'crop-image', 'compress-image', 'rotate-image', 'flip-image',
    'round-corners', 'add-border', 'image-to-base64', 'add-watermark',
    'brightness-contrast', 'blur-image', 'sharpen-image', 'grayscale-image', 'sepia-image', 'invert-colors'
  ],
  imageConvert: [
    'png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'jpg-to-webp', 'convert-image',
    'heic-to-jpg', 'gif-to-png', 'bmp-to-jpg', 'svg-to-png', 'bulk-image-convert'
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
    <footer className="bg-[hsl(222,47%,11%)] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 pb-8 border-b border-gray-700">
          <div>
            <Link href={localizedPath('/')} className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl text-white">
                Uni<span className="text-primary">Tools</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {t('Common.footer.description', { defaultValue: 'Free online tools to help you work faster. No uploads, 100% browser-based, and fast online experience.' })}
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <SiX className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <SiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <SiLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <SiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t('Common.footer.company', { defaultValue: 'Company' })}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={localizedPath('/about')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.about')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/contact')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.contact')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/pricing')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.pricing', { defaultValue: 'Pricing' })}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t('Common.footer.support', { defaultValue: 'Support' })}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.helpCenter', { defaultValue: 'Help Center' })}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.reportIssue', { defaultValue: 'Report Issue' })}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t('Common.footer.legal', { defaultValue: 'Legal' })}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={localizedPath('/privacy')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/terms')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  {t('Common.footer.cookiePolicy', { defaultValue: 'Cookie Policy' })}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-white text-sm mb-6">{t('Common.footer.quickLinks', { defaultValue: 'Quick Links' })}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {Object.entries(categoryTools).map(([category, tools]) => (
              <div key={category}>
                <h5 className="font-medium text-white text-xs mb-3 uppercase tracking-wide">
                  {t(`Categories.${category}.name`, { defaultValue: category })}
                </h5>
                <ul className="space-y-1.5">
                  {tools.slice(0, 5).map((toolId) => (
                    <li key={toolId}>
                      <Link
                        href={localizedPath(`/${toolId}`)}
                        className="text-xs text-gray-400 hover:text-white transition-colors block truncate"
                        data-testid={`link-footer-tool-${toolId}`}
                      >
                        {t(`Tools.${toolId}.title`, { defaultValue: toolId })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} UniTools. {t('Common.footer.allRightsReserved')}.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{t('Common.footer.madeWith', { defaultValue: 'Made with love for productivity' })}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
