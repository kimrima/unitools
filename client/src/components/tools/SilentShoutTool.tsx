import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Volume2, VolumeX, Eye, EyeOff, Shuffle, RotateCcw, 
  ChevronLeft, ChevronRight, Play, Sparkles
} from 'lucide-react';

const defaultWords: Record<string, string[]> = {
  ko: [
    '사과', '바나나', '딸기', '수박', '포도', '오렌지', '복숭아', '망고',
    '피자', '치킨', '햄버거', '라면', '김밥', '떡볶이', '짜장면', '삼겹살',
    '강아지', '고양이', '토끼', '햄스터', '앵무새', '금붕어', '거북이',
    '축구', '야구', '농구', '테니스', '배드민턴', '탁구', '골프',
    '서울', '부산', '제주도', '경주', '전주', '강릉', '여수',
    '학교', '병원', '마트', '공원', '도서관', '카페', '영화관',
    '비행기', '기차', '버스', '택시', '자전거', '오토바이', '지하철',
    '의사', '선생님', '요리사', '소방관', '경찰관', '가수', '배우'
  ],
  en: [
    'Apple', 'Banana', 'Strawberry', 'Watermelon', 'Grape', 'Orange', 'Peach',
    'Pizza', 'Chicken', 'Hamburger', 'Pasta', 'Sushi', 'Taco', 'Steak',
    'Dog', 'Cat', 'Rabbit', 'Hamster', 'Parrot', 'Goldfish', 'Turtle',
    'Soccer', 'Baseball', 'Basketball', 'Tennis', 'Badminton', 'Golf',
    'New York', 'Paris', 'Tokyo', 'London', 'Sydney', 'Rome', 'Dubai',
    'School', 'Hospital', 'Mall', 'Park', 'Library', 'Cafe', 'Cinema',
    'Airplane', 'Train', 'Bus', 'Taxi', 'Bicycle', 'Motorcycle', 'Subway',
    'Doctor', 'Teacher', 'Chef', 'Firefighter', 'Police', 'Singer', 'Actor'
  ]
};

export default function SilentShoutTool() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ko') ? 'ko' : 'en';

  const [words, setWords] = useState<string[]>(defaultWords[lang]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [fontSize, setFontSize] = useState([80]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const randomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentIndex(randomIndex);
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
      setShowAddForm(false);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    randomWord();
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setIsRevealed(false);
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {!isPlaying ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <VolumeX className="w-20 h-20 text-primary" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {t('Tools.silent-shout.title', '고요 속의 외침')}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {t('Tools.silent-shout.description', '헤드폰을 쓴 사람에게 제시어를 보여주고, 다른 사람들이 입모양으로 설명하세요!')}
              </p>
            </div>

            <div className="space-y-4 w-full max-w-md">
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

            <Button 
              size="lg" 
              onClick={startGame}
              className="gap-2 text-lg px-8"
              data-testid="button-start"
            >
              <Play className="w-5 h-5" />
              {t('Tools.silent-shout.start', '게임 시작')}
            </Button>
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
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="gap-1"
                  data-testid="button-add"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetGame}
                  className="gap-1"
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showAddForm && (
              <Card>
                <CardContent className="p-4 flex gap-2">
                  <Input
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder={t('Tools.silent-shout.addPlaceholder', '새 단어 입력')}
                    onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    data-testid="input-custom-word"
                  />
                  <Button onClick={addWord} disabled={!customWord.trim()}>
                    {t('Tools.silent-shout.add', '추가')}
                  </Button>
                </CardContent>
              </Card>
            )}

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
