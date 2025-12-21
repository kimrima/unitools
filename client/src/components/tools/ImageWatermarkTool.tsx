import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { addTextWatermark } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileUploadZone } from '@/components/tool-ui';
import { Download, Loader2, CheckCircle } from 'lucide-react';

export default function ImageWatermarkTool() {
  const { t } = useTranslation();
  const [watermarkText, setWatermarkText] = useState('');
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([48]);
  const [position, setPosition] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('center');
  
  const {
    files,
    status,
    error,
    progress,
    resultBlob,
    addFiles,
    setStatus,
    setError,
    setResult,
    setProgress,
    downloadResult,
    reset,
  } = useFileHandler({ accept: 'image/*', multiple: false });

  const handleFilesFromDropzone = useCallback((files: FileList) => {
    addFiles(files);
  }, [addFiles]);

  const handleApply = useCallback(async () => {
    if (!files[0]?.previewUrl || !watermarkText.trim()) return;
    setStatus('processing');
    setProgress(0);
    setError(null);
    try {
      const blob = await addTextWatermark(
        files[0].previewUrl,
        watermarkText,
        { fontSize: fontSize[0], opacity: opacity[0] / 100, position, color: '#ffffff' },
        files[0].file.type.includes('png') ? 'png' : 'jpg',
        (prog) => setProgress(prog.percentage)
      );
      setResult(blob);
    } catch {
      setError({ code: 'WATERMARK_FAILED' });
      setStatus('error');
    }
  }, [files, watermarkText, fontSize, opacity, position, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_watermarked.${ext}`);
  }, [files, downloadResult]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.image-watermark.description')}</div>

      {status === 'idle' && files.length === 0 && (
        <FileUploadZone
          onFileSelect={handleFilesFromDropzone}
          accept="image/*"
        />
      )}

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && <img src={files[0].previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-muted rounded" />}
          </Card>
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>{t('Tools.image-watermark.textLabel', { defaultValue: 'Watermark Text' })}</Label>
              <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter text..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.image-watermark.opacity', { defaultValue: 'Opacity' })}: {opacity[0]}%</Label>
                <Slider value={opacity} onValueChange={setOpacity} min={10} max={100} step={5} />
              </div>
              <div className="space-y-2">
                <Label>{t('Tools.image-watermark.fontSize', { defaultValue: 'Font Size' })}: {fontSize[0]}px</Label>
                <Slider value={fontSize} onValueChange={setFontSize} min={12} max={120} step={4} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('Tools.image-watermark.position', { defaultValue: 'Position' })}</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as typeof position)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
          <div className="flex gap-3">
            <Button onClick={handleApply} className="flex-1" disabled={!watermarkText.trim()}>{t('Tools.image-watermark.title')}</Button>
            <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {status === 'success' && resultBlob && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownload}><Download className="w-5 h-5 mr-2" />{t('Common.workflow.download')}</Button>
            <Button variant="outline" size="lg" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {error && <div className="text-center text-destructive py-4">{t('Common.messages.error')}</div>}
    </div>
  );
}
