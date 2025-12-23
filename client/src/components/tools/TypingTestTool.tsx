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
      "백문이 불여일견이다.",
      "시작이 반이다.",
      "고생 끝에 낙이 온다.",
      "뜻이 있는 곳에 길이 있다.",
      "낮말은 새가 듣고 밤말은 쥐가 듣는다.",
      "호랑이도 제 말 하면 온다.",
      "세 살 버릇 여든까지 간다.",
      "아는 것이 힘이다.",
    ],
    medium: [
      "좋은 일을 하는 유일한 방법은 하는 일을 사랑하는 것입니다. 아직 찾지 못했다면 계속 찾으세요.",
      "어려움 속에 기회가 있습니다. 성공은 끝이 아니고, 실패는 치명적이지 않습니다.",
      "인생은 다른 계획을 세우느라 바쁠 때 일어나는 것입니다. 배고파라, 어리석어라.",
      "오늘 할 수 있는 일을 내일로 미루지 마세요. 시간은 금보다 귀합니다.",
      "실패를 두려워하지 마세요. 실패는 성공으로 가는 길의 일부입니다.",
      "당신의 한계는 당신의 마음에 있습니다. 마음을 바꾸면 한계도 바뀝니다.",
      "작은 진전도 여전히 진전입니다. 매일 조금씩 나아지세요.",
      "꿈은 이루어진다. 단지 포기하지 않는 사람에게만 해당됩니다.",
      "노력 없이 얻어지는 것은 없습니다. 열심히 하면 반드시 보상받습니다.",
      "지금 당장 시작하세요. 완벽한 때는 오지 않습니다.",
    ],
    hard: [
      "살면서 가장 영광스러운 것은 넘어지지 않는 것이 아니라, 넘어질 때마다 다시 일어나는 것입니다. 미래는 자신의 꿈의 아름다움을 믿는 사람들의 것입니다.",
      "가장 어두운 순간에 빛을 보기 위해 집중해야 합니다. 유일하게 불가능한 여정은 시작하지 않는 여정입니다.",
      "성공은 목적지가 아니라 여정입니다. 중요한 것은 어디에 도달했느냐가 아니라 그 과정에서 누구로 성장했느냐입니다.",
      "두려움을 느끼더라도 용기를 가지고 앞으로 나아가세요. 용기는 두려움이 없는 것이 아니라 두려움을 극복하는 것입니다.",
      "변화를 두려워하지 마세요. 모든 성장은 변화에서 시작됩니다. 편안한 영역을 벗어날 때 진정한 발전이 일어납니다.",
      "인내심을 가지세요. 위대한 일은 하루아침에 이루어지지 않습니다. 꾸준한 노력만이 지속적인 성공을 보장합니다.",
      "자신을 믿으세요. 당신은 생각하는 것보다 훨씬 더 강하고 능력이 있습니다. 자신감이 성공의 첫 번째 비결입니다.",
      "실패에서 배우세요. 모든 실패는 성공으로 가는 소중한 교훈입니다. 넘어져도 무언가를 배우고 일어나세요.",
    ],
  },
  en: {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "A journey of a thousand miles begins with a single step.",
      "To be or not to be, that is the question.",
      "All that glitters is not gold.",
      "Practice makes perfect.",
      "Actions speak louder than words.",
      "Time flies when you're having fun.",
      "Every cloud has a silver lining.",
      "Knowledge is power.",
      "Better late than never.",
      "The early bird catches the worm.",
      "When in Rome, do as the Romans do.",
    ],
    medium: [
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.",
      "In the middle of difficulty lies opportunity. Success is not final, failure is not fatal.",
      "Life is what happens when you're busy making other plans. Stay hungry, stay foolish.",
      "Believe you can and you're halfway there. Your limitation is only your imagination.",
      "Success is not the key to happiness. Happiness is the key to success in life.",
      "The future depends on what you do today. Don't wait for tomorrow to start.",
      "Dream big and dare to fail. Great things never came from comfort zones.",
      "Your time is limited. Don't waste it living someone else's life.",
      "The best time to plant a tree was twenty years ago. The second best time is now.",
      "Hard work beats talent when talent doesn't work hard.",
    ],
    hard: [
      "The greatest glory in living lies not in never falling, but in rising every time we fall. The future belongs to those who believe in the beauty of their dreams.",
      "It is during our darkest moments that we must focus to see the light. The only impossible journey is the one you never begin.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep moving forward regardless of obstacles.",
      "The difference between ordinary and extraordinary is that little extra. Push yourself beyond your limits every single day.",
      "Champions keep playing until they get it right. Persistence and determination alone are omnipotent in achieving success.",
      "You miss one hundred percent of the shots you don't take. Fear of failure should never be a reason to avoid trying.",
      "The only person you are destined to become is the person you decide to be. Take control of your destiny today.",
      "Excellence is not a skill, it is an attitude. How you do anything is how you do everything in life.",
    ],
  },
  ja: {
    easy: [
      "速い茶色の狐が怠けた犬を飛び越えます。",
      "千里の道も一歩から始まります。",
      "継続は力なり。",
      "七転び八起き。",
      "急がば回れ。",
      "石の上にも三年。",
      "塵も積もれば山となる。",
      "猿も木から落ちる。",
      "時は金なり。",
      "百聞は一見に如かず。",
      "能ある鷹は爪を隠す。",
      "二兎を追う者は一兎をも得ず。",
    ],
    medium: [
      "偉大な仕事をする唯一の方法は、自分がしていることを愛することです。まだ見つかっていないなら、探し続けてください。",
      "困難の中にチャンスがあります。成功は終わりではなく、失敗は致命的ではありません。",
      "人生は他の計画を立てるのに忙しいときに起こるものです。ハングリーであれ、愚かであれ。",
      "自分を信じなさい。あなたは思っている以上に強いです。可能性は無限大です。",
      "今日できることを明日に延ばすな。時間は最も貴重な資源です。",
      "失敗を恐れるな。失敗は成功への道の一部です。挑戦し続けなさい。",
      "小さな進歩も進歩です。毎日少しずつ成長しましょう。",
      "夢は叶う。ただし、諦めない人にだけ当てはまります。",
    ],
    hard: [
      "生きる上での最大の栄光は、決して転ばないことではなく、転ぶたびに立ち上がることにあります。未来は自分の夢の美しさを信じる人々のものです。",
      "最も暗い瞬間にこそ、光を見るために集中しなければなりません。唯一不可能な旅は、始めない旅です。勇気を持って一歩踏み出しましょう。",
      "成功は目的地ではなく旅です。重要なのはどこに到達したかではなく、その過程で誰に成長したかです。毎日少しずつ前進しましょう。",
      "変化を恐れないでください。すべての成長は変化から始まります。快適な領域を出るとき、真の発展が起こります。",
    ],
  },
  es: {
    easy: [
      "El rápido zorro marrón salta sobre el perro perezoso.",
      "Un viaje de mil millas comienza con un solo paso.",
      "Ser o no ser, esa es la cuestión.",
      "No todo lo que brilla es oro.",
      "La práctica hace al maestro.",
      "Más vale tarde que nunca.",
      "El tiempo vuela cuando te diviertes.",
      "Quien no arriesga, no gana.",
      "A mal tiempo, buena cara.",
      "El saber no ocupa lugar.",
      "La paciencia es la madre de la ciencia.",
      "Obras son amores, que no buenas razones.",
    ],
    medium: [
      "La única manera de hacer un gran trabajo es amar lo que haces. Si no lo has encontrado, sigue buscando.",
      "En medio de la dificultad yace la oportunidad. El éxito no es definitivo, el fracaso no es fatal.",
      "La vida es lo que sucede mientras estás ocupado haciendo otros planes. Mantente hambriento, mantente loco.",
      "Cree que puedes y ya habrás recorrido la mitad del camino. Tu limitación es solo tu imaginación.",
      "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito en la vida.",
      "El futuro depende de lo que hagas hoy. No esperes a mañana para empezar.",
      "Sueña en grande y atrévete a fracasar. Las grandes cosas nunca vienen de zonas de confort.",
      "Tu tiempo es limitado. No lo desperdicies viviendo la vida de otra persona.",
    ],
    hard: [
      "La mayor gloria de vivir no está en no caer nunca, sino en levantarnos cada vez que caemos. El futuro pertenece a quienes creen en la belleza de sus sueños.",
      "Es durante nuestros momentos más oscuros cuando debemos concentrarnos para ver la luz. El único viaje imposible es el que nunca comienzas.",
      "El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta. Sigue adelante sin importar los obstáculos.",
      "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra. Supérate más allá de tus límites cada día.",
    ],
  },
  fr: {
    easy: [
      "Le rapide renard brun saute par-dessus le chien paresseux.",
      "Un voyage de mille lieues commence par un seul pas.",
      "Être ou ne pas être, telle est la question.",
      "Tout ce qui brille n'est pas or.",
      "C'est en forgeant qu'on devient forgeron.",
      "Mieux vaut tard que jamais.",
      "Le temps passe vite quand on s'amuse.",
      "Qui ne risque rien n'a rien.",
      "Après la pluie, le beau temps.",
      "Le savoir est le pouvoir.",
      "La patience est mère de toutes les vertus.",
      "Les actes valent mieux que les paroles.",
    ],
    medium: [
      "La seule façon de faire du bon travail est d'aimer ce que vous faites. Si vous ne l'avez pas encore trouvé, continuez à chercher.",
      "Au milieu de la difficulté se trouve l'opportunité. Le succès n'est pas final, l'échec n'est pas fatal.",
      "La vie est ce qui arrive quand on est occupé à faire d'autres projets. Restez affamé, restez fou.",
      "Croyez que vous pouvez et vous avez déjà fait la moitié du chemin. Votre limitation n'est que votre imagination.",
      "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès dans la vie.",
      "L'avenir dépend de ce que vous faites aujourd'hui. N'attendez pas demain pour commencer.",
      "Rêvez grand et osez échouer. Les grandes choses ne viennent jamais des zones de confort.",
      "Votre temps est limité. Ne le gaspillez pas à vivre la vie de quelqu'un d'autre.",
    ],
    hard: [
      "La plus grande gloire de vivre ne réside pas dans le fait de ne jamais tomber, mais de se relever à chaque chute. L'avenir appartient à ceux qui croient en la beauté de leurs rêves.",
      "C'est pendant nos moments les plus sombres que nous devons nous concentrer pour voir la lumière. Le seul voyage impossible est celui que vous ne commencez jamais.",
      "Le succès n'est pas définitif, l'échec n'est pas fatal: c'est le courage de continuer qui compte. Avancez quels que soient les obstacles.",
      "La différence entre l'ordinaire et l'extraordinaire est ce petit extra. Dépassez vos limites chaque jour sans exception.",
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
