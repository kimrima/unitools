import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  VolumeX, Play, X, Zap, Check, SkipForward, Trophy, RotateCcw, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playFanfare } from '@/lib/sounds';

const EXAMPLE_WORDS_KO = ['아이스크림', '스마트폰', '에어컨', '초콜릿', '자전거', '피아노', '냉장고', '헬리콥터', '해바라기', '트램펄린'];
const EXAMPLE_WORDS_EN = ['Ice Cream', 'Smartphone', 'Sunglasses', 'Chocolate', 'Bicycle', 'Piano', 'Refrigerator', 'Helicopter', 'Sunflower', 'Trampoline'];

const TIME_OPTIONS = [30, 60, 90, 120, 180];

export default function SilentShoutTool() {
  const { t, i18n } = useTranslation();

  const [words, setWords] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeLimit, setTimeLimit] = useState('60');
  const [fontSize, setFontSize] = useState([80]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showWord, setShowWord] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shuffledWordsRef = useRef<string[]>([]);

  const currentWord = shuffledWordsRef.current[currentIndex];

  const addWords = (text: string) => {
    const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s && !words.includes(s));
    if (parts.length > 0) {
      setWords([...words, ...parts]);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      addWords(inputText);
    }
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const loadExamples = () => {
    const examples = i18n.language === 'ko' ? EXAMPLE_WORDS_KO : EXAMPLE_WORDS_EN;
    setWords(examples);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = useCallback(() => {
    if (words.length < 3) return;
    
    shuffledWordsRef.current = shuffleArray(words);
    setCurrentIndex(0);
    setTimeLeft(parseInt(timeLimit));
    setCorrectCount(0);
    setPassCount(0);
    setIsGameOver(false);
    setShowWord(false);
    setIsPlaying(true);
    playClick();
  }, [words, timeLimit]);

  const nextWord = useCallback(() => {
    if (currentIndex < shuffledWordsRef.current.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowWord(false);
    } else {
      shuffledWordsRef.current = shuffleArray(words);
      setCurrentIndex(0);
      setShowWord(false);
    }
  }, [currentIndex, words]);

  const handleCorrect = useCallback(() => {
    setCorrectCount(prev => prev + 1);
    playClick();
    nextWord();
  }, [nextWord]);

  const handlePass = useCallback(() => {
    setPassCount(prev => prev + 1);
    nextWord();
  }, [nextWord]);

  const endGame = useCallback(() => {
    setIsGameOver(true);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playFanfare();
  }, []);

  const resetGame = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setPassCount(0);
    setShowWord(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isGameOver, endGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!isPlaying && !isGameOver && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <VolumeX className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">
                  {t('Tools.silent-shout.title', '고요 속의 외침')}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t('Tools.silent-shout.setupDesc', '제한 시간 안에 입모양으로 최대한 많이 맞추세요!')}
                </p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('Tools.silent-shout.inputPlaceholder', '쉼표로 구분하거나 Enter로 추가')}
                      data-testid="input-word"
                    />
                    <Button onClick={() => addWords(inputText)} disabled={!inputText.trim()}>
                      <X className="w-4 h-4 rotate-45" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadExamples}
                    className="gap-1"
                    data-testid="button-examples"
                  >
                    <Zap className="w-4 h-4" />
                    {t('Tools.silent-shout.loadExamples', '예시 불러오기')}
                  </Button>
                </CardContent>
              </Card>

              {words.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md max-h-[150px] overflow-y-auto">
                    {words.map((word, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary"
                        className="gap-1 cursor-pointer pr-1"
                        onClick={() => removeWord(i)}
                      >
                        {word}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {t('Tools.silent-shout.timeLimit', '제한 시간')}
                      </Label>
                      <Select value={timeLimit} onValueChange={setTimeLimit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map(sec => (
                            <SelectItem key={sec} value={sec.toString()}>
                              {formatTime(sec)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('Tools.silent-shout.fontSize', '글자 크기')}</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={fontSize}
                          onValueChange={setFontSize}
                          min={40}
                          max={120}
                          step={10}
                          className="flex-1"
                        />
                        <span className="text-sm w-12">{fontSize}px</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {words.length}개 제시어 (최소 3개)
                    </span>
                    <Button 
                      onClick={startGame} 
                      disabled={words.length < 3}
                      className="gap-2" 
                      data-testid="button-start"
                    >
                      <Play className="w-4 h-4" />
                      {t('Tools.silent-shout.start', '게임 시작')}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {isPlaying && !isGameOver && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={timeLeft <= 10 ? "destructive" : "outline"} 
                    className={`text-xl px-4 py-2 font-mono ${timeLeft <= 10 ? 'animate-pulse' : ''}`}
                  >
                    <Timer className="w-5 h-5 mr-2" />
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <Check className="w-3 h-3" />
                    {correctCount}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <SkipForward className="w-3 h-3" />
                    {passCount}
                  </Badge>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-0">
                  <div 
                    className="min-h-[250px] flex items-center justify-center p-8 cursor-pointer select-none"
                    onClick={() => setShowWord(true)}
                  >
                    <AnimatePresence mode="wait">
                      {showWord ? (
                        <motion.p 
                          key={`word-${currentIndex}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="font-bold text-center break-keep text-primary"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {currentWord}
                        </motion.p>
                      ) : (
                        <motion.div 
                          key="hidden"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-center space-y-4"
                        >
                          <VolumeX className="w-20 h-20 mx-auto text-muted-foreground" />
                          <p className="text-xl text-muted-foreground">
                            {t('Tools.silent-shout.clickToReveal', '클릭하여 제시어 보기')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={handleCorrect}
                  className="h-16 text-lg gap-2 bg-green-600 hover:bg-green-700"
                  data-testid="button-correct"
                >
                  <Check className="w-6 h-6" />
                  {t('Tools.silent-shout.correct', '맞춤')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePass}
                  className="h-16 text-lg gap-2"
                  data-testid="button-pass"
                >
                  <SkipForward className="w-6 h-6" />
                  {t('Tools.silent-shout.pass', '패스')}
                </Button>
              </div>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={resetGame}>
                  {t('Tools.silent-shout.quit', '그만하기')}
                </Button>
              </div>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
                </motion.div>
                <h2 className="text-3xl font-bold">
                  {t('Tools.silent-shout.gameOver', '게임 종료!')}
                </h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-green-500">{correctCount}</div>
                      <div className="text-muted-foreground flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        {t('Tools.silent-shout.correctCount', '정답')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-muted-foreground">{passCount}</div>
                      <div className="text-muted-foreground flex items-center justify-center gap-1">
                        <SkipForward className="w-4 h-4" />
                        {t('Tools.silent-shout.passCount', '패스')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} className="gap-2" data-testid="button-restart">
                  <RotateCcw className="w-4 h-4" />
                  {t('Tools.silent-shout.playAgain', '다시 하기')}
                </Button>
                <Button variant="outline" onClick={resetGame} data-testid="button-back">
                  {t('Tools.silent-shout.back', '목록으로')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
