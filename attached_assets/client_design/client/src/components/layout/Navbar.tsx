import { Link, useLocation } from "wouter";
import { Search, Menu, X, ChevronDown, Zap, Globe, User, LogOut, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categories, tools } from "@/lib/tools-data";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isPremium = user?.subscriptionTier === "premium";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Text Only, Minimalist */}
        <Link href="/" className="flex items-center gap-2 group mr-10 relative z-50">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            U
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Uni<span className="text-primary">Tools</span>.
          </span>
        </Link>

        {/* Desktop Nav - Clean & spaced */}
        <div className="hidden lg:flex items-center gap-1 mr-auto">
          {categories.map((cat) => (
            <DropdownMenu 
              key={cat.id} 
              open={openCategory === cat.id} 
              onOpenChange={(isOpen) => {
                if (isOpen) setOpenCategory(cat.id);
                else if (openCategory === cat.id) setOpenCategory(null);
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`
                    flex items-center gap-1.5 font-medium transition-all rounded-full px-4 py-2 h-10
                    ${openCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}
                  `}
                >
                  {t(`categories.${cat.id}`, cat.name)} 
                  <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${openCategory === cat.id ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 p-2 shadow-xl shadow-slate-200/50 border-slate-100 rounded-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 mt-2 bg-white/95 backdrop-blur-sm">
                <div className="px-3 py-2.5 text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-2 bg-primary/5 rounded-xl">
                  <cat.icon className="w-3.5 h-3.5" />
                  {t(`categories.${cat.id}`, cat.name)}
                </div>
                <div className="max-h-[400px] overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                  {tools.filter(t => t.category === cat.id).map(tool => (
                    <DropdownMenuItem key={tool.id} className="cursor-pointer group py-2.5 px-3 rounded-lg focus:bg-slate-50 focus:text-primary transition-all" onClick={() => setLocation(`/tool/${tool.id}`)}>
                      <span className="font-medium text-slate-700 group-hover:text-primary transition-colors text-sm">{t(`tools.${tool.id}.title`, tool.title)}</span>
                      {tool.popular && <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{t('nav.hot', 'HOT')}</span>}
                    </DropdownMenuItem>
                  ))}
                  {tools.filter(t => t.category === cat.id).length === 0 && (
                    <div className="px-2 py-4 text-sm text-slate-400 italic text-center">
                      {t('nav.more_coming', 'More tools coming soon')}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Search, Language & CTA */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('nav.search_placeholder')} 
              className="pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:border-primary/30 rounded-full text-sm w-40 focus:w-60 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300"
            />
          </div>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-slate-50 text-slate-600 hover:text-primary hover:bg-slate-100">
                 <span className="text-lg leading-none">{currentLang.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-1">
              {languages.map((lang) => (
                 <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer gap-2 font-medium ${i18n.language === lang.code ? 'bg-primary/5 text-primary' : ''}`}
                 >
                    <span className="text-lg">{lang.flag}</span> {lang.name}
                 </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-primary/10 text-primary hover:bg-primary/20" data-testid="button-user-menu">
                  {isPremium ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-1.5 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900" data-testid="text-username">{user?.username}</p>
                  <p className="text-xs text-slate-500 mt-0.5" data-testid="text-subscription-tier">
                    {isPremium ? "Premium Member 👑" : "Free Tier"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {!isPremium && (
                  <Link href="/pricing">
                    <DropdownMenuItem className="cursor-pointer" data-testid="link-upgrade">
                      <Crown className="w-4 h-4 mr-2 text-amber-500" />
                      Upgrade to Premium
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800 shadow-none" data-testid="button-signin">
                {t('nav.signin')}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu - Fixed Overlay */}
      <div 
        className={`md:hidden fixed inset-x-0 bottom-0 top-[80px] z-[9999] bg-white overflow-y-auto overscroll-contain shadow-2xl border-t border-slate-200 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
          <div className="flex flex-col gap-2 p-4">
            <input 
              type="text" 
              placeholder={t('nav.search_placeholder')}
              className="w-full px-4 py-2 bg-slate-100 rounded-lg text-sm mb-4"
            />
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => setLocation(`/?category=${cat.id}`), 50);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-left w-full"
                data-testid={`button-category-${cat.id}`}
              >
                <div className={`p-2 rounded-md bg-slate-100 text-slate-500`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <span>{t(`categories.${cat.id}`, cat.name)}</span>
              </button>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            
            {/* Mobile Language Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
               {languages.map((lang) => (
                  <button 
                     key={lang.code}
                     onClick={() => changeLanguage(lang.code)}
                     className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap flex items-center gap-1 ${
                        i18n.language === lang.code ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600'
                     }`}
                  >
                     <span>{lang.flag}</span> {lang.name}
                  </button>
               ))}
            </div>

            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-slate-600 border border-slate-100 rounded-lg">
                  <p className="font-semibold text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500">{isPremium ? "Premium Member 👑" : "Free Tier"}</p>
                </div>
                <Link href="/admin">
                  <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>My Dashboard</Button>
                </Link>
                <Button variant="destructive" className="w-full" onClick={() => { setIsOpen(false); handleLogout(); }}>Logout</Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="w-full" onClick={() => setIsOpen(false)}>{t('nav.signin')}</Button>
              </Link>
            )}
          </div>
        </div>
    </nav>
  );
}