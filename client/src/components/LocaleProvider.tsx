import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPath, getBrowserLocale, isValidLocale, type SupportedLocale } from '@/i18n';

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [location, setLocation] = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const segments = location.split('/').filter(Boolean);
    
    if (segments[0] === '자리관') {
      return;
    }
    
    const pathLocale = getLocaleFromPath(location);
    
    if (location === '/') {
      const browserLocale = getBrowserLocale();
      setLocation(`/${browserLocale}`);
      return;
    }
    
    if (segments.length > 0 && !isValidLocale(segments[0])) {
      const browserLocale = getBrowserLocale();
      const remainingPath = segments.slice(1).join('/');
      const newPath = remainingPath ? `/${browserLocale}/${remainingPath}` : `/${browserLocale}`;
      setLocation(newPath);
      return;
    }
    
    if (i18n.language !== pathLocale) {
      i18n.changeLanguage(pathLocale);
    }
  }, [location, i18n, setLocation]);

  return <>{children}</>;
}

export function useLocale(): SupportedLocale {
  const [location] = useLocation();
  return getLocaleFromPath(location);
}

export function useLocalizedPath() {
  const locale = useLocale();
  
  return (path: string) => {
    if (path.startsWith('/')) {
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 0 && isValidLocale(segments[0])) {
        return path;
      }
      return `/${locale}${path}`;
    }
    return `/${locale}/${path}`;
  };
}
