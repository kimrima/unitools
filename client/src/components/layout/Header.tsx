import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  FileText,
  Image,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
  Globe,
  ChevronDown,
  Menu,
  X,
  Dices,
} from 'lucide-react';
import { useState } from 'react';
import { getToolsByCategory } from '@/data/tools';
import GlobalSearch from './GlobalSearch';

const categories = [
  { id: 'pdf', icon: FileText, label: 'PDF Tools' },
  { id: 'image', icon: Image, label: 'Image Tools' },
  { id: 'videoAudio', icon: Film, label: 'Video Tools' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'social', icon: Share2, label: 'Social Media' },
  { id: 'developer', icon: Code, label: 'Dev & Security' },
  { id: 'calculator', icon: Calculator, label: 'Calculators' },
  { id: 'funMisc', icon: Dices, label: 'Fun & Misc' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    const currentPath = location.replace(`/${locale}`, '');
    i18n.changeLanguage(langCode);
    window.location.href = `/${langCode}${currentPath || ''}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link 
            href={localizedPath('/')} 
            className="flex items-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
          >
            <span className="font-extrabold text-xl" data-testid="text-logo">
              <span className="text-foreground">Uni</span>
              <span className="text-primary">Tools</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0">
            {categories.map((cat) => {
              const categoryTools = getToolsByCategory(cat.id).filter(tool => tool.implemented);
              const Icon = cat.icon;
              
              return (
                <HoverCard key={cat.id} openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Link
                      href={localizedPath(`/category/${cat.id}`)}
                      className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      data-testid={`link-category-${cat.id}`}
                    >
                      {t(`Common.nav.${cat.id}`)}
                      <ChevronDown className="w-3 h-3" />
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="w-56 p-2" sideOffset={8}>
                    <Link
                      href={localizedPath(`/category/${cat.id}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-bold text-sm">{t(`Categories.${cat.id}.name`)}</span>
                    </Link>
                    <div className="border-t my-2" />
                    {categoryTools.length > 0 ? (
                      <ul className="max-h-64 overflow-y-auto space-y-0.5">
                        {categoryTools.map((tool) => (
                          <li key={tool.id}>
                            <Link
                              href={localizedPath(`/${tool.id}`)}
                              className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              data-testid={`dropdown-tool-${tool.id}`}
                            >
                              {t(`Tools.${tool.id}.title`)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        {t('Common.messages.comingSoon', { defaultValue: 'More tools coming soon!' })}
                      </div>
                    )}
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <GlobalSearch />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 font-semibold" data-testid="button-language">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{locale.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="font-medium"
                    data-testid={`menu-item-lang-${lang.code}`}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={localizedPath(`/category/${cat.id}`)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                    data-testid={`link-mobile-category-${cat.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(`Common.nav.${cat.id}`)}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
