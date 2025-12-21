import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { allTools } from '@/data/tools';

const categoryIds = ['pdf', 'imageEdit', 'imageConvert', 'videoAudio', 'text', 'social', 'developer', 'calculator'];

export default function Footer() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const currentYear = new Date().getFullYear();

  const getImplementedToolsByCategory = (category: string) => {
    return allTools
      .filter(tool => tool.category === category && tool.implemented)
      .slice(0, 5);
  };

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
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t('Common.footer.categories', { defaultValue: 'Categories' })}</h4>
            <ul className="space-y-2">
              {categoryIds.slice(0, 4).map(catId => (
                <li key={catId}>
                  <Link href={localizedPath(`/category/${catId}`)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {t(`Categories.${catId}.name`)}
                  </Link>
                </li>
              ))}
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
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-white text-sm mb-6">{t('Common.footer.quickLinks', { defaultValue: 'Quick Links' })}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categoryIds.map((category) => {
              const tools = getImplementedToolsByCategory(category);
              if (tools.length === 0) return null;
              
              return (
                <div key={category}>
                  <h5 className="font-medium text-white text-xs mb-3 uppercase tracking-wide">
                    {t(`Categories.${category}.name`, { defaultValue: category })}
                  </h5>
                  <ul className="space-y-1.5">
                    {tools.map((tool) => (
                      <li key={tool.id}>
                        <Link
                          href={localizedPath(`/${tool.id}`)}
                          className="text-xs text-gray-400 hover:text-white transition-colors block truncate"
                          data-testid={`link-footer-tool-${tool.id}`}
                        >
                          {t(`Tools.${tool.id}.title`, { defaultValue: tool.id })}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
