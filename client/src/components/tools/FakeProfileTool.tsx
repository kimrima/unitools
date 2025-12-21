import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RefreshCw, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FIRST_NAMES_MALE = ['James', 'John', 'Michael', 'David', 'Robert', 'William', 'Daniel', 'Christopher', 'Matthew', 'Andrew'];
const FIRST_NAMES_FEMALE = ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'mail.com', 'proton.me'];
const JOBS = ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Manager', 'Data Analyst', 'Sales Representative', 'Consultant', 'Project Manager', 'Account Manager', 'Developer'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const COUNTRIES = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'South Korea', 'Brazil', 'Mexico'];

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  job: string;
  city: string;
  country: string;
  age: number;
  username: string;
}

export default function FakeProfileTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [gender, setGender] = useState('random');
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generateProfile = (): Profile => {
    const isMale = gender === 'random' ? Math.random() > 0.5 : gender === 'male';
    const firstName = randomItem(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = randomItem(LAST_NAMES);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum(1, 999)}`;
    
    return {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(DOMAINS)}`,
      phone: `+1 ${randomNum(200, 999)}-${randomNum(100, 999)}-${randomNum(1000, 9999)}`,
      job: randomItem(JOBS),
      city: randomItem(CITIES),
      country: randomItem(COUNTRIES),
      age: randomNum(22, 55),
      username,
    };
  };

  const handleGenerate = () => {
    const newProfiles = Array.from({ length: 5 }, () => generateProfile());
    setProfiles(newProfiles);
  };

  const handleCopy = async (profile: Profile) => {
    const text = `Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Phone: ${profile.phone}
Username: ${profile.username}
Job: ${profile.job}
Location: ${profile.city}, ${profile.country}
Age: ${profile.age}`;

    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleCopyAll = async () => {
    const text = profiles.map((p, i) => 
      `[Profile ${i + 1}]
Name: ${p.firstName} ${p.lastName}
Email: ${p.email}
Phone: ${p.phone}
Username: ${p.username}
Job: ${p.job}
Location: ${p.city}, ${p.country}
Age: ${p.age}`
    ).join('\n\n');

    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.fake-profile.allCopied'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-sm">
              {t('Tools.fake-profile.notice')}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.fake-profile.genderLabel')}</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-40" data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">{t('Tools.fake-profile.random')}</SelectItem>
                    <SelectItem value="male">{t('Tools.fake-profile.male')}</SelectItem>
                    <SelectItem value="female">{t('Tools.fake-profile.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleGenerate} data-testid="button-generate">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('Tools.fake-profile.generate')}
              </Button>
              
              {profiles.length > 0 && (
                <Button variant="outline" onClick={handleCopyAll} data-testid="button-copy-all">
                  <Copy className="h-4 w-4 mr-2" />
                  {t('Tools.fake-profile.copyAll')}
                </Button>
              )}
            </div>

            {profiles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/30 border space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-lg">
                        {profile.firstName} {profile.lastName}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(profile)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>{profile.email}</p>
                      <p>{profile.phone}</p>
                      <p>@{profile.username}</p>
                      <p>{profile.job}</p>
                      <p>{profile.city}, {profile.country}</p>
                      <p>{profile.age} years old</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2" />
                  <p>{t('Tools.fake-profile.noProfiles')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
