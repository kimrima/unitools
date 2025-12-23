import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Shuffle, RotateCcw, Plus, Trash2, ArrowRight, 
  ThumbsUp, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Question {
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

const defaultQuestions: Record<string, Question[]> = {
  ko: [
    { optionA: '평생 여름만', optionB: '평생 겨울만', votesA: 0, votesB: 0 },
    { optionA: '투명인간 능력', optionB: '순간이동 능력', votesA: 0, votesB: 0 },
    { optionA: '과거로 시간여행', optionB: '미래로 시간여행', votesA: 0, votesB: 0 },
    { optionA: '평생 라면만', optionB: '평생 치킨만', votesA: 0, votesB: 0 },
    { optionA: '억만장자 + 못생김', optionB: '가난 + 잘생김', votesA: 0, votesB: 0 },
    { optionA: '하루 4시간만 수면', optionB: '하루 12시간 수면 필수', votesA: 0, votesB: 0 },
    { optionA: '생각이 모두 들림', optionB: '내 생각이 모두에게 들림', votesA: 0, votesB: 0 },
    { optionA: '평생 혼자 살기', optionB: '평생 부모님과 살기', votesA: 0, votesB: 0 },
    { optionA: '유명해지고 싶다', optionB: '부자가 되고 싶다', votesA: 0, votesB: 0 },
    { optionA: '사랑하는 연인', optionB: '평생 친구 10명', votesA: 0, votesB: 0 },
    { optionA: '바다 여행', optionB: '산 여행', votesA: 0, votesB: 0 },
    { optionA: '평생 아침형 인간', optionB: '평생 저녁형 인간', votesA: 0, votesB: 0 },
    { optionA: '모든 언어 마스터', optionB: '모든 악기 마스터', votesA: 0, votesB: 0 },
    { optionA: '10년 전으로 돌아가기', optionB: '10년 후 미리 보기', votesA: 0, votesB: 0 },
    { optionA: '기억력 천재', optionB: '창의력 천재', votesA: 0, votesB: 0 },
    { optionA: '평생 같은 음식만', optionB: '매일 다른 음식 강제', votesA: 0, votesB: 0 },
    { optionA: '모든 동물과 대화', optionB: '모든 외국어 유창', votesA: 0, votesB: 0 },
    { optionA: '날씨를 조종', optionB: '시간을 멈추기', votesA: 0, votesB: 0 },
    { optionA: '평생 무료 여행', optionB: '평생 무료 음식', votesA: 0, votesB: 0 },
    { optionA: '100세까지 건강', optionB: '60세에 행복하게', votesA: 0, votesB: 0 },
  ],
  en: [
    { optionA: 'Summer forever', optionB: 'Winter forever', votesA: 0, votesB: 0 },
    { optionA: 'Invisibility', optionB: 'Teleportation', votesA: 0, votesB: 0 },
    { optionA: 'Travel to past', optionB: 'Travel to future', votesA: 0, votesB: 0 },
    { optionA: 'Only pizza forever', optionB: 'Only salad forever', votesA: 0, votesB: 0 },
    { optionA: 'Rich + Ugly', optionB: 'Poor + Beautiful', votesA: 0, votesB: 0 },
    { optionA: 'Sleep 4 hours only', optionB: 'Must sleep 12 hours', votesA: 0, votesB: 0 },
    { optionA: 'Read all minds', optionB: 'Everyone reads your mind', votesA: 0, votesB: 0 },
    { optionA: 'Live alone forever', optionB: 'Live with parents forever', votesA: 0, votesB: 0 },
    { optionA: 'Be famous', optionB: 'Be wealthy', votesA: 0, votesB: 0 },
    { optionA: 'One true love', optionB: '10 best friends', votesA: 0, votesB: 0 },
    { optionA: 'Beach vacation', optionB: 'Mountain vacation', votesA: 0, votesB: 0 },
    { optionA: 'Morning person forever', optionB: 'Night owl forever', votesA: 0, votesB: 0 },
    { optionA: 'Master all languages', optionB: 'Master all instruments', votesA: 0, votesB: 0 },
    { optionA: 'Go back 10 years', optionB: 'See 10 years ahead', votesA: 0, votesB: 0 },
    { optionA: 'Perfect memory', optionB: 'Perfect creativity', votesA: 0, votesB: 0 },
    { optionA: 'Same meal forever', optionB: 'Different meal every day', votesA: 0, votesB: 0 },
    { optionA: 'Talk to animals', optionB: 'Speak all languages', votesA: 0, votesB: 0 },
    { optionA: 'Control weather', optionB: 'Stop time', votesA: 0, votesB: 0 },
    { optionA: 'Free travel forever', optionB: 'Free food forever', votesA: 0, votesB: 0 },
    { optionA: 'Healthy until 100', optionB: 'Happy until 60', votesA: 0, votesB: 0 },
  ]
};

export default function BalanceGameTool() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ko') ? 'ko' : 'en';

  const [questions, setQuestions] = useState<Question[]>(() => 
    defaultQuestions[lang].map(q => ({ ...q }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalVotes = currentQuestion.votesA + currentQuestion.votesB;
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

  const randomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentIndex(randomIndex);
    setHasVoted(false);
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
      setShowAddForm(false);
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
    }
  };

  const resetVotes = () => {
    setQuestions(questions.map(q => ({ ...q, votesA: 0, votesB: 0 })));
    setHasVoted(false);
  };

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="outline" className="text-base px-3 py-1">
            {currentIndex + 1} / {questions.length}
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={randomQuestion}
              className="gap-1"
              data-testid="button-random"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tools.balance-game.random', '랜덤')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1"
              data-testid="button-add"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tools.balance-game.add', '추가')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetVotes}
              className="gap-1"
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Tools.balance-game.reset', '초기화')}</span>
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
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
                    data-testid="input-option-b"
                  />
                </div>
              </div>
              <Button 
                onClick={addQuestion}
                disabled={!newOptionA.trim() || !newOptionB.trim()}
                className="w-full"
                data-testid="button-add-question"
              >
                {t('Tools.balance-game.addQuestion', '질문 추가')}
              </Button>
            </CardContent>
          </Card>
        )}

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
      </div>
    </FullscreenWrapper>
  );
}
