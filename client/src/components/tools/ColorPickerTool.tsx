import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { extractColors } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUploadZone } from '@/components/tool-ui';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ColorPickerTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [colors, setColors] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { files, addFiles, reset } = useFileHandler({ accept: 'image/*', multiple: false });

  useEffect(() => {
    async function extract() {
      if (files.length > 0 && files[0].previewUrl) {
        try {
          const extractedColors = await extractColors(files[0].previewUrl, 8);
          setColors(extractedColors);
        } catch {
          setColors([]);
        }
      }
    }
    extract();
  }, [files]);

  const handleFilesFromDropzone = useCallback((files: FileList) => {
    addFiles(files);
  }, [addFiles]);

  const copyColor = useCallback((color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    toast({ title: t('Tools.color-picker.copied', { defaultValue: 'Color copied!' }), description: color });
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [t, toast]);

  const handleReset = useCallback(() => {
    reset();
    setColors([]);
  }, [reset]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.color-picker.description')}</div>

      {files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && <img src={files[0].previewUrl} alt="Image" className="w-full max-h-64 object-contain bg-muted rounded" />}
          </Card>

          {colors.length > 0 && (
            <Card className="p-4">
              <p className="font-medium mb-3">{t('Tools.color-picker.extractedColors', { defaultValue: 'Extracted Colors' })}</p>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color, index) => (
                  <div key={index} onClick={() => copyColor(color, index)}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: color }} />
                    <div className="flex items-center gap-1 text-xs font-mono">
                      {copiedIndex === index ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {color.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button variant="outline" onClick={handleReset} className="w-full">{t('Common.workflow.startOver')}</Button>
        </div>
      )}
    </div>
  );
}
