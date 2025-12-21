import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { allTools } from '@/data/tools';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  autoFocus?: boolean;
}

export default function SearchBar({ variant = 'compact', autoFocus = false }: SearchBarProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return allTools
      .filter((tool) => {
        const title = t(`Tools.${tool.id}.title`).toLowerCase();
        const desc = t(`Tools.${tool.id}.shortDesc`).toLowerCase();
        return title.includes(searchTerm) || desc.includes(searchTerm) || tool.id.includes(searchTerm);
      })
      .slice(0, 8);
  }, [query, t]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('Common.search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          autoFocus={autoFocus}
          className={`${isHero ? 'h-14 pl-12 pr-12 text-lg' : 'h-11 pl-10 pr-10'} rounded-full border-2 focus:border-primary`}
          data-testid="input-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isHero ? 'w-5 h-5' : 'w-4 h-4'}`}
            data-testid="button-clear-search"
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>

      {isOpen && filteredTools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-50" data-testid="search-results">
          <ul className="py-2">
            {filteredTools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={localizedPath(`/${tool.id}`)}
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  data-testid={`search-result-${tool.id}`}
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t(`Tools.${tool.id}.title`)}</p>
                    <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query && filteredTools.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg p-4 z-50" data-testid="search-no-results">
          <p className="text-sm text-muted-foreground text-center">
            {t('Common.search.noResults', { query })}
          </p>
        </div>
      )}
    </div>
  );
}
