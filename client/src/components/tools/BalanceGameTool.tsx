import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  RotateCcw, Trash2,
  ThumbsUp, Sparkles, ChevronLeft, ChevronRight, Play, Zap, Trophy, ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

interface UserChoice {
  question: string;
  choice: 'A' | 'B';
  chosenOption: string;
}

const EXAMPLE_QUESTIONS_KO: Question[] = [
  { optionA: '평생 여름만', optionB: '평생 겨울만', votesA: 0, votesB: 0 },
  { optionA: '투명인간 능력', optionB: '순간이동 능력', votesA: 0, votesB: 0 },
  { optionA: '과거로 시간여행', optionB: '미래로 시간여행', votesA: 0, votesB: 0 },
  { optionA: '10억 받고 10년 감옥', optionB: '지금 그대로 살기', votesA: 0, votesB: 0 },
];

const EXAMPLE_QUESTIONS_EN: Question[] = [
  { optionA: 'Summer forever', optionB: 'Winter forever', votesA: 0, votesB: 0 },
  { optionA: 'Invisibility', optionB: 'Teleportation', votesA: 0, votesB: 0 },
  { optionA: 'Travel to past', optionB: 'Travel to future', votesA: 0, votesB: 0 },
  { optionA: '$1M but 10 years jail', optionB: 'Stay as you are', votesA: 0, votesB: 0 },
];

type GamePhase = 'setup' | 'playing' | 'results';

