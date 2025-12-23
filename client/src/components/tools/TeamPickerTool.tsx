import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shuffle, RotateCcw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface Team {
  name: string;
  members: string[];
  color: typeof TEAM_COLORS[number];
}

export default function TeamPickerTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [teamCount, setTeamCount] = useState('2');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateParticipants = useCallback((text: string) => {
    setInputText(text);
    const newItems = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    setParticipants(newItems);
  }, []);

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
                <Label>{t('Tools.team-picker.participants', 'Participants (one per line)')}</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => updateParticipants(e.target.value)}
                  placeholder={t('Tools.team-picker.placeholder', 'Enter names, one per line\n\nExample:\nAlice\nBob\nCharlie\nDavid')}
                  rows={10}
                  data-testid="input-participants"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label>{t('Tools.team-picker.teamCount', 'Number of Teams')}</Label>
                  <Select value={teamCount} onValueChange={setTeamCount}>
                    <SelectTrigger data-testid="select-team-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} {t('Tools.team-picker.teams', 'Teams')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground pt-6">
                  {participants.length} {t('Tools.team-picker.people', 'people')}
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
                  ? t('Tools.team-picker.shuffling', 'Shuffling...') 
                  : t('Tools.team-picker.generateTeams', 'Generate Teams')}
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
                    {t('Tools.team-picker.reset', 'Reset')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={copyTeams}
                    className="flex-1"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? t('Common.actions.copied', 'Copied!') : t('Common.actions.copy', 'Copy')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {teams.length > 0 ? (
              <div className="space-y-4">
                {teams.map((team, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-lg border ${team.color.bg} ${team.color.border}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users className={`w-5 h-5 ${team.color.text}`} />
                      <span className={`font-bold ${team.color.text}`}>
                        {team.name}
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {team.members.length} {t('Tools.team-picker.members', 'members')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, j) => (
                        <Badge key={j} variant="outline">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <div className="text-lg font-medium text-muted-foreground">
                  {t('Tools.team-picker.noTeamsYet', 'No teams yet')}
                </div>
                <div className="text-sm text-muted-foreground/70 mt-2 max-w-xs">
                  {t('Tools.team-picker.addParticipants', 'Add participants and click "Generate Teams" to randomly divide them into teams')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium mb-2">
                {t('Tools.team-picker.useCases', 'Use Cases')}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t('Tools.team-picker.useCase1', 'Sports team drafts')}</li>
                <li>{t('Tools.team-picker.useCase2', 'School group projects')}</li>
                <li>{t('Tools.team-picker.useCase3', 'Office team building')}</li>
                <li>{t('Tools.team-picker.useCase4', 'Game night teams')}</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">
                {t('Tools.team-picker.features', 'Features')}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t('Tools.team-picker.feature1', 'Fair random distribution')}</li>
                <li>{t('Tools.team-picker.feature2', 'Up to 8 teams')}</li>
                <li>{t('Tools.team-picker.feature3', 'Copy results instantly')}</li>
                <li>{t('Tools.team-picker.feature4', 'Re-shuffle anytime')}</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">
                {t('Tools.team-picker.tips', 'Tips')}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t('Tools.team-picker.tip1', 'Enter one name per line')}</li>
                <li>{t('Tools.team-picker.tip2', 'Shuffle multiple times for different results')}</li>
                <li>{t('Tools.team-picker.tip3', 'Copy and share with your group')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
