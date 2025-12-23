import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  VolumeX, Eye, EyeOff, Shuffle,
  ChevronLeft, ChevronRight, Play, Plus, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLE_WORDS_KO = ['아이스크림', '스마트폰', '에어컨', '초콜릿', '자전거', '피아노'];
const EXAMPLE_WORDS_EN = ['Ice Cream', 'Smartphone', 'Sunglasses', 'Chocolate', 'Bicycle', 'Piano'];

export default function SilentShoutTool() {
  const { t, i18n } = useTranslation();

  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState([80]);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentWord = words[currentIndex];

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
    const updated = words.filter((_, i) => i !== index);
    setWords(updated);
    if (currentIndex >= updated.length && updated.length > 0) {
      setCurrentIndex(updated.length - 1);
    }
  };

  const loadExamples = () => {
    const examples = i18n.language === 'ko' ? EXAMPLE_WORDS_KO : EXAMPLE_WORDS_EN;
    setWords(examples);
  };

  const nextWord = () => {
    setCurrentIndex((currentIndex + 1) % words.length);
    setIsRevealed(false);
  };

  const prevWord = () => {
    setCurrentIndex((currentIndex - 1 + words.length) % words.length);
    setIsRevealed(false);
  };

  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setIsRevealed(false);
  };

  const startGame = () => {
    if (words.length > 0) {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setIsPlaying(true);
      setCurrentIndex(0);
      setIsRevealed(false);
    }
  };

  const goBack = () => {
    setIsPlaying(false);
    setIsRevealed(false);
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!isPlaying ? (
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
                  {t('Tools.silent-shout.setupDesc', '제시어를 추가하고 게임을 시작하세요!')}
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
                      <Plus className="w-4 h-4" />
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
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md max-h-[200px] overflow-y-auto">
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

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {words.length}개 제시어
                    </span>
                    <Button onClick={startGame} className="gap-2" data-testid="button-start">
                      <Play className="w-4 h-4" />
                      {t('Tools.silent-shout.start', '게임 시작')}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {currentIndex + 1} / {words.length}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shuffleWords}
                    className="gap-1"
                    data-testid="button-shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goBack}
                    data-testid="button-back"
                  >
                    {t('Tools.silent-shout.back', '목록으로')}
                  </Button>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-0">
                  <div 
                    className="min-h-[300px] flex items-center justify-center p-8 cursor-pointer"
                    onClick={() => setIsRevealed(!isRevealed)}
                  >
                    <AnimatePresence mode="wait">
                      {isRevealed ? (
                        <motion.p 
                          key="word"
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
                          <EyeOff className="w-16 h-16 mx-auto text-muted-foreground" />
                          <p className="text-xl text-muted-foreground">
                            {t('Tools.silent-shout.clickToReveal', '클릭하여 제시어 보기')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevWord}
                  className="gap-2"
                  data-testid="button-prev"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t('Tools.silent-shout.prev', '이전')}
                </Button>

                <Button
                  variant={isRevealed ? "secondary" : "default"}
                  size="lg"
                  onClick={() => setIsRevealed(!isRevealed)}
                  className="gap-2"
                  data-testid="button-toggle"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      {t('Tools.silent-shout.hide', '숨기기')}
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      {t('Tools.silent-shout.show', '보기')}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextWord}
                  className="gap-2"
                  data-testid="button-next"
                >
                  {t('Tools.silent-shout.next', '다음')}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">{t('Tools.silent-shout.fontSize', '글자 크기')}</span>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={40}
                  max={150}
                  step={10}
                  className="w-48"
                />
                <span className="text-sm w-12">{fontSize}px</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
