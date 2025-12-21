import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, MonitorPlay, Square, AlertTriangle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function ScreenRecorderTool() {
  const { t } = useTranslation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatFileSize = useCallback((bytes: number): string => {
    const data = getFileSizeData(bytes);
    return `${data.value} ${t(`Common.units.${data.unit}`)}`;
  }, [t]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: includeAudio
      });

      let combinedStream = displayStream;

      if (includeAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream = new MediaStream([
              ...displayStream.getVideoTracks(),
              audioTrack
            ]);
          }
        } catch {
          console.log('Microphone access denied, recording without mic audio');
        }
      }

      streamRef.current = combinedStream;
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          stopRecording();
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch {
      setPermissionDenied(true);
    }
  }, [includeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const handleDownload = useCallback(() => {
    if (!videoBlob) return;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    downloadBlob(videoBlob, `unitools_screen_${timestamp}.webm`);
  }, [videoBlob]);

  const reset = useCallback(() => {
    setVideoBlob(null);
    setVideoUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (typeof navigator.mediaDevices?.getDisplayMedia === 'undefined') {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t('Common.messages.browserNotSupported')}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {t('Common.messages.screenRecordingNotSupported')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t('Common.messages.screenPermissionDenied')}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {t('Common.messages.screenPermissionRequired')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground" data-testid="text-instructions">
        {t('Tools.screen-recorder.instructions')}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-audio">{t('Common.messages.includeAudio')}</Label>
            <Switch
              id="include-audio"
              checked={includeAudio}
              onCheckedChange={setIncludeAudio}
              disabled={isRecording}
              data-testid="switch-include-audio"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
            isRecording 
              ? 'bg-red-100 dark:bg-red-900/30 animate-pulse'
              : 'bg-muted'
          }`}>
            <MonitorPlay className={`w-10 h-10 ${
              isRecording ? 'text-red-600' : 'text-muted-foreground'
            }`} />
          </div>

          <div className="text-3xl font-mono" data-testid="text-recording-time">
            {formatTime(recordingTime)}
          </div>

          <div className="flex gap-4">
            {!isRecording && !videoBlob && (
              <Button onClick={startRecording} size="lg" data-testid="button-start-recording">
                <MonitorPlay className="w-5 h-5 mr-2" />
                {t('Common.actions.startScreenRecording')}
              </Button>
            )}

            {isRecording && (
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={stopRecording}
                data-testid="button-stop-recording"
              >
                <Square className="w-5 h-5 mr-2" />
                {t('Common.actions.stop')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {videoBlob && videoUrl && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  {t('Common.messages.recordingComplete')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatTime(recordingTime)} / {formatFileSize(videoBlob.size)}
                </p>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')}
              </Button>
            </div>

            <video
              src={videoUrl}
              controls
              className="w-full max-h-64 rounded-lg"
              data-testid="video-preview"
            />

            <Button variant="outline" onClick={reset} className="w-full" data-testid="button-reset">
              {t('Common.actions.recordAgain')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
