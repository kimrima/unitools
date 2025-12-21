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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { getToolsByCategory } from '@/data/tools';

const categories = [
  { id: 'pdf', icon: FileText, label: 'PDF Tools' },
  { id: 'imageEdit', icon: Image, label: 'Image Tools' },
  { id: 'imageConvert', icon: ImagePlus, label: 'Image Converter' },
  { id: 'videoAudio', icon: Film, label: 'Video Tools' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'social', icon: Share2, label: 'Social Media' },
  { id: 'developer', icon: Code, label: 'Dev & Security' },
  { id: 'calculator', icon: Calculator, label: 'Calculators' },
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
          <Link href={localizedPath('/')} className="flex items-center gap-2">
            <span className="font-extrabold text-xl" data-testid="text-logo">
              <span className="text-foreground">Uni</span>
              <span className="text-primary">Tools</span>
            </span>
          </Link>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
              {categories.map((cat) => {
                const categoryTools = getToolsByCategory(cat.id).filter(tool => tool.implemented).slice(0, 8);
                const Icon = cat.icon;
                
                return (
                  <NavigationMenuItem key={cat.id}>
                    <NavigationMenuTrigger 
                      className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-transparent data-[state=open]:bg-accent"
                      data-testid={`link-category-${cat.id}`}
                    >
                      {t(`Common.nav.${cat.id}`)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-4">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-sm">{t(`Categories.${cat.id}.name`)}</span>
                        </div>
                        {categoryTools.length > 0 ? (
                          <ul className="grid grid-cols-2 gap-1">
                            {categoryTools.map((tool) => (
                              <li key={tool.id}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={localizedPath(`/${tool.id}`)}
                                    className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    data-testid={`dropdown-tool-${tool.id}`}
                                  >
                                    {t(`Tools.${tool.id}.title`)}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            {t('Common.messages.comingSoon', { defaultValue: 'More tools coming soon!' })}
                          </div>
                        )}
                        <Link
                          href={localizedPath(`/category/${cat.id}`)}
                          className="block mt-3 pt-3 border-t text-center text-sm font-bold text-primary hover:underline"
                          data-testid={`link-view-all-${cat.id}`}
                        >
                          {t('Common.home.viewAll', { defaultValue: 'View All' })} →
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
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

            <Link href={localizedPath('/all-tools')}>
              <Button size="sm" className="font-bold" data-testid="button-search-header">
                <Search className="w-4 h-4 mr-2" />
                {t('Common.nav.search', { defaultValue: 'Search' })}
              </Button>
            </Link>

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
