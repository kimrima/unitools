import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCcw, Play } from 'lucide-react';

const SAMPLE_TEXTS: Record<string, Record<string, string[]>> = {
  ko: {
    easy: [
      "빠른 갈색 여우가 게으른 개를 뛰어넘습니다.",
      "천 리 길도 한 걸음부터 시작됩니다.",
      "하늘이 무너져도 솟아날 구멍이 있다.",
      "가는 말이 고와야 오는 말이 곱다.",
    ],
    medium: [
      "좋은 일을 하는 유일한 방법은 하는 일을 사랑하는 것입니다. 아직 찾지 못했다면 계속 찾으세요.",
      "어려움 속에 기회가 있습니다. 성공은 끝이 아니고, 실패는 치명적이지 않습니다.",
      "인생은 다른 계획을 세우느라 바쁠 때 일어나는 것입니다. 배고파라, 어리석어라.",
    ],
    hard: [
      "살면서 가장 영광스러운 것은 넘어지지 않는 것이 아니라, 넘어질 때마다 다시 일어나는 것입니다. 미래는 자신의 꿈의 아름다움을 믿는 사람들의 것입니다.",
      "가장 어두운 순간에 빛을 보기 위해 집중해야 합니다. 유일하게 불가능한 여정은 시작하지 않는 여정입니다.",
    ],
  },
  en: {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "A journey of a thousand miles begins with a single step.",
      "To be or not to be, that is the question.",
      "All that glitters is not gold.",
    ],
    medium: [
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
      "In the middle of difficulty lies opportunity. Success is not final, failure is not fatal.",
      "Life is what happens when you're busy making other plans. Stay hungry, stay foolish.",
    ],
    hard: [
      "The greatest glory in living lies not in never falling, but in rising every time we fall. The future belongs to those who believe in the beauty of their dreams.",
      "It is during our darkest moments that we must focus to see the light. The only impossible journey is the one you never begin.",
    ],
  },
  ja: {
    easy: [
      "速い茶色の狐が怠けた犬を飛び越えます。",
      "千里の道も一歩から始まります。",
      "継続は力なり。",
      "七転び八起き。",
    ],
    medium: [
      "偉大な仕事をする唯一の方法は、自分がしていることを愛することです。まだ見つかっていないなら、探し続けてください。",
      "困難の中にチャンスがあります。成功は終わりではなく、失敗は致命的ではありません。",
    ],
    hard: [
      "生きる上での最大の栄光は、決して転ばないことではなく、転ぶたびに立ち上がることにあります。未来は自分の夢の美しさを信じる人々のものです。",
    ],
  },
  es: {
    easy: [
      "El rápido zorro marrón salta sobre el perro perezoso.",
      "Un viaje de mil millas comienza con un solo paso.",
      "Ser o no ser, esa es la cuestión.",
      "No todo lo que brilla es oro.",
    ],
    medium: [
      "La única manera de hacer un gran trabajo es amar lo que haces. Si no lo has encontrado, sigue buscando.",
      "En medio de la dificultad yace la oportunidad. El éxito no es definitivo, el fracaso no es fatal.",
    ],
    hard: [
      "La mayor gloria de vivir no está en no caer nunca, sino en levantarnos cada vez que caemos. El futuro pertenece a quienes creen en la belleza de sus sueños.",
    ],
  },
  fr: {
    easy: [
      "Le rapide renard brun saute par-dessus le chien paresseux.",
      "Un voyage de mille lieues commence par un seul pas.",
      "Être ou ne pas être, telle est la question.",
      "Tout ce qui brille n'est pas or.",
    ],
    medium: [
      "La seule façon de faire du bon travail est d'aimer ce que vous faites. Si vous ne l'avez pas encore trouvé, continuez à chercher.",
      "Au milieu de la difficulté se trouve l'opportunité. Le succès n'est pas final, l'échec n'est pas fatal.",
    ],
    hard: [
      "La plus grande gloire de vivre ne réside pas dans le fait de ne jamais tomber, mais de se relever à chaque chute. L'avenir appartient à ceux qui croient en la beauté de leurs rêves.",
    ],
  },
};

export default function TypingTestTool() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] || 'en';
  const texts = SAMPLE_TEXTS[currentLang] || SAMPLE_TEXTS.en;
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [targetText, setTargetText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startTest = useCallback(() => {
    const diffTexts = texts[difficulty] || texts.easy;
    const randomText = diffTexts[Math.floor(Math.random() * diffTexts.length)];
    setTargetText(randomText);
    setTypedText('');
    setIsStarted(true);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty, texts]);

  const resetTest = useCallback(() => {
    setIsStarted(false);
    setIsFinished(false);
    setTypedText('');
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }
    
    if (value.length <= targetText.length) {
      const lastChar = value[value.length - 1];
      const expectedChar = targetText[value.length - 1];
      if (lastChar && lastChar !== expectedChar) {
        setErrors(prev => prev + 1);
      }
      setTypedText(value);
    }
    
    if (value === targetText) {
      setEndTime(Date.now());
      setIsFinished(true);
    }
  }, [startTime, targetText]);

  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime - startTime) / 60000;
    const words = targetText.split(' ').length;
    return Math.round(words / timeInMinutes);
  };

  const calculateAccuracy = () => {
    if (typedText.length === 0) return 100;
    const correctChars = typedText.split('').filter((char, i) => char === targetText[i]).length;
    return Math.round((correctChars / typedText.length) * 100);
  };

  const renderText = () => {
    return targetText.split('').map((char, i) => {
      let className = 'text-muted-foreground';
      if (i < typedText.length) {
        className = typedText[i] === char ? 'text-green-500' : 'text-red-500 bg-red-100 dark:bg-red-900/30';
      } else if (i === typedText.length) {
        className = 'bg-primary/20 text-foreground';
      }
      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {!isStarted ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="space-y-2 w-full max-w-xs">
                <Label>{t('Tools.typing-test.difficulty', 'Difficulty')}</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t('Tools.typing-test.easy', 'Easy')}</SelectItem>
                    <SelectItem value="medium">{t('Tools.typing-test.medium', 'Medium')}</SelectItem>
                    <SelectItem value="hard">{t('Tools.typing-test.hard', 'Hard')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button size="lg" onClick={startTest} data-testid="button-start">
                <Play className="mr-2 h-5 w-5" />
                {t('Tools.typing-test.start', 'Start Test')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className="text-xl md:text-2xl leading-relaxed font-mono p-4 bg-muted rounded-lg"
                data-testid="target-text"
              >
                {renderText()}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={handleInput}
                disabled={isFinished}
                className="w-full p-4 text-xl font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder={t('Tools.typing-test.placeholder', 'Start typing...')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-testid="input-typing"
              />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold" data-testid="stat-wpm">
                    {isFinished ? calculateWPM() : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">WPM</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold" data-testid="stat-accuracy">
                    {calculateAccuracy()}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('Tools.typing-test.accuracy', 'Accuracy')}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold" data-testid="stat-errors">
                    {errors}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('Tools.typing-test.errors', 'Errors')}
                  </div>
                </div>
              </div>

              {isFinished && (
                <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="text-lg font-medium text-green-700 dark:text-green-400">
                    {t('Tools.typing-test.complete', 'Test Complete!')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {calculateWPM()} WPM with {calculateAccuracy()}% accuracy
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button variant="outline" onClick={resetTest} data-testid="button-reset">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('Tools.typing-test.tryAgain', 'Try Again')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
