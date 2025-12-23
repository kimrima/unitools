import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { allTools } from '@/data/tools';

export default function HeaderSearchBar() {
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
      .slice(0, 6);
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

  return (
    <div ref={containerRef} className="relative hidden sm:block w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          className="h-9 pl-9 pr-8 rounded-full text-sm border focus:border-primary"
          data-testid="input-header-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            data-testid="button-clear-header-search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && filteredTools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-[100]" data-testid="header-search-results">
          <ul className="py-1.5 max-h-72 overflow-y-auto">
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <li key={tool.id}>
                  <Link
                    href={localizedPath(`/${tool.id}`)}
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
                    data-testid={`header-search-result-${tool.id}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ToolIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t(`Tools.${tool.id}.title`)}</p>
                      <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isOpen && query && filteredTools.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg p-3 z-[100]" data-testid="header-search-no-results">
          <p className="text-xs text-muted-foreground text-center">
            {t('Common.search.noResults', { query })}
          </p>
        </div>
      )}
    </div>
  );
}
