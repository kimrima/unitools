import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Hash, Shuffle, TrendingUp, Camera, Music, Utensils, Plane, Dumbbell, Briefcase, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HashtagCategory {
  icon: typeof Hash;
  tags: string[];
}

const HASHTAG_DATABASE: Record<string, HashtagCategory> = {
  trending: {
    icon: TrendingUp,
    tags: ['viral', 'trending', 'fyp', 'foryou', 'explore', 'popular', 'hot', 'trend', 'featured', 'discover', 'reels', 'shorts', 'tiktok', 'viral2024', 'trendingnow', 'viralpost', 'explorepage', 'foryoupage']
  },
  photography: {
    icon: Camera,
    tags: ['photography', 'photooftheday', 'photo', 'photographer', 'photoshoot', 'portrait', 'landscape', 'streetphotography', 'naturephotography', 'travelphotography', 'mobilephotography', 'sunset', 'sunrise', 'goldenhour', 'lightroom', 'vsco', 'aestheticphotography', 'shotoniphone']
  },
  music: {
    icon: Music,
    tags: ['music', 'musician', 'singer', 'songwriter', 'newmusic', 'musicproducer', 'hiphop', 'kpop', 'pop', 'rock', 'jazz', 'acoustic', 'guitar', 'piano', 'beats', 'studio', 'musicvideo', 'concert', 'livemusic', 'spotify']
  },
  food: {
    icon: Utensils,
    tags: ['food', 'foodie', 'foodporn', 'foodstagram', 'instafood', 'yummy', 'delicious', 'cooking', 'homemade', 'recipe', 'healthyfood', 'vegan', 'vegetarian', 'dessert', 'breakfast', 'lunch', 'dinner', 'foodphotography', 'tasty', 'chef']
  },
  travel: {
    icon: Plane,
    tags: ['travel', 'travelphotography', 'travelgram', 'traveling', 'wanderlust', 'adventure', 'explore', 'vacation', 'holiday', 'travelblogger', 'instatravel', 'roadtrip', 'nature', 'beach', 'mountains', 'cityscape', 'backpacking', 'tourist', 'destination', 'trip']
  },
  fitness: {
    icon: Dumbbell,
    tags: ['fitness', 'gym', 'workout', 'fit', 'fitnessmotivation', 'bodybuilding', 'training', 'health', 'healthy', 'exercise', 'muscle', 'strength', 'cardio', 'yoga', 'running', 'crossfit', 'personaltrainer', 'weightloss', 'gains', 'motivation']
  },
  business: {
    icon: Briefcase,
    tags: ['business', 'entrepreneur', 'startup', 'marketing', 'success', 'motivation', 'money', 'investing', 'finance', 'smallbusiness', 'branding', 'digitalmarketing', 'socialmedia', 'growth', 'hustle', 'leadership', 'innovation', 'networking', 'ceo', 'mindset']
  },
  lifestyle: {
    icon: Heart,
    tags: ['lifestyle', 'life', 'happy', 'love', 'instagood', 'beautiful', 'style', 'fashion', 'beauty', 'selfcare', 'wellness', 'mindfulness', 'positivevibes', 'motivation', 'inspiration', 'goals', 'dream', 'blessed', 'grateful', 'mood']
  },
  aesthetic: {
    icon: Sparkles,
    tags: ['aesthetic', 'aesthetics', 'vibes', 'mood', 'art', 'artsy', 'minimal', 'minimalist', 'vintage', 'retro', 'grunge', 'softaesthetic', 'darkaesthetic', 'pastel', 'tumblr', 'pinterest', 'cozy', 'dreamy', 'ethereal', 'moodboard']
  },
};

export default function HashtagGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<string[]>([]);

  const suggestedFromKeywords = useMemo(() => {
    if (!keywords.trim()) return [];
    
    const words = keywords.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
    const suggestions: string[] = [];
    
    words.forEach(word => {
      suggestions.push(word.replace(/[^a-z0-9]/g, ''));
      
      Object.values(HASHTAG_DATABASE).forEach(category => {
        category.tags.forEach(tag => {
          if (tag.includes(word) || word.includes(tag)) {
            if (!suggestions.includes(tag)) {
              suggestions.push(tag);
            }
          }
        });
      });
    });
    
    return suggestions.filter(s => s.length > 0).slice(0, 15);
  }, [keywords]);

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  const addCustomTag = () => {
    const trimmed = keywords.trim().replace(/^#/, '').replace(/[^a-zA-Z0-9_]/g, '');
    if (trimmed && !customTags.includes(trimmed) && !selectedTags.has(trimmed)) {
      setCustomTags([...customTags, trimmed]);
      setSelectedTags(new Set([...selectedTags, trimmed]));
      setKeywords('');
    }
  };

  const selectRandomTags = (count: number = 10) => {
    const category = HASHTAG_DATABASE[selectedCategory];
    const shuffled = [...category.tags].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    setSelectedTags(new Set([...selectedTags, ...selected]));
  };

  const clearSelection = () => {
    setSelectedTags(new Set());
    setCustomTags([]);
  };

  const copyTags = async () => {
    const allTags = Array.from(selectedTags).map(tag => '#' + tag).join(' ');
    await navigator.clipboard.writeText(allTags);
    toast({
      title: t('Common.messages.complete'),
      description: selectedTags.size + ' ' + t('Tools.hashtag-generator.tagsCopied'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.hashtag-generator.keywordsLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Tools.hashtag-generator.keywordsPlaceholder')}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  data-testid="input-keywords"
                />
                <Button onClick={addCustomTag} disabled={!keywords.trim()} data-testid="button-add">
                  <Hash className="h-4 w-4 mr-2" />
                  {t('Tools.hashtag-generator.addTag')}
                </Button>
              </div>
            </div>

            {suggestedFromKeywords.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t('Tools.hashtag-generator.suggestions')}</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedFromKeywords.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.has(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                      data-testid={'badge-suggestion-' + tag}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex flex-wrap h-auto gap-1">
                {Object.entries(HASHTAG_DATABASE).map(([key, { icon: Icon }]) => (
                  <TabsTrigger key={key} value={key} className="gap-1" data-testid={'tab-' + key}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('Tools.hashtag-generator.categories.' + key)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(HASHTAG_DATABASE).map(([key, { tags }]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.has(tag) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                        data-testid={'badge-' + key + '-' + tag}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => selectRandomTags(10)}
                    data-testid="button-random"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    {t('Tools.hashtag-generator.randomSelect')}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>

            {selectedTags.size > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t('Tools.hashtag-generator.selectedTags')} ({selectedTags.size}/30)</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearSelection} data-testid="button-clear">
                      {t('Common.actions.clear')}
                    </Button>
                    <Button size="sm" onClick={copyTags} data-testid="button-copy-all">
                      <Copy className="h-4 w-4 mr-2" />
                      {t('Common.actions.copy')}
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedTags).map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                        data-testid={'badge-selected-' + tag}
                      >
                        #{tag} x
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <code className="text-xs break-all">
                    {Array.from(selectedTags).map(tag => '#' + tag).join(' ')}
                  </code>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
