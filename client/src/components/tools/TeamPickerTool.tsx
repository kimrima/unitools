import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shuffle, RotateCcw, Copy, Check, Plus, X, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TEAM_COLORS = [
  { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-500', name: 'Red' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-500', name: 'Blue' },
  { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-500', name: 'Green' },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-500', name: 'Yellow' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-500', name: 'Purple' },
  { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-500', name: 'Pink' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-500', name: 'Cyan' },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-500', name: 'Orange' },
];

const EXAMPLE_NAMES_KO = ['김철수', '이영희', '박민수', '최지현', '정다온', '강하늘', '윤서연', '임재혁'];
const EXAMPLE_NAMES_EN = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah'];

interface Team {
  name: string;
  members: string[];
  color: typeof TEAM_COLORS[number];
}

export default function TeamPickerTool() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [teamCount, setTeamCount] = useState('2');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const addParticipants = useCallback((text: string) => {
    const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s && !participants.includes(s));
    if (parts.length > 0) {
      setParticipants([...participants, ...parts]);
      setInputText('');
    }
  }, [participants]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      addParticipants(inputText);
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const loadExamples = () => {
    const examples = i18n.language === 'ko' ? EXAMPLE_NAMES_KO : EXAMPLE_NAMES_EN;
    setParticipants(examples);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateTeams = useCallback(() => {
    if (participants.length < 2) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      const numTeams = parseInt(teamCount);
      const shuffled = shuffleArray(participants);
      
      const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
        name: `Team ${i + 1}`,
        members: [],
        color: TEAM_COLORS[i % TEAM_COLORS.length],
      }));
      
      shuffled.forEach((person, index) => {
        newTeams[index % numTeams].members.push(person);
      });
      
      setTeams(newTeams);
      setIsAnimating(false);
    }, 800);
  }, [participants, teamCount]);

  const resetTeams = useCallback(() => {
    setTeams([]);
  }, []);

  const copyTeams = useCallback(async () => {
    const text = teams.map(team => 
      `${team.name}:\n${team.members.map(m => `  - ${m}`).join('\n')}`
    ).join('\n\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ description: t('Common.actions.copied', 'Copied!') });
    setTimeout(() => setCopied(false), 2000);
  }, [teams, toast, t]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('Tools.team-picker.participants', '참가자')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('Tools.team-picker.inputPlaceholder', '쉼표로 구분하거나 Enter로 추가')}
                    data-testid="input-participants"
                  />
                  <Button onClick={() => addParticipants(inputText)} disabled={!inputText.trim()}>
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
                  {t('Tools.team-picker.loadExamples', '예시 불러오기')}
                </Button>
              </div>
              
              {participants.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md max-h-[200px] overflow-y-auto">
                  {participants.map((p, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="gap-1 cursor-pointer pr-1"
                      onClick={() => removeParticipant(i)}
                    >
                      {p}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label>{t('Tools.team-picker.teamCount', '팀 수')}</Label>
                  <Select value={teamCount} onValueChange={setTeamCount}>
                    <SelectTrigger data-testid="select-team-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} {t('Tools.team-picker.teams', '팀')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground pt-6">
                  {participants.length} {t('Tools.team-picker.people', '명')}
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={generateTeams} 
                disabled={participants.length < 2 || isAnimating}
                className="w-full"
                data-testid="button-generate"
              >
                <Shuffle className={`mr-2 h-5 w-5 ${isAnimating ? 'animate-spin' : ''}`} />
                {isAnimating 
                  ? t('Tools.team-picker.shuffling', '섞는 중...') 
                  : t('Tools.team-picker.generateTeams', '팀 생성')}
              </Button>

              {teams.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={resetTeams} 
                    className="flex-1"
                    data-testid="button-reset"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('Tools.team-picker.reset', '다시')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={copyTeams}
                    className="flex-1"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? t('Common.actions.copied', '복사됨!') : t('Common.actions.copy', '복사')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {teams.length > 0 ? (
                <motion.div 
                  key="teams"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {teams.map((team, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-lg border ${team.color.bg} ${team.color.border}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Users className={`w-5 h-5 ${team.color.text}`} />
                        <span className={`font-bold ${team.color.text}`}>
                          {team.name}
                        </span>
                        <Badge variant="secondary" className="ml-auto">
                          {team.members.length} {t('Tools.team-picker.members', '명')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member, j) => (
                          <Badge key={j} variant="outline">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <div className="text-lg font-medium text-muted-foreground">
                    {t('Tools.team-picker.noTeamsYet', '아직 팀이 없습니다')}
                  </div>
                  <div className="text-sm text-muted-foreground/70 mt-2 max-w-xs">
                    {t('Tools.team-picker.addParticipants', '참가자를 추가하고 팀 생성 버튼을 눌러주세요')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
