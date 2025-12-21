import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadZone } from '@/components/tool-ui';
import { Copy, Trash2, ScanText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Tesseract from 'tesseract.js';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'kor', label: '한국어' },
  { code: 'jpn', label: '日本語' },
  { code: 'chi_sim', label: '简体中文' },
  { code: 'chi_tra', label: '繁體中文' },
  { code: 'eng+kor', label: 'English + 한국어' },
];

export default function ImageOcrTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFilesFromDropzone = useCallback((files: FileList) => {
    const file = files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('Common.errors.INVALID_FILE_TYPE'),
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setText('');
    };
    reader.readAsDataURL(file);
  }, [toast, t]);

  const processOCR = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage(t('Tools.image-ocr.initializing'));
    
    try {
      const result = await Tesseract.recognize(image, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setProgressMessage(t('Tools.image-ocr.recognizing'));
          } else if (m.status === 'loading language traineddata') {
            setProgressMessage(t('Tools.image-ocr.loadingLanguage'));
          }
        },
      });
      
      setText(result.data.text);
      toast({
        title: t('Common.messages.complete'),
        description: t('Tools.image-ocr.extractComplete'),
      });
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.copy'),
    });
  };

  const handleReset = () => {
    setImage(null);
    setText('');
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.image-ocr.imageLabel')}
                </span>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    disabled={!image}
                    data-testid="button-reset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {!image ? (
                <FileUploadZone
                  onFileSelect={handleFilesFromDropzone}
                  accept="image/*"
                  className="min-h-[300px]"
                />
              ) : (
                <div className="relative min-h-[300px] rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                  <img
                    src={image}
                    alt="OCR source"
                    className="max-w-full max-h-[400px] object-contain"
                    data-testid="image-preview"
                  />
                </div>
              )}
              
              {image && (
                <Button
                  onClick={processOCR}
                  disabled={isProcessing}
                  className="w-full"
                  data-testid="button-extract"
                >
                  <ScanText className="h-4 w-4 mr-2" />
                  {isProcessing ? progressMessage : t('Tools.image-ocr.extractText')}
                </Button>
              )}
              
              {isProcessing && (
                <Progress value={progress} className="w-full" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('Tools.image-ocr.textLabel')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!text}
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('Tools.image-ocr.textPlaceholder')}
                className="min-h-[350px] font-mono text-sm resize-none"
                data-testid="textarea-output"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
