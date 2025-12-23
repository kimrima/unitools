import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Margaret', 'Anthony', 'Betty', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'test.com', 'company.org'];

const STREETS = ['Main St', 'Oak Ave', 'Cedar Ln', 'Maple Dr', 'Pine Rd', 'Elm St', 'Washington Blvd', 'Park Ave'];

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Diego', 'Dallas', 'San Jose'];

const STATES = ['NY', 'CA', 'IL', 'TX', 'AZ', 'FL', 'PA', 'OH', 'GA', 'NC'];

const COMPANIES = ['Acme Corp', 'Tech Solutions', 'Global Industries', 'Digital Services', 'Smart Systems', 'Cloud Nine'];

const JOBS = ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Marketing Manager', 'Sales Rep'];

type DataField = 'name' | 'email' | 'phone' | 'address' | 'company' | 'job' | 'date' | 'number';

export default function DummyDataGeneratorTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<'json' | 'csv' | 'text'>('json');
  const [selectedFields, setSelectedFields] = useState<DataField[]>(['name', 'email', 'phone']);

  const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateName = () => `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`;
  
  const generateEmail = (name: string) => {
    const [first, last] = name.toLowerCase().split(' ');
    const variants = [
      `${first}.${last}`,
      `${first}${last}`,
      `${first[0]}${last}`,
      `${first}${Math.floor(Math.random() * 100)}`,
    ];
    return `${random(variants)}@${random(DOMAINS)}`;
  };

  const generatePhone = () => {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${prefix}-${line}`;
  };

  const generateAddress = () => {
    const num = Math.floor(Math.random() * 9999) + 1;
    const zip = Math.floor(Math.random() * 90000) + 10000;
    return `${num} ${random(STREETS)}, ${random(CITIES)}, ${random(STATES)} ${zip}`;
  };

  const generateDate = () => {
    const start = new Date(1970, 0, 1);
    const end = new Date(2005, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };

  const generateNumber = () => Math.floor(Math.random() * 10000);

  const generateRecord = () => {
    const name = generateName();
    const record: Record<string, string | number> = {};
    
    if (selectedFields.includes('name')) record.name = name;
    if (selectedFields.includes('email')) record.email = generateEmail(name);
    if (selectedFields.includes('phone')) record.phone = generatePhone();
    if (selectedFields.includes('address')) record.address = generateAddress();
    if (selectedFields.includes('company')) record.company = random(COMPANIES);
    if (selectedFields.includes('job')) record.job = random(JOBS);
    if (selectedFields.includes('date')) record.birthDate = generateDate();
    if (selectedFields.includes('number')) record.id = generateNumber();
    
    return record;
  };

  const generate = () => {
    if (selectedFields.length === 0) {
      toast({
        title: t('Common.messages.error'),
        description: t('Tools.dummy-generator.selectField', 'Please select at least one field'),
        variant: 'destructive',
      });
      return;
    }

    const data = Array.from({ length: count }, generateRecord);
    
    let result = '';
    
    if (format === 'json') {
      result = JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      result = [headers, ...rows].join('\n');
    } else {
      result = data.map((row, i) => {
        const lines = Object.entries(row).map(([k, v]) => `  ${k}: ${v}`);
        return `Record ${i + 1}:\n${lines.join('\n')}`;
      }).join('\n\n');
    }
    
    setOutput(result);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dummy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleField = (field: DataField) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const allFields: { id: DataField; label: string }[] = [
    { id: 'name', label: t('Tools.dummy-generator.fieldName', 'Full Name') },
    { id: 'email', label: t('Tools.dummy-generator.fieldEmail', 'Email') },
    { id: 'phone', label: t('Tools.dummy-generator.fieldPhone', 'Phone') },
    { id: 'address', label: t('Tools.dummy-generator.fieldAddress', 'Address') },
    { id: 'company', label: t('Tools.dummy-generator.fieldCompany', 'Company') },
    { id: 'job', label: t('Tools.dummy-generator.fieldJob', 'Job Title') },
    { id: 'date', label: t('Tools.dummy-generator.fieldDate', 'Birth Date') },
    { id: 'number', label: t('Tools.dummy-generator.fieldId', 'ID Number') },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">
                {t('Tools.dummy-generator.countLabel', 'Records')}
              </Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(Math.min(1000, parseInt(e.target.value) || 1))}
                className="w-24"
                data-testid="input-count"
              />
            </div>
            
            <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
              <SelectTrigger className="w-32" data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="text">{t('Tools.dummy-generator.textFormat', 'Text')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('Tools.dummy-generator.fieldsLabel', 'Fields to Generate')}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allFields.map(field => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                    data-testid={`checkbox-${field.id}`}
                  />
                  <Label htmlFor={field.id} className="text-sm cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={generate} data-testid="button-generate">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('Tools.dummy-generator.generate', 'Generate Data')}
          </Button>
          
          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.dummy-generator.outputLabel', 'Generated Data')}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none bg-muted/30"
                data-testid="textarea-output"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
