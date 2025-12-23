import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FullscreenWrapper } from './FullscreenWrapper';
import { 
  Eye, EyeOff, Shuffle, RotateCcw, Users, AlertTriangle, 
  ChevronLeft, ChevronRight, Play, Trophy
} from 'lucide-react';

type GamePhase = 'setup' | 'assign' | 'reveal' | 'voting' | 'result';

interface Player {
  name: string;
  isLiar: boolean;
  hasChecked: boolean;
}

const defaultTopics: Record<string, string[]> = {
  ko: [
    '사과', '바나나', '딸기', '수박', '포도', '오렌지', '복숭아', '망고',
    '피자', '치킨', '햄버거', '라면', '김밥', '떡볶이', '짜장면', '삼겹살',
    '강아지', '고양이', '토끼', '햄스터', '앵무새', '금붕어', '거북이', '고슴도치',
    '축구', '야구', '농구', '테니스', '배드민턴', '탁구', '골프', '볼링',
    '서울', '부산', '제주도', '경주', '전주', '강릉', '여수', '속초',
    '의사', '선생님', '요리사', '소방관', '경찰관', '프로그래머', '가수', '배우',
    '비행기', '기차', '버스', '택시', '자전거', '오토바이', '배', '지하철',
    '학교', '병원', '마트', '공원', '도서관', '카페', '영화관', '헬스장'
  ],
  en: [
    'Apple', 'Banana', 'Strawberry', 'Watermelon', 'Grape', 'Orange', 'Peach', 'Mango',
    'Pizza', 'Chicken', 'Hamburger', 'Pasta', 'Sushi', 'Taco', 'Steak', 'Salad',
    'Dog', 'Cat', 'Rabbit', 'Hamster', 'Parrot', 'Goldfish', 'Turtle', 'Hedgehog',
    'Soccer', 'Baseball', 'Basketball', 'Tennis', 'Badminton', 'Golf', 'Bowling', 'Swimming',
    'New York', 'Paris', 'Tokyo', 'London', 'Sydney', 'Rome', 'Dubai', 'Seoul',
    'Doctor', 'Teacher', 'Chef', 'Firefighter', 'Police', 'Programmer', 'Singer', 'Actor',
    'Airplane', 'Train', 'Bus', 'Taxi', 'Bicycle', 'Motorcycle', 'Ship', 'Subway',
    'School', 'Hospital', 'Mall', 'Park', 'Library', 'Cafe', 'Cinema', 'Gym'
  ]
};

