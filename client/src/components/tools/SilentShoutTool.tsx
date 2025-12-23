import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  VolumeX, Eye, EyeOff, Shuffle, RotateCcw, 
  ChevronLeft, ChevronRight, Play, Plus, Trash2
} from 'lucide-react';

export default function SilentShoutTool() {
  const { t } = useTranslation();

  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [fontSize, setFontSize] = useState([80]);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentWord = words[currentIndex];

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

  const addWord = () => {
    if (customWord.trim()) {
      setWords([...words, customWord.trim()]);
      setCustomWord('');
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length > 0) {
      setWords([...words, ...lines]);
      setBulkInput('');
    }
  };

  const deleteWord = (index: number) => {
    const updated = words.filter((_, i) => i !== index);
    setWords(updated);
    if (currentIndex >= updated.length && updated.length > 0) {
      setCurrentIndex(updated.length - 1);
    }
  };

  const startGame = () => {
    if (words.length > 0) {
      setIsPlaying(true);
      setCurrentIndex(Math.floor(Math.random() * words.length));
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
        {!isPlaying ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <VolumeX className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">
                {t('Tools.silent-shout.title', '고요 속의 외침')}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('Tools.silent-shout.setupDesc', '제시어를 추가하고 게임을 시작하세요! 헤드폰을 쓴 사람에게 입모양으로 설명합니다.')}
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{t('Tools.silent-shout.addSingle', '개별 추가')}</h3>
                <div className="flex gap-2">
                  <Input
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder={t('Tools.silent-shout.wordPlaceholder', '제시어 입력')}
                    onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    data-testid="input-custom-word"
                  />
                  <Button 
                    onClick={addWord} 
                    disabled={!customWord.trim()}
                    data-testid="button-add"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{t('Tools.silent-shout.bulkAdd', '한번에 추가')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.silent-shout.bulkHint', '한 줄에 하나씩 입력')}
                </p>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={t('Tools.silent-shout.bulkPlaceholder', '사과\n바나나\n딸기\n수박')}
                  className="min-h-[120px] font-mono"
                  data-testid="textarea-bulk"
                />
                <Button 
                  onClick={parseBulkInput}
                  disabled={!bulkInput.trim()}
                  variant="outline"
                  className="w-full gap-2"
                  data-testid="button-parse-bulk"
                >
                  <Plus className="w-4 h-4" />
                  {t('Tools.silent-shout.parseBulk', '일괄 추가')}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="min-w-[80px]">{t('Tools.silent-shout.fontSize', '글자 크기')}</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={40}
                  max={150}
                  step={10}
                  className="flex-1"
                />
                <span className="min-w-[50px] text-right">{fontSize}px</span>
              </div>
            </div>

            {words.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold">
                    {t('Tools.silent-shout.wordList', '제시어 목록')} ({words.length})
                  </h3>
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
                      onClick={startGame}
                      className="gap-2"
                      data-testid="button-start"
                    >
                      <Play className="w-4 h-4" />
                      {t('Tools.silent-shout.start', '게임 시작')}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                  {words.map((word, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="text-sm gap-1 pr-1"
                    >
                      {word}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => deleteWord(i)}
                        data-testid={`button-delete-${i}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
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
                  className="gap-1"
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
                  {isRevealed ? (
                    <p 
                      className="font-bold text-center break-keep text-primary"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {currentWord}
                    </p>
                  ) : (
                    <div className="text-center space-y-4">
                      <EyeOff className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="text-xl text-muted-foreground">
                        {t('Tools.silent-shout.clickToReveal', '클릭하여 제시어 보기')}
                      </p>
                    </div>
                  )}
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
              <Label>{t('Tools.silent-shout.fontSize', '글자 크기')}</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={40}
                max={150}
                step={10}
                className="w-48"
              />
              <span>{fontSize}px</span>
            </div>
          </>
        )}
      </div>
    </FullscreenWrapper>
  );
}
