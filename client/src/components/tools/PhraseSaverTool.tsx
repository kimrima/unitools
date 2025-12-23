import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Phrase {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = 'unitools_saved_phrases';

export default function PhraseSaverTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPhrases(JSON.parse(saved));
      } catch {
        setPhrases([]);
      }
    }
  }, []);

  const savePhrases = useCallback((newPhrases: Phrase[]) => {
    setPhrases(newPhrases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPhrases));
  }, []);

  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    
    const phrase: Phrase = {
      id: Date.now().toString(),
      text: newPhrase.trim(),
      createdAt: Date.now(),
    };
    
    savePhrases([phrase, ...phrases]);
    setNewPhrase('');
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.phrase-saver.phraseAdded'),
    });
  };

  const deletePhrase = (id: string) => {
    savePhrases(phrases.filter(p => p.id !== id));
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.phrase-saver.phraseDeleted'),
    });
  };

  const copyPhrase = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.messages.copiedToClipboard'),
    });
  };

  const startEdit = (phrase: Phrase) => {
    setEditingId(phrase.id);
    setEditText(phrase.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    
    savePhrases(phrases.map(p => 
      p.id === editingId ? { ...p, text: editText.trim() } : p
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const defaultPhrases = [
    t('Tools.phrase-saver.example1'),
    t('Tools.phrase-saver.example2'),
    t('Tools.phrase-saver.example3'),
    t('Tools.phrase-saver.example4'),
  ];

  const addDefaultPhrase = (text: string) => {
    const phrase: Phrase = {
      id: Date.now().toString(),
      text,
      createdAt: Date.now(),
    };
    savePhrases([phrase, ...phrases]);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.phrase-saver.phraseAdded'),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('Tools.phrase-saver.storageNotice')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('Tools.phrase-saver.inputPlaceholder')}
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPhrase()}
              data-testid="input-new-phrase"
            />
            <Button onClick={addPhrase} disabled={!newPhrase.trim()} data-testid="button-add-phrase">
              <Plus className="w-4 h-4 mr-2" />
              {t('Common.actions.add')}
            </Button>
          </div>

          {phrases.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('Tools.phrase-saver.suggestedPhrases')}</p>
              <div className="flex flex-wrap gap-2">
                {defaultPhrases.map((phrase, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => addDefaultPhrase(phrase)}
                    data-testid={`badge-default-${index}`}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                data-testid={`phrase-item-${phrase.id}`}
              >
                {editingId === phrase.id ? (
                  <>
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      data-testid="input-edit-phrase"
                    />
                    <Button size="icon" variant="ghost" onClick={saveEdit} data-testid="button-save-edit">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit} data-testid="button-cancel-edit">
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{phrase.text}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyPhrase(phrase.text)}
                      data-testid={`button-copy-${phrase.id}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(phrase)}
                      data-testid={`button-edit-${phrase.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePhrase(phrase.id)}
                      data-testid={`button-delete-${phrase.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {phrases.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-2">
              {t('Tools.phrase-saver.totalPhrases', { count: phrases.length })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
