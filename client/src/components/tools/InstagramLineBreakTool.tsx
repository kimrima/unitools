import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstagramLineBreakTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertLineBreaks = () => {
    const invisibleSpace = '\u2800';
    const lines = input.split('\n');
    const converted = lines.map((line, index) => {
      if (line.trim() === '' && index < lines.length - 1) {
        return invisibleSpace;
      }
      return line;
    }).join('\n');
    setOutput(converted);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.instagram-line-break.copied'),
    });
  };

  const handleShare = async () => {
    if (!output) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          text: output,
        });
      } else {
        handleCopy();
      }
    } catch (error) {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-sm">
              {t('Tools.instagram-line-break.notice')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.instagram-line-break.inputLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setInput(''); setOutput(''); }}
                  disabled={!input}
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={t('Tools.instagram-line-break.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] text-sm resize-none"
                data-testid="textarea-input"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.instagram-line-break.outputLabel')}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    disabled={!output}
                    data-testid="button-share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!output}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[300px] text-sm resize-none bg-muted/30"
                placeholder={t('Tools.instagram-line-break.outputPlaceholder')}
                data-testid="textarea-output"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={convertLineBreaks}
              disabled={!input}
              className="w-full sm:w-auto"
              data-testid="button-convert"
            >
              {t('Tools.instagram-line-break.convert')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
