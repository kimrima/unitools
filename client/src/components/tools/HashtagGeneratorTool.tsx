import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Hash, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HASHTAG_DATABASE: Record<string, string[]> = {
  travel: ['travel', 'wanderlust', 'travelgram', 'instatravel', 'travelphotography', 'adventure', 'explore', 'vacation', 'trip', 'traveler', 'traveling', 'traveltheworld', 'travelblogger', 'passport', 'tourism', 'holiday', 'backpacking', 'roadtrip', 'globetrotter', 'destinations'],
  food: ['food', 'foodie', 'foodporn', 'instafood', 'yummy', 'delicious', 'foodphotography', 'foodstagram', 'cooking', 'homemade', 'foodlover', 'dinner', 'lunch', 'breakfast', 'recipe', 'chef', 'healthy', 'tasty', 'restaurant', 'eatlocal'],
  fitness: ['fitness', 'gym', 'workout', 'fit', 'motivation', 'training', 'health', 'exercise', 'bodybuilding', 'fitnessmotivation', 'muscle', 'healthy', 'fitfam', 'gains', 'strength', 'cardio', 'lifestyle', 'gymlife', 'fitnessjourney', 'sport'],
  fashion: ['fashion', 'style', 'ootd', 'fashionblogger', 'instafashion', 'outfit', 'streetstyle', 'fashionista', 'trendy', 'stylish', 'clothing', 'model', 'look', 'fashionstyle', 'shopping', 'dress', 'beauty', 'accessories', 'designer', 'luxury'],
  photography: ['photography', 'photo', 'photographer', 'photooftheday', 'instagood', 'picoftheday', 'portrait', 'nature', 'art', 'landscape', 'photoshoot', 'camera', 'instagram', 'beautiful', 'capture', 'shot', 'streetphotography', 'sunset', 'light', 'color'],
  business: ['business', 'entrepreneur', 'marketing', 'success', 'motivation', 'startup', 'money', 'smallbusiness', 'branding', 'digital', 'socialmedia', 'growth', 'leadership', 'invest', 'networking', 'goals', 'work', 'hustle', 'mindset', 'ceo'],
  beauty: ['beauty', 'makeup', 'skincare', 'beautiful', 'style', 'cosmetics', 'hair', 'makeupartist', 'fashion', 'lipstick', 'beautyblogger', 'glam', 'skin', 'selfcare', 'nails', 'eyeshadow', 'beautytips', 'natural', 'glow', 'mua'],
  tech: ['tech', 'technology', 'innovation', 'coding', 'programming', 'developer', 'software', 'ai', 'startup', 'digital', 'gadgets', 'computer', 'data', 'web', 'app', 'science', 'future', 'iot', 'cloud', 'cybersecurity'],
};

export default function HashtagGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [count, setCount] = useState('15');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const generateHashtags = () => {
    let result: string[] = [];
    
    if (keyword) {
      result.push(keyword.toLowerCase().replace(/\s+/g, ''));
      result.push(`${keyword.toLowerCase().replace(/\s+/g, '')}life`);
      result.push(`${keyword.toLowerCase().replace(/\s+/g, '')}gram`);
      result.push(`insta${keyword.toLowerCase().replace(/\s+/g, '')}`);
      result.push(`${keyword.toLowerCase().replace(/\s+/g, '')}lover`);
    }
    
    if (category && HASHTAG_DATABASE[category]) {
      const categoryTags = [...HASHTAG_DATABASE[category]];
      categoryTags.sort(() => Math.random() - 0.5);
      result = [...result, ...categoryTags];
    }
    
    const uniqueTags = Array.from(new Set(result)).slice(0, parseInt(count));
    setHashtags(uniqueTags);
  };

  const handleCopy = async (tag: string) => {
    await navigator.clipboard.writeText(`#${tag}`);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleCopyAll = async () => {
    const text = hashtags.map(tag => `#${tag}`).join(' ');
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.hashtag-generator.allCopied'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.hashtag-generator.keywordLabel')}</Label>
                <Input
                  placeholder={t('Tools.hashtag-generator.keywordPlaceholder')}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  data-testid="input-keyword"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.hashtag-generator.categoryLabel')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder={t('Tools.hashtag-generator.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(HASHTAG_DATABASE).map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.hashtag-generator.countLabel')}</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger data-testid="select-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateHashtags} disabled={!keyword && !category} data-testid="button-generate">
                <Hash className="h-4 w-4 mr-2" />
                {t('Tools.hashtag-generator.generate')}
              </Button>
              {hashtags.length > 0 && (
                <Button variant="outline" onClick={handleCopyAll} data-testid="button-copy-all">
                  <Copy className="h-4 w-4 mr-2" />
                  {t('Tools.hashtag-generator.copyAll')}
                </Button>
              )}
            </div>
            
            {hashtags.length > 0 && (
              <div className="space-y-2">
                <Label>{t('Tools.hashtag-generator.resultLabel')}</Label>
                <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/30 border">
                  {hashtags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer text-sm py-1 px-2"
                      onClick={() => handleCopy(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
