import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  RotateCcw, Plus, Trash2,
  ThumbsUp, Sparkles, ChevronLeft, ChevronRight, Play
} from 'lucide-react';

interface Question {
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

export default function BalanceGameTool() {
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

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
    setHasVoted(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasVoted(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setHasVoted(false);
    }
  };

  const addQuestion = () => {
    if (newOptionA.trim() && newOptionB.trim()) {
      setQuestions([...questions, {
        optionA: newOptionA.trim(),
        optionB: newOptionB.trim(),
        votesA: 0,
        votesB: 0
      }]);
      setNewOptionA('');
      setNewOptionB('');
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    const newQuestions: Question[] = [];
    
    for (const line of lines) {
      const parts = line.split(/\s*(?:vs|VS|,|\|)\s*/);
      if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
        newQuestions.push({
          optionA: parts[0].trim(),
          optionB: parts[1].trim(),
          votesA: 0,
          votesB: 0
        });
      }
    }
    
    if (newQuestions.length > 0) {
      setQuestions([...questions, ...newQuestions]);
      setBulkInput('');
    }
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
      setIsPlaying(false);
    }
  };

  const resetVotes = () => {
    setQuestions(questions.map(q => ({ ...q, votesA: 0, votesB: 0 })));
    setHasVoted(false);
  };

  const startGame = () => {
    if (questions.length > 0) {
      setIsPlaying(true);
      setCurrentIndex(0);
      setHasVoted(false);
    }
  };

  const goBack = () => {
    setIsPlaying(false);
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {!isPlaying ? (
          <div className="space-y-6">
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
                <h3 className="font-semibold">{t('Tools.balance-game.addSingle', '개별 추가')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.balance-game.optionA', '선택지 A')}</Label>
                    <Input
                      value={newOptionA}
                      onChange={(e) => setNewOptionA(e.target.value)}
                      placeholder={t('Tools.balance-game.optionAPlaceholder', '예: 평생 여름만')}
                      data-testid="input-option-a"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Tools.balance-game.optionB', '선택지 B')}</Label>
                    <Input
                      value={newOptionB}
                      onChange={(e) => setNewOptionB(e.target.value)}
                      placeholder={t('Tools.balance-game.optionBPlaceholder', '예: 평생 겨울만')}
                      onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                      data-testid="input-option-b"
                    />
                  </div>
                </div>
                <Button 
                  onClick={addQuestion}
                  disabled={!newOptionA.trim() || !newOptionB.trim()}
                  className="w-full gap-2"
                  data-testid="button-add-question"
                >
                  <Plus className="w-4 h-4" />
                  {t('Tools.balance-game.addQuestion', '질문 추가')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">{t('Tools.balance-game.bulkAdd', '한번에 추가')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('Tools.balance-game.bulkHint', '한 줄에 하나씩, 쉼표(,) 또는 vs로 구분')}
                </p>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={t('Tools.balance-game.bulkPlaceholder', '평생 여름만, 평생 겨울만\n투명인간 능력 vs 순간이동 능력\n과거로 시간여행, 미래로 시간여행')}
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
                  {t('Tools.balance-game.parseBulk', '일괄 추가')}
                </Button>
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
                        {q.optionA} <span className="text-muted-foreground">vs</span> {q.optionB}
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
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Badge variant="outline" className="text-base px-3 py-1">
                {currentIndex + 1} / {questions.length}
              </Badge>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goBack}
                  className="gap-1"
                  data-testid="button-back"
                >
                  {t('Tools.balance-game.back', '목록으로')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetVotes}
                  className="gap-1"
                  data-testid="button-reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-primary" />
              <h2 className="text-xl font-semibold text-muted-foreground">
                {t('Tools.balance-game.whichWouldYouChoose', '둘 중에 뭘 선택하시겠습니까?')}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant={hasVoted ? "secondary" : "outline"}
                className={`h-auto min-h-[150px] p-6 text-xl font-bold flex flex-col gap-4 relative overflow-visible ${
                  hasVoted ? 'cursor-default' : ''
                }`}
                onClick={() => !hasVoted && handleVote('A')}
                disabled={hasVoted}
                data-testid="button-option-a"
              >
                <span className="text-2xl md:text-3xl leading-tight break-keep">
                  {currentQuestion.optionA}
                </span>
                {hasVoted && (
                  <div className="w-full space-y-2">
                    <Progress value={percentA} className="h-3" />
                    <div className="flex items-center justify-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-lg">{percentA}%</span>
                      <span className="text-sm text-muted-foreground">
                        ({currentQuestion.votesA}{t('Tools.balance-game.votes', '표')})
                      </span>
                    </div>
                  </div>
                )}
              </Button>

              <Button
                variant={hasVoted ? "secondary" : "outline"}
                className={`h-auto min-h-[150px] p-6 text-xl font-bold flex flex-col gap-4 relative overflow-visible ${
                  hasVoted ? 'cursor-default' : ''
                }`}
                onClick={() => !hasVoted && handleVote('B')}
                disabled={hasVoted}
                data-testid="button-option-b"
              >
                <span className="text-2xl md:text-3xl leading-tight break-keep">
                  {currentQuestion.optionB}
                </span>
                {hasVoted && (
                  <div className="w-full space-y-2">
                    <Progress value={percentB} className="h-3" />
                    <div className="flex items-center justify-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-lg">{percentB}%</span>
                      <span className="text-sm text-muted-foreground">
                        ({currentQuestion.votesB}{t('Tools.balance-game.votes', '표')})
                      </span>
                    </div>
                  </div>
                )}
              </Button>
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
                  onClick={() => setHasVoted(false)}
                  variant="ghost"
                  size="sm"
                  data-testid="button-vote-again"
                >
                  {t('Tools.balance-game.voteAgain', '다시 투표')}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="gap-2"
                data-testid="button-next"
              >
                {t('Tools.balance-game.next', '다음')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {totalVotes > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {t('Tools.balance-game.totalVotes', '총 {{count}}명 투표', { count: totalVotes })}
              </p>
            )}
          </>
        )}
      </div>
    </FullscreenWrapper>
  );
}