export default function LiarGameTool() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ko') ? 'ko' : 'en';

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerNames, setPlayerNames] = useState('');
  const [customWord, setCustomWord] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [revealedLiar, setRevealedLiar] = useState(false);

  const startGame = useCallback(() => {
    const names = playerNames
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (names.length < 3) return;

    const word = customWord.trim() || 
      defaultTopics[lang][Math.floor(Math.random() * defaultTopics[lang].length)];
    
    const liarIndex = Math.floor(Math.random() * names.length);
    
    const newPlayers: Player[] = names.map((name, index) => ({
      name,
      isLiar: index === liarIndex,
      hasChecked: false
    }));

    setPlayers(newPlayers);
    setCurrentWord(word);
    setCurrentPlayerIndex(0);
    setShowWord(false);
    setVotes({});
    setRevealedLiar(false);
    setPhase('assign');
  }, [playerNames, customWord, lang]);

  const handleCheckWord = () => {
    setShowWord(true);
  };

  const handleConfirmCheck = () => {
    const updated = [...players];
    updated[currentPlayerIndex].hasChecked = true;
    setPlayers(updated);
    setShowWord(false);

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setPhase('voting');
    }
  };

  const handleVote = (playerName: string) => {
    setVotes(prev => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1
    }));
  };

  const getMostVoted = () => {
    let maxVotes = 0;
    let mostVoted = '';
    Object.entries(votes).forEach(([name, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = name;
      }
    });
    return { name: mostVoted, votes: maxVotes };
  };

  const showResult = () => {
    setRevealedLiar(true);
    setPhase('result');
  };

  const resetGame = () => {
    setPhase('setup');
    setPlayers([]);
    setCurrentWord('');
    setCurrentPlayerIndex(0);
    setShowWord(false);
    setVotes({});
    setRevealedLiar(false);
  };

  const currentPlayer = players[currentPlayerIndex];
  const liar = players.find(p => p.isLiar);
  const mostVoted = getMostVoted();

  return (
    <FullscreenWrapper>
      <div className="space-y-6">
        {phase === 'setup' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('Tools.liar-game.players', '참가자 (한 줄에 한 명, 최소 3명)')}
                </Label>
                <Textarea
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  placeholder={t('Tools.liar-game.playersPlaceholder', '홍길동\n김철수\n이영희\n박민수')}
                  className="min-h-[200px] font-mono"
                  data-testid="input-players"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.liar-game.customWord', '제시어 (비워두면 랜덤)')}</Label>
                <Input
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder={t('Tools.liar-game.customWordPlaceholder', '직접 입력하거나 비워두세요')}
                  data-testid="input-custom-word"
                />
              </div>

              <Button 
                onClick={startGame}
                className="w-full gap-2"
                disabled={playerNames.split('\n').filter(n => n.trim()).length < 3}
                data-testid="button-start-game"
              >
                <Play className="w-4 h-4" />
                {t('Tools.liar-game.startGame', '게임 시작')}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('Tools.liar-game.howToPlay', '게임 방법')}
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>{t('Tools.liar-game.rule1', '참가자 중 한 명이 랜덤으로 라이어로 선정됩니다.')}</li>
                <li>{t('Tools.liar-game.rule2', '각자 순서대로 제시어를 확인합니다. 라이어는 "당신은 라이어입니다"라고 표시됩니다.')}</li>
                <li>{t('Tools.liar-game.rule3', '돌아가며 제시어에 대해 설명합니다. 라이어는 들키지 않게 연기해야 합니다.')}</li>
                <li>{t('Tools.liar-game.rule4', '토론 후 라이어를 투표로 찾아냅니다.')}</li>
                <li>{t('Tools.liar-game.rule5', '라이어가 맞춰지면 시민팀 승리, 아니면 라이어 승리!')}
                </li>
              </ol>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">{t('Tools.liar-game.tips', '팁')}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t('Tools.liar-game.tip1', '너무 구체적으로 설명하면 라이어가 힌트를 얻습니다.')}</li>
                  <li>• {t('Tools.liar-game.tip2', '너무 모호하게 설명하면 라이어로 의심받습니다.')}</li>
                  <li>• {t('Tools.liar-game.tip3', '라이어는 다른 사람의 설명을 잘 듣고 따라가세요.')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {phase === 'assign' && currentPlayer && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-1">
                {currentPlayerIndex + 1} / {players.length}
              </Badge>
              <h2 className="text-3xl font-bold">{currentPlayer.name}</h2>
              <p className="text-muted-foreground">
                {t('Tools.liar-game.turnToCheck', '제시어를 확인하세요')}
              </p>
            </div>

            {!showWord ? (
              <Button 
                size="lg" 
                onClick={handleCheckWord}
                className="gap-2 text-lg px-8 py-6"
                data-testid="button-check-word"
              >
                <Eye className="w-5 h-5" />
                {t('Tools.liar-game.checkWord', '제시어 보기')}
              </Button>
            ) : (
              <div className="space-y-6 text-center">
                <Card className={`p-8 ${currentPlayer.isLiar ? 'border-red-500 border-2' : 'border-green-500 border-2'}`}>
                  <CardContent className="p-0">
                    {currentPlayer.isLiar ? (
                      <div className="space-y-2">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />
                        <p className="text-3xl font-bold text-red-500">
                          {t('Tools.liar-game.youAreLiar', '당신은 라이어입니다!')}
                        </p>
                        <p className="text-muted-foreground">
                          {t('Tools.liar-game.liarHint', '제시어를 모릅니다. 들키지 않게 연기하세요!')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-lg">
                          {t('Tools.liar-game.theWordIs', '제시어')}
                        </p>
                        <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                          {currentWord}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  size="lg" 
                  onClick={handleConfirmCheck}
                  className="gap-2"
                  data-testid="button-confirm"
                >
                  <EyeOff className="w-5 h-5" />
                  {t('Tools.liar-game.confirmAndHide', '확인했습니다')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex gap-2 flex-wrap justify-center">
              {players.map((p, i) => (
                <Badge 
                  key={p.name}
                  variant={p.hasChecked ? 'default' : 'outline'}
                  className={i === currentPlayerIndex ? 'ring-2 ring-primary' : ''}
                >
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {t('Tools.liar-game.votingTime', '투표 시간!')}
              </h2>
              <p className="text-muted-foreground">
                {t('Tools.liar-game.votingDesc', '토론이 끝났다면 라이어를 투표하세요')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((player) => (
                <Button
                  key={player.name}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => handleVote(player.name)}
                  data-testid={`button-vote-${player.name}`}
                >
                  <span className="font-semibold">{player.name}</span>
                  <Badge variant="secondary">
                    {votes[player.name] || 0} {t('Tools.liar-game.votes', '표')}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setVotes({})}
                className="gap-2"
                data-testid="button-reset-votes"
              >
                <RotateCcw className="w-4 h-4" />
                {t('Tools.liar-game.resetVotes', '투표 초기화')}
              </Button>
              <Button 
                onClick={showResult}
                className="gap-2"
                disabled={Object.keys(votes).length === 0}
                data-testid="button-show-result"
              >
                <Trophy className="w-4 h-4" />
                {t('Tools.liar-game.showResult', '결과 공개')}
              </Button>
            </div>
          </div>
        )}

        {phase === 'result' && liar && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">
                {t('Tools.liar-game.result', '결과')}
              </h2>
              
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {t('Tools.liar-game.mostVoted', '가장 많은 표를 받은 사람')}
                </p>
                <p className="text-3xl font-bold">
                  {mostVoted.name} ({mostVoted.votes}{t('Tools.liar-game.votes', '표')})
                </p>
              </div>

              <Card className={`p-6 ${mostVoted.name === liar.name ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
                <CardContent className="p-0 space-y-4">
                  <p className="text-xl">
                    {t('Tools.liar-game.theLiarWas', '라이어는')}
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {liar.name}
                  </p>
                  <p className="text-lg">
                    {t('Tools.liar-game.theWordWas', '제시어는')} <strong>{currentWord}</strong>
                  </p>
                  
                  {mostVoted.name === liar.name ? (
                    <Badge className="bg-green-500 text-lg px-4 py-2">
                      {t('Tools.liar-game.citizensWin', '시민팀 승리!')}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-lg px-4 py-2">
                      {t('Tools.liar-game.liarWins', '라이어 승리!')}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg" 
              onClick={resetGame}
              className="gap-2"
              data-testid="button-new-game"
            >
              <Shuffle className="w-5 h-5" />
              {t('Tools.liar-game.newGame', '새 게임')}
            </Button>
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
