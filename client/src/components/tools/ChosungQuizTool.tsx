import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Play, RotateCcw, Eye, EyeOff, Shuffle, Trophy, 
  Plus, Sparkles, Check, X, ChevronRight, Trash2
} from 'lucide-react';

interface Quiz {
  answer: string;
  chosung: string;
  hint?: string;
}

const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function getChosung(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const chosungIndex = Math.floor((code - 0xAC00) / 588);
      result += CHOSUNG_LIST[chosungIndex];
    } else if (char === ' ') {
      result += ' ';
    } else {
      result += char;
    }
  }
  return result;
}

type GameState = 'setup' | 'playing' | 'revealed' | 'correct';

export default function ChosungQuizTool() {
  const { t } = useTranslation();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [bulkInput, setBulkInput] = useState('');

  const currentQuiz = quizzes[currentIndex];

  const shuffleQuizzes = useCallback(() => {
    const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
    setQuizzes(shuffled);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowHint(false);
    setScore(0);
  }, [quizzes]);

  const startQuiz = () => {
    if (quizzes.length > 0) {
      setGameState('playing');
      setCurrentIndex(0);
      setScore(0);
      setUserAnswer('');
      setShowHint(false);
    }
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
      setGameState('setup');
    }
  };

  const addCustomQuiz = () => {
    if (customWord.trim()) {
      const newQuiz: Quiz = {
        answer: customWord.trim(),
        chosung: getChosung(customWord.trim()),
        hint: customHint.trim() || undefined,
      };
      setQuizzes([...quizzes, newQuiz]);
      setCustomWord('');
      setCustomHint('');
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    const newQuizzes: Quiz[] = [];
    
    for (const line of lines) {
      const parts = line.split(/[,|]/);
      const word = parts[0]?.trim();
      const hint = parts[1]?.trim();
      
      if (word) {
        newQuizzes.push({
          answer: word,
          chosung: getChosung(word),
          hint: hint || undefined,
        });
      }
    }
    
    if (newQuizzes.length > 0) {
      setQuizzes([...quizzes, ...newQuizzes]);
      setBulkInput('');
    }
  };

  const deleteQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const goBack = () => {
    setGameState('setup');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      checkAnswer();
    }
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {gameState === 'setup' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">
                {t('Tools.chosung-quiz.title', '초성 퀴즈')}
              </h2>
              <p className="text-muted-foreground">
                {t('Tools.chosung-quiz.setupDesc', '퀴즈 단어를 추가하고 게임을 시작하세요!')}
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{t('Tools.chosung-quiz.addSingle', '개별 추가')}</h3>
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
                      {t('Tools.chosung-quiz.preview', '초성')}: <strong className="text-primary text-lg">{getChosung(customWord)}</strong>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('Tools.chosung-quiz.customHint', '힌트 (선택)')}</Label>
                  <Input
                    value={customHint}
                    onChange={(e) => setCustomHint(e.target.value)}
                    placeholder={t('Tools.chosung-quiz.hintPlaceholder', '힌트 입력 (선택사항)')}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomQuiz()}
                    data-testid="input-custom-hint"
                  />
                </div>
                <Button 
                  onClick={addCustomQuiz}
                  disabled={!customWord.trim()}
                  className="w-full gap-2"
                  data-testid="button-add-quiz"
                >
                  <Plus className="w-4 h-4" />
                  {t('Tools.chosung-quiz.addQuiz', '퀴즈 추가')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{t('Tools.chosung-quiz.bulkAdd', '한번에 추가')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.chosung-quiz.bulkHint', '한 줄에 하나씩, 쉼표로 힌트 구분 (선택)')}
                </p>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={t('Tools.chosung-quiz.bulkPlaceholder', '아이스크림, 여름에 먹는 차가운 것\n스마트폰\n컴퓨터, 일할 때 사용')}
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
                  {t('Tools.chosung-quiz.parseBulk', '일괄 추가')}
                </Button>
              </CardContent>
            </Card>

            {quizzes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold">
                    {t('Tools.chosung-quiz.quizList', '퀴즈 목록')} ({quizzes.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={shuffleQuizzes}
                      className="gap-1"
                      data-testid="button-shuffle"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={startQuiz}
                      className="gap-2"
                      data-testid="button-start"
                    >
                      <Play className="w-4 h-4" />
                      {t('Tools.chosung-quiz.start', '시작하기')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {quizzes.map((q, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 bg-muted rounded-md gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-primary mr-2">{q.chosung}</span>
                        <span className="text-sm text-muted-foreground">({q.answer})</span>
                        {q.hint && <span className="text-xs text-muted-foreground ml-2">- {q.hint}</span>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuiz(i)}
                        data-testid={`button-delete-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'revealed' || gameState === 'correct') && (
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goBack}
                className="gap-1"
                data-testid="button-back"
              >
                {t('Tools.chosung-quiz.back', '목록으로')}
              </Button>
            </div>

            <div className="flex flex-col items-center space-y-4">
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
