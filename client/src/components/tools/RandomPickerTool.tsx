import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dice6, Trash2, RefreshCw, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RandomPickerTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [count, setCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const pickWinners = () => {
    const items = input.split('\n').filter(line => line.trim());
    if (items.length === 0) return;
    
    const pickCount = Math.min(count, items.length);
    
    setIsAnimating(true);
    
    let animationCount = 0;
    const maxAnimations = 10;
    
    const animate = () => {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setWinners(shuffled.slice(0, pickCount));
      animationCount++;
      
      if (animationCount < maxAnimations) {
        setTimeout(animate, 100);
      } else {
        setIsAnimating(false);
        toast({
          title: t('Common.messages.complete'),
          description: t('Tools.random-picker.picked', { count: pickCount }),
        });
      }
    };
    
    animate();
  };

  const handleShare = async () => {
    if (winners.length === 0) return;
    
    const text = `${t('Tools.random-picker.winnersTitle')}:\n${winners.join('\n')}`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: t('Common.messages.complete'),
          description: t('Common.actions.copy'),
        });
      }
    } catch (error) {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleReset = () => {
    setInput('');
    setWinners([]);
    setCount(1);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.random-picker.inputLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  disabled={!input}
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder={t('Tools.random-picker.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[250px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>{t('Tools.random-picker.countLabel')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="w-20"
                    data-testid="input-count"
                  />
                </div>
                
                <Button
                  onClick={pickWinners}
                  disabled={!input || isAnimating}
                  data-testid="button-pick"
                >
                  {isAnimating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Dice6 className="h-4 w-4 mr-2" />
                  )}
                  {t('Tools.random-picker.pick')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.random-picker.resultLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  disabled={winners.length === 0}
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="min-h-[250px] rounded-lg border bg-muted/30 p-4">
                {winners.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Dice6 className="h-12 w-12 mx-auto mb-2" />
                      <p>{t('Tools.random-picker.noResult')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {winners.map((winner, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 ${isAnimating ? 'animate-pulse' : ''}`}
                      >
                        <Badge variant="default">{index + 1}</Badge>
                        <span className="font-medium">{winner}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
