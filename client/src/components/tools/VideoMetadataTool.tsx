import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler, type FileHandlerError } from '@/hooks/useFileHandler';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Upload, FileVideo } from 'lucide-react';

interface VideoMetadata {
  name: string;
  type: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
}

export default function VideoMetadataTool() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const {
    files,
    addFiles,
    clearFiles,
    reset: resetHandler,
  } = useFileHandler({ accept: 'video/*', multiple: false });

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
      setMetadata(null);
      setVideoUrl(URL.createObjectURL(e.target.files[0]));
    }
  }, [addFiles]);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current && files[0]) {
      const video = videoRef.current;
      const w = video.videoWidth;
      const h = video.videoHeight;
      const divisor = gcd(w, h);
      
      setMetadata({
        name: files[0].file.name,
        type: files[0].file.type,
        size: files[0].file.size,
        duration: video.duration,
        width: w,
        height: h,
        aspectRatio: `${w / divisor}:${h / divisor}`,
      });
    }
  }, [files]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    if (droppedFiles.length > 0) {
      addFiles([droppedFiles[0]]);
      setMetadata(null);
      setVideoUrl(URL.createObjectURL(droppedFiles[0]));
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => e.preventDefault(), []);

  const reset = useCallback(() => {
    resetHandler();
    setMetadata(null);
    setVideoUrl(null);
  }, [resetHandler]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">{t('Tools.video-metadata.instructions')}</div>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" data-testid="input-file-video" />

      <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-40 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer p-6" data-testid="dropzone-video">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">{t('Common.messages.dragDrop')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('Common.messages.noServerUpload')}</p>
        </div>
      </div>

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleVideoLoaded}
          className="hidden"
        />
      )}

      {metadata && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <FileVideo className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{metadata.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>{t('Common.actions.clear')}</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('Common.messages.fileType')}</p>
                <p className="font-medium">{metadata.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('Common.messages.fileSize')}</p>
                <p className="font-medium">{formatFileSize(metadata.size)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('Common.messages.duration')}</p>
                <p className="font-medium">{formatDuration(metadata.duration)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('Common.messages.resolution')}</p>
                <p className="font-medium">{metadata.width} x {metadata.height}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('Common.messages.aspectRatio')}</p>
                <p className="font-medium">{metadata.aspectRatio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {videoUrl && metadata && (
        <Card>
          <CardContent className="p-4">
            <video src={videoUrl} controls className="w-full max-h-64 rounded-lg" data-testid="video-preview" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
