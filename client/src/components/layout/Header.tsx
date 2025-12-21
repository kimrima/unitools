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
  FileText,
  Image,
  ImagePlus,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
  Globe,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const categories = [
  { id: 'pdf', icon: FileText },
  { id: 'imageConvert', icon: Image },
  { id: 'imageEdit', icon: ImagePlus },
  { id: 'videoAudio', icon: Film },
  { id: 'text', icon: Type },
  { id: 'social', icon: Share2 },
  { id: 'developer', icon: Code },
  { id: 'calculator', icon: Calculator },
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href={localizedPath('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            <span className="font-bold text-xl hidden sm:block" data-testid="text-logo">
              {t('Common.siteName')}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={localizedPath(`/category/${cat.id}`)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                  data-testid={`link-category-${cat.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{t(`Common.nav.${cat.id}`)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5" data-testid="button-language">
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
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
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
