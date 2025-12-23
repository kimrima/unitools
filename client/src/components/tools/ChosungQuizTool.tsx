import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Play, RotateCcw, Eye, EyeOff, Shuffle, Trophy, 
  Plus, Sparkles, Check, X, ChevronRight
} from 'lucide-react';

interface Quiz {
  answer: string;
  chosung: string;
  hint?: string;
  category?: string;
}

const CHOSUNG_MAP: Record<string, string> = {
  'ㄱ': 'ㄱ', 'ㄲ': 'ㄲ', 'ㄴ': 'ㄴ', 'ㄷ': 'ㄷ', 'ㄸ': 'ㄸ',
  'ㄹ': 'ㄹ', 'ㅁ': 'ㅁ', 'ㅂ': 'ㅂ', 'ㅃ': 'ㅃ', 'ㅅ': 'ㅅ',
  'ㅆ': 'ㅆ', 'ㅇ': 'ㅇ', 'ㅈ': 'ㅈ', 'ㅉ': 'ㅉ', 'ㅊ': 'ㅊ',
  'ㅋ': 'ㅋ', 'ㅌ': 'ㅌ', 'ㅍ': 'ㅍ', 'ㅎ': 'ㅎ'
};

const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function getChosung(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const chosungIndex = Math.floor((code - 0xAC00) / 588);
      result += CHOSUNG_LIST[chosungIndex];
    } else if (CHOSUNG_MAP[char]) {
      result += char;
    } else if (char === ' ') {
      result += ' ';
    } else {
      result += char;
    }
  }
  return result;
}

const defaultQuizzes: Quiz[] = [
  { answer: '아이스크림', category: '음식', hint: '여름에 먹는 차가운 것' },
  { answer: '스마트폰', category: '전자기기', hint: '항상 들고 다니는 것' },
  { answer: '대한민국', category: '나라', hint: '우리나라' },
  { answer: '자동차', category: '교통수단', hint: '바퀴가 4개' },
  { answer: '컴퓨터', category: '전자기기', hint: '일할 때 사용' },
  { answer: '축구', category: '스포츠', hint: '공을 발로 차는 운동' },
  { answer: '햄버거', category: '음식', hint: '패스트푸드' },
  { answer: '비행기', category: '교통수단', hint: '하늘을 나는 것' },
  { answer: '도서관', category: '장소', hint: '책이 많은 곳' },
  { answer: '크리스마스', category: '기념일', hint: '12월 25일' },
  { answer: '유튜브', category: '서비스', hint: '동영상 플랫폼' },
  { answer: '피아노', category: '악기', hint: '건반 악기' },
  { answer: '운동화', category: '의류', hint: '운동할 때 신는 것' },
  { answer: '냉장고', category: '가전제품', hint: '음식을 차갑게 보관' },
  { answer: '강아지', category: '동물', hint: '멍멍' },
  { answer: '고양이', category: '동물', hint: '야옹' },
  { answer: '선생님', category: '직업', hint: '학교에서 가르치는 분' },
  { answer: '치킨', category: '음식', hint: '한국인이 사랑하는 야식' },
  { answer: '지하철', category: '교통수단', hint: '도시 대중교통' },
  { answer: '삼겹살', category: '음식', hint: '구워 먹는 고기' },
  { answer: '노트북', category: '전자기기', hint: '들고 다니는 컴퓨터' },
  { answer: '카카오톡', category: '서비스', hint: '한국 메신저' },
  { answer: '편의점', category: '장소', hint: '24시간 영업' },
  { answer: '떡볶이', category: '음식', hint: '매콤한 분식' },
  { answer: '생일축하', category: '인사', hint: '생일에 하는 말' },
  { answer: '대학교', category: '장소', hint: '고등학교 다음' },
  { answer: '결혼식', category: '이벤트', hint: '부부가 되는 날' },
  { answer: '아파트', category: '건물', hint: '층층이 사는 집' },
  { answer: '신호등', category: '시설', hint: '빨강 노랑 초록' },
  { answer: '미세먼지', category: '환경', hint: '마스크 써야 하는 날' },
].map(q => ({ ...q, chosung: getChosung(q.answer) }));

type GameState = 'ready' | 'playing' | 'revealed' | 'correct';

