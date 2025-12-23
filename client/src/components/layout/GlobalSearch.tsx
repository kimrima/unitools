import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { allTools } from '@/data/tools';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredTools = useMemo(() => {
    if (!query.trim()) {
      return allTools.filter(tool => tool.implemented).slice(0, 10);
    }
    
    const searchTerm = query.toLowerCase();
    return allTools
      .filter((tool) => {
        if (!tool.implemented) return false;
        const title = t(`Tools.${tool.id}.title`).toLowerCase();
        const desc = t(`Tools.${tool.id}.shortDesc`).toLowerCase();
        return title.includes(searchTerm) || desc.includes(searchTerm) || tool.id.includes(searchTerm);
      })
      .slice(0, 12);
  }, [query, t]);

  const handleSelect = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        data-testid="button-global-search"
      >
        <Search className="w-4 h-4" />
        <span className="sr-only">{t('Common.search.placeholder')}</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t('Common.search.placeholder')}
          value={query}
          onValueChange={setQuery}
          data-testid="input-global-search"
        />
        <CommandList>
          <CommandEmpty>
            {t('Common.search.noResults', { query })}
          </CommandEmpty>
          <CommandGroup heading={query ? t('Common.search.results', { defaultValue: 'Results' }) : t('Common.search.popular', { defaultValue: 'Popular Tools' })}>
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <CommandItem
                  key={tool.id}
                  value={`${tool.id} ${t(`Tools.${tool.id}.title`)} ${t(`Tools.${tool.id}.shortDesc`)}`}
                  onSelect={handleSelect}
                  asChild
                >
                  <Link
                    href={localizedPath(`/${tool.id}`)}
                    className="flex items-center gap-3 cursor-pointer"
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
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
        <div className="border-t p-2 text-xs text-muted-foreground text-center">
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Esc</kbd>
          <span className="mx-2">{t('Common.search.close', { defaultValue: 'to close' })}</span>
        </div>
      </CommandDialog>
    </>
  );
}
