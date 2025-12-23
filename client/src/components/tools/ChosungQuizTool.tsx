import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Play, Eye, EyeOff, Shuffle, Trophy, 
  Sparkles, Check, X, ChevronRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const EXAMPLE_WORDS = ['아이스크림', '스마트폰', '컴퓨터', '냉장고', '에어컨', '자동차', '비행기', '초콜릿'];

type GameState = 'setup' | 'playing' | 'revealed' | 'correct';

export default function ChosungQuizTool() {
  const { t } = useTranslation();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inputText, setInputText] = useState('');

  const currentQuiz = quizzes[currentIndex];

  const addQuizzes = (text: string) => {
    const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
    const newQuizzes: Quiz[] = parts.map(word => ({
      answer: word,
      chosung: getChosung(word)
    }));
    if (newQuizzes.length > 0) {
      setQuizzes([...quizzes, ...newQuizzes]);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      addQuizzes(inputText);
    }
  };

  const removeQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const loadExamples = () => {
    const newQuizzes: Quiz[] = EXAMPLE_WORDS.map(word => ({
      answer: word,
      chosung: getChosung(word)
    }));
    setQuizzes(newQuizzes);
  };

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
      const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
      setQuizzes(shuffled);
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

  const goBack = () => {
    setGameState('setup');
  };

  const handleAnswerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      checkAnswer();
    }
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
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
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('Tools.chosung-quiz.inputPlaceholder', '쉼표로 구분하거나 Enter로 추가')}
                      data-testid="input-word"
                    />
                    <Button onClick={() => addQuizzes(inputText)} disabled={!inputText.trim()}>
                      {t('Tools.chosung-quiz.add', '추가')}
                    </Button>
                  </div>
                  {inputText && (
                    <p className="text-sm text-muted-foreground">
                      {t('Tools.chosung-quiz.preview', '미리보기')}: <strong className="text-primary text-lg">{getChosung(inputText)}</strong>
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={loadExamples}
                    className="w-full gap-1"
                    data-testid="button-examples"
                  >
                    <Zap className="w-4 h-4" />
                    {t('Tools.chosung-quiz.loadExamples', '예시 불러오기')}
                  </Button>
                </CardContent>
              </Card>

              {quizzes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md max-h-[200px] overflow-y-auto">
                    {quizzes.map((q, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary"
                        className="gap-2 cursor-pointer pr-1"
                        onClick={() => removeQuiz(i)}
                      >
                        <span className="text-primary font-mono">{q.chosung}</span>
                        <span className="text-muted-foreground">({q.answer})</span>
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {quizzes.length}개 문제
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={shuffleQuizzes}
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
                </div>
              )}
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'revealed' || gameState === 'correct') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
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
                  data-testid="button-back"
                >
                  {t('Tools.chosung-quiz.back', '목록으로')}
                </Button>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-8 text-center">
                    <motion.p 
                      key={currentQuiz.chosung}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl md:text-7xl font-bold tracking-widest text-primary"
                    >
                      {currentQuiz.chosung}
                    </motion.p>
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
                      onKeyDown={handleAnswerKeyDown}
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
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <Card className="border-destructive border-2">
                    <CardContent className="p-6 text-center">
                      <X className="w-8 h-8 mx-auto text-destructive mb-2" />
                      <p className="text-muted-foreground mb-2">
                        {t('Tools.chosung-quiz.theAnswerWas', '정답은')}
                      </p>
                      <p className="text-3xl font-bold text-destructive">
                        {currentQuiz.answer}
                      </p>
                    </CardContent>
                  </Card>
                  <Button onClick={nextQuiz} className="gap-2" data-testid="button-next">
                    {t('Tools.chosung-quiz.next', '다음 문제')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {gameState === 'correct' && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <Card className="border-green-500 border-2">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      </motion.div>
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