export default function ChosungQuizTool() {
  const { t } = useTranslation();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>(defaultQuizzes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const currentQuiz = quizzes[currentIndex];

  const shuffleQuizzes = useCallback(() => {
    const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
    setQuizzes(shuffled);
    setCurrentIndex(0);
    setGameState('ready');
    setUserAnswer('');
    setShowHint(false);
    setScore(0);
  }, [quizzes]);

  const startQuiz = () => {
    setGameState('playing');
  };

  const checkAnswer = () => {
    const normalized = userAnswer.trim().replace(/\s/g, '');
    const correct = currentQuiz.answer.replace(/\s/g, '');
    
    if (normalized === correct) {
      setGameState('correct');
      setScore(score + 1);
    }
  };

  const revealAnswer = () => {
    setGameState('revealed');
  };

  const nextQuiz = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGameState('playing');
      setUserAnswer('');
      setShowHint(false);
    } else {
      setGameState('ready');
    }
  };

  const addCustomQuiz = () => {
    if (customWord.trim()) {
      const newQuiz: Quiz = {
        answer: customWord.trim(),
        chosung: getChosung(customWord.trim()),
        hint: customHint.trim() || undefined,
        category: '사용자 추가'
      };
      setQuizzes([...quizzes, newQuiz]);
      setCustomWord('');
      setCustomHint('');
      setShowAddForm(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      checkAnswer();
    }
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base px-3 py-1">
              {currentIndex + 1} / {quizzes.length}
            </Badge>
            <Badge className="gap-1">
              <Trophy className="w-3 h-3" />
              {score}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={shuffleQuizzes}
              className="gap-1"
              data-testid="button-shuffle"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tools.chosung-quiz.shuffle', '섞기')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1"
              data-testid="button-add"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tools.chosung-quiz.add', '추가')}</span>
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.chosung-quiz.customWord', '단어')}</Label>
                <Input
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder={t('Tools.chosung-quiz.wordPlaceholder', '한글 단어 입력')}
                  data-testid="input-custom-word"
                />
                {customWord && (
                  <p className="text-sm text-muted-foreground">
                    {t('Tools.chosung-quiz.preview', '초성')}: <strong>{getChosung(customWord)}</strong>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('Tools.chosung-quiz.customHint', '힌트 (선택)')}</Label>
                <Input
                  value={customHint}
                  onChange={(e) => setCustomHint(e.target.value)}
                  placeholder={t('Tools.chosung-quiz.hintPlaceholder', '힌트 입력 (선택사항)')}
                  data-testid="input-custom-hint"
                />
              </div>
              <Button 
                onClick={addCustomQuiz}
                disabled={!customWord.trim()}
                className="w-full"
                data-testid="button-add-quiz"
              >
                {t('Tools.chosung-quiz.addQuiz', '퀴즈 추가')}
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'ready' && (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
            <Sparkles className="w-16 h-16 text-primary" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {t('Tools.chosung-quiz.title', '초성 퀴즈')}
              </h2>
              <p className="text-muted-foreground">
                {t('Tools.chosung-quiz.description', '초성을 보고 단어를 맞춰보세요!')}
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={startQuiz}
              className="gap-2 text-lg px-8"
              data-testid="button-start"
            >
              <Play className="w-5 h-5" />
              {t('Tools.chosung-quiz.start', '시작하기')}
            </Button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'revealed' || gameState === 'correct') && (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {currentQuiz.category && (
                <Badge variant="secondary">
                  {currentQuiz.category}
                </Badge>
              )}
              
              <Card className="w-full max-w-lg">
                <CardContent className="p-8 text-center">
                  <p className="text-5xl md:text-7xl font-bold tracking-widest text-primary">
                    {currentQuiz.chosung}
                  </p>
                </CardContent>
              </Card>

              {currentQuiz.hint && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="gap-1"
                    data-testid="button-hint"
                  >
                    {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {t('Tools.chosung-quiz.hint', '힌트')}
                  </Button>
                  {showHint && (
                    <span className="text-muted-foreground">{currentQuiz.hint}</span>
                  )}
                </div>
              )}
            </div>

            {gameState === 'playing' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex gap-2 w-full max-w-md">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('Tools.chosung-quiz.enterAnswer', '정답을 입력하세요')}
                    className="text-lg text-center"
                    autoFocus
                    data-testid="input-answer"
                  />
                  <Button 
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    data-testid="button-check"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={revealAnswer}
                  className="text-muted-foreground"
                  data-testid="button-reveal"
                >
                  {t('Tools.chosung-quiz.giveUp', '모르겠어요')}
                </Button>
              </div>
            )}

            {gameState === 'revealed' && (
              <div className="flex flex-col items-center space-y-4">
                <Card className="border-red-500 border-2">
                  <CardContent className="p-6 text-center">
                    <X className="w-8 h-8 mx-auto text-red-500 mb-2" />
                    <p className="text-muted-foreground mb-2">
                      {t('Tools.chosung-quiz.theAnswerWas', '정답은')}
                    </p>
                    <p className="text-3xl font-bold text-red-500">
                      {currentQuiz.answer}
                    </p>
                  </CardContent>
                </Card>
                <Button onClick={nextQuiz} className="gap-2" data-testid="button-next">
                  {t('Tools.chosung-quiz.next', '다음 문제')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {gameState === 'correct' && (
              <div className="flex flex-col items-center space-y-4">
                <Card className="border-green-500 border-2">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-green-500">
                      {t('Tools.chosung-quiz.correct', '정답!')}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {currentQuiz.answer}
                    </p>
                  </CardContent>
                </Card>
                <Button onClick={nextQuiz} className="gap-2" data-testid="button-next">
                  {currentIndex < quizzes.length - 1 ? (
                    <>
                      {t('Tools.chosung-quiz.next', '다음 문제')}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {t('Tools.chosung-quiz.finish', '완료')}
                      <Trophy className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
