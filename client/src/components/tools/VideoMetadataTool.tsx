import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploadZone } from '@/components/tool-ui';
import { FileVideo } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const {
    files,
    addFiles,
    reset: resetHandler,
  } = useFileHandler({ accept: 'video/*', multiple: false, maxSizeBytes: 500 * 1024 * 1024 });

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

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const videoFiles = Array.from(fileList).filter(f => f.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      addFiles([videoFiles[0]]);
      setMetadata(null);
      setVideoUrl(URL.createObjectURL(videoFiles[0]));
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

  const reset = useCallback(() => {
    resetHandler();
    setMetadata(null);
    setVideoUrl(null);
  }, [resetHandler]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">{t('Tools.video-metadata.instructions')}</div>

      <FileUploadZone
        onFileSelect={handleFilesFromDropzone}
        accept="video/*"
      />

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
