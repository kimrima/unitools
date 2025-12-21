import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Shield, Zap, Globe } from 'lucide-react';

const categoryTools: Record<string, string[]> = {
  pdf: ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf'],
  imageConvert: ['png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'convert-image'],
  imageEdit: ['resize-image', 'crop-image', 'compress-image'],
  videoAudio: ['video-to-gif'],
  developer: ['json-formatter', 'base64-encode', 'hash-generator'],
  calculator: ['unit-converter', 'percentage-calculator'],
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
          {Object.entries(categoryTools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-3" data-testid={`text-footer-category-${category}`}>
                {t(`Categories.${category}.name`)}
              </h3>
              <ul className="space-y-2">
                {tools.map((toolId) => (
                  <li key={toolId}>
                    <Link
                      href={localizedPath(`/${toolId}`)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href={localizedPath('/privacy')} className="hover:text-foreground transition-colors">
              {t('Common.footer.privacy')}
            </Link>
            <Link href={localizedPath('/terms')} className="hover:text-foreground transition-colors">
              {t('Common.footer.terms')}
            </Link>
            <Link href={localizedPath('/contact')} className="hover:text-foreground transition-colors">
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
