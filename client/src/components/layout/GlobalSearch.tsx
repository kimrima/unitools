import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { allTools } from '@/data/tools';

interface GlobalSearchProps {
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
}

export default function GlobalSearch({ isSearching, setIsSearching }: GlobalSearchProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearching(true);
      }
      if (e.key === 'Escape' && isSearching) {
        setIsSearching(false);
        setQuery('');
        setShowResults(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isSearching, setIsSearching]);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      setIsSearching(false);
      setQuery('');
      setShowResults(false);
    }
  }, [location, setIsSearching]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return allTools
      .filter((tool) => {
        if (!tool.implemented) return false;
        const title = t(`Tools.${tool.id}.title`).toLowerCase();
        const desc = t(`Tools.${tool.id}.shortDesc`).toLowerCase();
        return title.includes(searchTerm) || desc.includes(searchTerm) || tool.id.includes(searchTerm);
      })
      .slice(0, 8);
  }, [query, t]);

  const handleClose = () => {
    setIsSearching(false);
    setQuery('');
    setShowResults(false);
  };

  if (!isSearching) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSearching(true)}
        data-testid="button-global-search"
      >
        <Search className="w-4 h-4" />
        <span className="sr-only">{t('Common.search.placeholder')}</span>
      </Button>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex items-center gap-2 max-w-2xl mx-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('Common.search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query && setShowResults(true)}
          className="h-9 pl-9 pr-3 w-full"
          data-testid="input-global-search"
        />

        {showResults && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-[100]" data-testid="global-search-results">
            {filteredTools.length > 0 ? (
              <ul className="py-1.5 max-h-80 overflow-y-auto">
                {filteredTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <li key={tool.id}>
                      <Link
                        href={localizedPath(`/${tool.id}`)}
                        onClick={handleClose}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
                        data-testid={`search-result-${tool.id}`}
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ToolIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{t(`Tools.${tool.id}.title`)}</p>
                          <p className="text-xs text-muted-foreground truncate">{t(`Tools.${tool.id}.shortDesc`)}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('Common.search.noResults', { query })}
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        data-testid="button-close-search"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
