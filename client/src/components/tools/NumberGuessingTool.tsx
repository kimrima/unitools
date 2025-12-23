import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, ArrowUp, ArrowDown, Check } from 'lucide-react';

export default function NumberGuessingTool() {
  const { t } = useTranslation();
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<{ number: number; result: 'high' | 'low' | 'correct' }[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [range] = useState({ min: 1, max: 100 });

  const makeGuess = useCallback(() => {
    const num = parseInt(guess);
    if (isNaN(num) || num < range.min || num > range.max) return;
    
    let result: 'high' | 'low' | 'correct';
    if (num === targetNumber) {
      result = 'correct';
      setIsWon(true);
    } else if (num > targetNumber) {
      result = 'high';
    } else {
      result = 'low';
    }
    
    setAttempts(prev => [...prev, { number: num, result }]);
    setGuess('');
  }, [guess, targetNumber, range]);

  const resetGame = useCallback(() => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts([]);
    setIsWon(false);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {t('Tools.number-guessing.title', 'Guess the Number')}
              </h3>
              <p className="text-muted-foreground">
                {t('Tools.number-guessing.hint', 'I\'m thinking of a number between {{min}} and {{max}}', { min: range.min, max: range.max })}
              </p>
            </div>

            {!isWon ? (
              <div className="flex gap-2 w-full max-w-xs">
                <Input
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={t('Tools.number-guessing.enterGuess', 'Enter your guess')}
                  onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
                  min={range.min}
                  max={range.max}
                  data-testid="input-guess"
                />
                <Button onClick={makeGuess} disabled={!guess} data-testid="button-guess">
                  {t('Tools.number-guessing.guess', 'Guess')}
                </Button>
              </div>
            ) : (
              <div className="text-center p-6 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {t('Tools.number-guessing.correct', 'Correct!')}
                </div>
                <div className="text-muted-foreground mt-2">
                  {t('Tools.number-guessing.attempts', 'You got it in {{count}} attempts', { count: attempts.length })}
                </div>
              </div>
            )}

            {attempts.length > 0 && (
              <div className="w-full max-w-md">
                <Label className="mb-2 block">
                  {t('Tools.number-guessing.history', 'Your Guesses')}
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {attempts.map((attempt, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                        attempt.result === 'correct' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : attempt.result === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {attempt.number}
                      {attempt.result === 'high' && <ArrowDown className="w-4 h-4" />}
                      {attempt.result === 'low' && <ArrowUp className="w-4 h-4" />}
                      {attempt.result === 'correct' && <Check className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={resetGame} data-testid="button-reset">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('Tools.number-guessing.newGame', 'New Game')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
