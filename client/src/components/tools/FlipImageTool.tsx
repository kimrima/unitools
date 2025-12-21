import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { flipImage } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Loader2, CheckCircle, FlipHorizontal, FlipVertical } from 'lucide-react';

export default function FlipImageTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flipHorizontal, setFlipHorizontal] = useState(true);
  const [flipVertical, setFlipVertical] = useState(false);
  
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) addFiles(droppedFiles);
  }, [addFiles]);

  const handleFlip = useCallback(async () => {
    if (!files[0]?.previewUrl) return;
    setStatus('processing');
    setProgress(0);
    setError(null);
    try {
      const blob = await flipImage(
        files[0].previewUrl,
        flipHorizontal,
        flipVertical,
        files[0].file.type.includes('png') ? 'png' : 'jpg',
        (prog) => setProgress(prog.percentage)
      );
      setResult(blob);
    } catch {
      setError({ code: 'FLIP_FAILED' });
      setStatus('error');
    }
  }, [files, flipHorizontal, flipVertical, setStatus, setProgress, setError, setResult]);

  const handleDownload = useCallback(() => {
    const ext = files[0]?.file.type.includes('png') ? 'png' : 'jpg';
    downloadResult(`unitools_flipped.${ext}`);
  }, [files, downloadResult]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.flip-image.description')}</div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {status === 'idle' && files.length === 0 && (
        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl min-h-64 flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FlipHorizontal className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{t('Common.workflow.dropFilesHere')}</p>
          </div>
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />{t('Common.workflow.selectFiles')}</Button>
        </div>
      )}

      {status === 'idle' && files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            {files[0].previewUrl && (
              <img src={files[0].previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-muted rounded"
                style={{ transform: `scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})` }} />
            )}
          </Card>
          <div className="flex justify-center gap-4">
            <Button variant={flipHorizontal ? 'default' : 'outline'} onClick={() => { setFlipHorizontal(true); setFlipVertical(false); }}>
              <FlipHorizontal className="w-4 h-4 mr-2" />{t('Tools.flip-image.horizontal', { defaultValue: 'Horizontal' })}
            </Button>
            <Button variant={flipVertical ? 'default' : 'outline'} onClick={() => { setFlipVertical(true); setFlipHorizontal(false); }}>
              <FlipVertical className="w-4 h-4 mr-2" />{t('Tools.flip-image.vertical', { defaultValue: 'Vertical' })}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleFlip} className="flex-1">{t('Tools.flip-image.title')}</Button>
            <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-6 py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
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
