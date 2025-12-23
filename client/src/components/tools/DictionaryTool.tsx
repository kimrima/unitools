import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WikiResult {
  title: string;
  extract: string;
  pageUrl: string;
}

const LANGUAGES = [
  { code: 'ko', name: '한국어', wiki: 'ko' },
  { code: 'en', name: 'English', wiki: 'en' },
  { code: 'ja', name: '日本語', wiki: 'ja' },
  { code: 'es', name: 'Español', wiki: 'es' },
  { code: 'fr', name: 'Français', wiki: 'fr' },
  { code: 'de', name: 'Deutsch', wiki: 'de' },
  { code: 'zh', name: '中文', wiki: 'zh' },
  { code: 'pt', name: 'Português', wiki: 'pt' },
  { code: 'ru', name: 'Русский', wiki: 'ru' },
  { code: 'it', name: 'Italiano', wiki: 'it' },
];

export default function DictionaryTool() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(i18n.language.split('-')[0] || 'en');
  const [result, setResult] = useState<WikiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const searchWikipedia = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const lang = LANGUAGES.find(l => l.code === language)?.wiki || 'en';
      const searchUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.trim())}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      
      if (data.type === 'disambiguation') {
        setResult({
          title: data.title,
          extract: t('Tools.dictionary.disambiguationNote') + '\n\n' + (data.extract || ''),
          pageUrl: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        });
      } else if (data.extract) {
        setResult({
          title: data.title,
          extract: data.extract,
          pageUrl: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      toast({
        title: t('Common.messages.error'),
        description: t('Tools.dictionary.searchError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, language, t, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWikipedia();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t('Tools.dictionary.inputPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="input-search-query"
              />
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px]" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={searchWikipedia} disabled={!query.trim() || isLoading} data-testid="button-search">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {t('Common.actions.search')}
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {notFound && !isLoading && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {t('Tools.dictionary.notFound')}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      {t('Tools.dictionary.notFoundHint')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !isLoading && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg" data-testid="text-result-title">{result.title}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.pageUrl, '_blank')}
                    data-testid="button-open-wiki"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Wikipedia
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-result-extract">
                  {result.extract}
                </p>
              </CardContent>
            </Card>
          )}

          {!result && !isLoading && !notFound && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('Tools.dictionary.enterWord')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('Tools.dictionary.poweredBy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
