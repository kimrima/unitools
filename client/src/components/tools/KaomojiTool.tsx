import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KAOMOJI_CATEGORIES = {
  happy: ['(◕‿◕)', '(｡◕‿◕｡)', '(◠‿◠)', '(✿◠‿◠)', '(◡‿◡)', '(◠ω◠)', '(◕ᴗ◕)', '(◠‿・)', '(◔◡◔)', '(｡♥‿♥｡)'],
  love: ['(づ｡◕‿‿◕｡)づ', '(っ◔◡◔)っ ♥', '(◍•ᴗ•◍)❤', '(๑>◡<๑)', '♡(ŐωŐ人)', '(♡˙︶˙♡)', '(●´з`)♡', '(◕‿◕)♡', '♥(ˆ⌣ˆԅ)', '(„ಡωಡ„)'],
  sad: ['(╥﹏╥)', '(T_T)', '(;_;)', '(ಥ﹏ಥ)', '(´;ω;`)', '(｡•́︿•̀｡)', '(╯︵╰,)', '(っ˘̩╭╮˘̩)っ', '(ノД`)・゜・。', '( ´_ゝ`)'],
  angry: ['(╬ Ò﹏Ó)', '(ノಠ益ಠ)ノ彡┻━┻', '(ﾉಥ益ಥ）ﾉ', '(╯°□°）╯︵ ┻━┻', '(ง •̀_•́)ง', '(҂`з´)', '(๑•̀ㅂ•́)و✧', '(ノ°▽°)ノ︵┻━┻', '(╬ꎁ_ꎁ)', '凸(｀△´＃)'],
  surprised: ['(⊙_⊙)', '(°o°)', '(O_O)', '(◎_◎)', '(⊙▽⊙)', '(ﾟДﾟ)', '(°△°)', '∑(°△°|||)', '(゜゜)', '(⊙_⊙)？'],
  cute: ['(≧◡≦)', '(◕ᴗ◕✿)', '(◠‿◠✿)', '(｡◕‿◕｡)', '(◕‿◕)', '(✧ω✧)', '(◕ω◕)', '(◕ᴥ◕)', '(=^･ω･^=)', '(=^-ω-^=)'],
  wink: ['(^_~)', '(^_-)', '(◠‿・)—☆', '(^_<)〜☆', '(~_^)', '(;^ω^)', '( ´ ▽ ` )b', '(๑¯◡¯๑)', '(◕ᴗ◕✿)', '(☆▽☆)'],
  greeting: ['(｡･ω･)ﾉﾞ', '(*・ω・)ﾉ', '(=ﾟωﾟ)ノ', '( ´ ▽ ` )ﾉ', '(●\'◡\'●)ﾉ', 'ヾ(＾∇＾)', 'ヾ(^ω^*)', '(°▽°)/~', '(♡´▽`♡)', '(づ◡◡)づ'],
  shrug: ['¯\\_(ツ)_/¯', '┐(´∀`)┌', '╮(╯▽╰)╭', '(´・ω・`)', '(¬‿¬)', '(ーωー)', '(⌐■_■)', '(•_•)', '¯\\_( ͡° ͜ʖ ͡°)_/¯', '(︶︹︺)'],
  tableFlip: ['(╯°□°）╯︵ ┻━┻', '(ノಠ益ಠ)ノ彡┻━┻', '(ﾉ≧∇≦)ﾉ ﾐ ┸━┸', '(ノ°▽°)ノ︵┻━┻', '┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻', '(┛ಠ_ಠ)┛彡┻━┻', '(ﾉ-_-)ﾉ・・・~~~┻━┻', '┬─┬ノ( º _ ºノ)', '(╯‵□′)╯︵┻━┻', '┬──┬◡ﾉ(° -°ﾉ)'],
  bear: ['ʕ•ᴥ•ʔ', 'ʕ ᵔᴥᵔ ʔ', 'ʕ·ᴥ·ʔ', 'ʕ ·ᴥ·ʔゝ☆', 'ʕ→ᴥ←ʔ', 'ʕノ•ᴥ•ʔノ', 'ʕっ•ᴥ•ʔっ', 'ʕ•ᴥ•oʔ', '(✪㉨✪)', 'ʕ￫ᴥ￩ʔ'],
  cat: ['(=^･ω･^=)', '(=^･ｪ･^=)', '(^˵◕ω◕˵^)', '(=ↀωↀ=)✧', '/ᐠ. ̫ .ᐟ\\', '(^・ω・^)', 'ฅ^•ﻌ•^ฅ', '(=^-ω-^=)', '(˵ ͡° ͜ʖ ͡°˵)', '(=①ω①=)'],
  sparkle: ['(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧', '✧･ﾟ: *✧･ﾟ:*', '☆*:.｡.o(≧▽≦)o.｡.:*☆', '｡+.ﾟヽ(*´∀`)ﾉﾟ.+｡', '✧.*(❛ᴗ❛) ✧.*', '･ﾟ✧(◕︵◕)✧･ﾟ', '*.·:·.✧ ✦ ✧.·:·.*', '✧･ﾟ✧ ☆ ✧･ﾟ✧', '｡ﾟ☆: *.☽ .* :☆ﾟ.', '★彡( ◠‿◠ )☆彡'],
};

export default function KaomojiTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCopy = async (kaomoji: string) => {
    await navigator.clipboard.writeText(kaomoji);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.kaomoji-collection.copied'),
    });
  };

  const filteredCategories = Object.entries(KAOMOJI_CATEGORIES).filter(([category]) => {
    if (selectedCategory && selectedCategory !== category) return false;
    if (search) {
      return category.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('Tools.kaomoji-collection.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {t('Tools.kaomoji-collection.all')}
              </Badge>
              {Object.keys(KAOMOJI_CATEGORIES).map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-6">
              {filteredCategories.map(([category, kaomojis]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {kaomojis.map((kaomoji, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-3 text-lg hover-elevate"
                        onClick={() => handleCopy(kaomoji)}
                        data-testid={`button-kaomoji-${category}-${index}`}
                      >
                        {kaomoji}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