export default function BalanceGameTool() {
  const { t, i18n } = useTranslation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);

  const currentQuestion = questions[currentIndex];
  const totalVotes = currentQuestion ? currentQuestion.votesA + currentQuestion.votesB : 0;
  const percentA = totalVotes > 0 ? Math.round((currentQuestion.votesA / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round((currentQuestion.votesB / totalVotes) * 100) : 50;

  const handleVote = (option: 'A' | 'B') => {
    const updated = [...questions];
    if (option === 'A') {
      updated[currentIndex].votesA++;
    } else {
      updated[currentIndex].votesB++;
    }
    setQuestions(updated);
    setSelectedOption(option);
    setHasVoted(true);
    
    const newChoice: UserChoice = {
      question: `${currentQuestion.optionA} vs ${currentQuestion.optionB}`,
      choice: option,
      chosenOption: option === 'A' ? currentQuestion.optionA : currentQuestion.optionB
    };
    setUserChoices(prev => {
      const existing = prev.findIndex((_, i) => i === currentIndex);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = newChoice;
        return copy;
      }
      return [...prev, newChoice];
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasVoted(false);
      setSelectedOption(null);
    } else {
      setGamePhase('results');
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setHasVoted(false);
      setSelectedOption(null);
    }
  };

  const addQuestion = () => {
    if (inputA.trim() && inputB.trim()) {
      setQuestions([...questions, {
        optionA: inputA.trim(),
        optionB: inputB.trim(),
        votesA: 0,
        votesB: 0
      }]);
      setInputA('');
      setInputB('');
    }
  };

  const loadExamples = () => {
    const examples = i18n.language === 'ko' ? EXAMPLE_QUESTIONS_KO : EXAMPLE_QUESTIONS_EN;
    setQuestions([...examples]);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }
      setHasVoted(false);
    } else {
      setQuestions([]);
      setGamePhase('setup');
    }
  };

  const resetVotes = () => {
    setQuestions(questions.map(q => ({ ...q, votesA: 0, votesB: 0 })));
    setHasVoted(false);
    setSelectedOption(null);
    setUserChoices([]);
  };

  const startGame = () => {
    if (questions.length > 0) {
      setGamePhase('playing');
      setCurrentIndex(0);
      setHasVoted(false);
      setSelectedOption(null);
      setUserChoices([]);
    }
  };

  const goBack = () => {
    setGamePhase('setup');
    setUserChoices([]);
  };

  const playAgain = () => {
    setGamePhase('playing');
    setCurrentIndex(0);
    setHasVoted(false);
    setSelectedOption(null);
    setUserChoices([]);
    resetVotes();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isB: boolean) => {
    if (e.key === 'Enter') {
      if (isB && inputA.trim() && inputB.trim()) {
        addQuestion();
      }
    }
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {gamePhase === 'setup' && (
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
                  {t('Tools.balance-game.title', '밸런스 게임')}
                </h2>
                <p className="text-muted-foreground">
                  {t('Tools.balance-game.setupDesc', '질문을 추가하고 게임을 시작하세요!')}
                </p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">A</span>
                      <Input
                        value={inputA}
                        onChange={(e) => setInputA(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, false)}
                        placeholder={t('Tools.balance-game.optionAPlaceholder', '평생 여름만')}
                        data-testid="input-option-a"
                      />
                    </div>
                    <span className="text-muted-foreground font-bold pb-2">VS</span>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">B</span>
                      <Input
                        value={inputB}
                        onChange={(e) => setInputB(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, true)}
                        placeholder={t('Tools.balance-game.optionBPlaceholder', '평생 겨울만')}
                        data-testid="input-option-b"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addQuestion}
                      disabled={!inputA.trim() || !inputB.trim()}
                      className="flex-1"
                      data-testid="button-add-question"
                    >
                      {t('Tools.balance-game.addQuestion', '질문 추가')}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={loadExamples}
                      className="gap-1"
                      data-testid="button-examples"
                    >
                      <Zap className="w-4 h-4" />
                      {t('Tools.balance-game.loadExamples', '예시')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {t('Tools.balance-game.questionList', '질문 목록')} ({questions.length})
                    </h3>
                    <Button 
                      onClick={startGame}
                      className="gap-2"
                      data-testid="button-start"
                    >
                      <Play className="w-4 h-4" />
                      {t('Tools.balance-game.start', '게임 시작')}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {questions.map((q, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-muted rounded-md gap-2"
                      >
                        <span className="text-sm truncate flex-1">
                          {q.optionA} <span className="text-primary font-bold">vs</span> {q.optionB}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(i)}
                          data-testid={`button-delete-${i}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {gamePhase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {currentIndex + 1} / {questions.length}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goBack}
                    data-testid="button-back"
                  >
                    {t('Tools.balance-game.back', '목록으로')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetVotes}
                    data-testid="button-reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-muted-foreground">
                  {t('Tools.balance-game.whichWouldYouChoose', '둘 중에 뭘 선택하시겠습니까?')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.div whileTap={{ scale: hasVoted ? 1 : 0.98 }}>
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    className={`w-full h-auto min-h-[150px] p-6 text-xl font-bold flex flex-col gap-4 relative overflow-visible ${
                      hasVoted && selectedOption === 'A' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => !hasVoted && handleVote('A')}
                    disabled={hasVoted}
                    data-testid="button-option-a"
                  >
                    <span className="text-2xl md:text-3xl leading-tight break-keep">
                      {currentQuestion.optionA}
                    </span>
                    <AnimatePresence>
                      {hasVoted && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full space-y-2"
                        >
                          <Progress value={percentA} className="h-3" />
                          <div className="flex items-center justify-center gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-lg">{percentA}%</span>
                            <span className="text-sm text-muted-foreground">
                              ({currentQuestion.votesA}{t('Tools.balance-game.votes', '표')})
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: hasVoted ? 1 : 0.98 }}>
                  <Button
                    variant={hasVoted ? "secondary" : "outline"}
                    className={`w-full h-auto min-h-[150px] p-6 text-xl font-bold flex flex-col gap-4 relative overflow-visible ${
                      hasVoted && selectedOption === 'B' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => !hasVoted && handleVote('B')}
                    disabled={hasVoted}
                    data-testid="button-option-b"
                  >
                    <span className="text-2xl md:text-3xl leading-tight break-keep">
                      {currentQuestion.optionB}
                    </span>
                    <AnimatePresence>
                      {hasVoted && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full space-y-2"
                        >
                          <Progress value={percentB} className="h-3" />
                          <div className="flex items-center justify-center gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-lg">{percentB}%</span>
                            <span className="text-sm text-muted-foreground">
                              ({currentQuestion.votesB}{t('Tools.balance-game.votes', '표')})
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="gap-2"
                  data-testid="button-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('Tools.balance-game.prev', '이전')}
                </Button>

                {hasVoted && (
                  <Button
                    onClick={() => { setHasVoted(false); setSelectedOption(null); }}
                    variant="ghost"
                    size="sm"
                    data-testid="button-vote-again"
                  >
                    {t('Tools.balance-game.voteAgain', '다시 투표')}
                  </Button>
                )}

                <Button
                  variant={hasVoted && currentIndex === questions.length - 1 ? "default" : "outline"}
                  onClick={nextQuestion}
                  disabled={!hasVoted}
                  className="gap-2"
                  data-testid="button-next"
                >
                  {currentIndex === questions.length - 1 ? (
                    <>
                      <ListChecks className="w-4 h-4" />
                      결과 보기
                    </>
                  ) : (
                    <>
                      {t('Tools.balance-game.next', '다음')}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {totalVotes > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {t('Tools.balance-game.totalVotes', '총 {{count}}명 투표', { count: totalVotes })}
                </p>
              )}
            </motion.div>
          )}

          {gamePhase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                <h2 className="text-2xl font-bold">게임 완료!</h2>
                <p className="text-muted-foreground">당신의 선택 결과입니다</p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg mb-4">내 선택 목록</h3>
                  {userChoices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                      <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{choice.question}</p>
                        <p className="font-medium text-primary">{choice.chosenOption}</p>
                      </div>
                      <Badge className={choice.choice === 'A' ? 'bg-blue-500' : 'bg-purple-500'}>
                        {choice.choice}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-4 flex-wrap">
                <Button onClick={playAgain} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  다시 하기
                </Button>
                <Button variant="outline" onClick={goBack} className="flex-1">
                  새 게임
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenWrapper>
  );
}
