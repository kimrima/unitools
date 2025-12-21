import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFileSizeData } from '@/lib/engines/imageCompress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Mic, Square, Play, Pause, AlertTriangle } from 'lucide-react';
import { downloadBlob } from '@/hooks/useToolEngine';

export default function VoiceRecorderTool() {
  const { t } = useTranslation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<'webm' | 'wav'>('webm');
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = format === 'webm' ? 'audio/webm' : 'audio/wav';
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch {
      setPermissionDenied(true);
    }
  }, [format]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const handleDownload = useCallback(() => {
    if (!audioBlob) return;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    downloadBlob(audioBlob, `unitools_recording_${timestamp}.webm`);
  }, [audioBlob]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (permissionDenied) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t('Common.messages.microphonePermissionDenied')}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {t('Common.messages.microphonePermissionRequired')}
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
        {t('Tools.voice-recorder.instructions')}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>{t('Common.messages.outputFormat')}</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'webm' | 'wav')} disabled={isRecording}>
              <SelectTrigger data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
            isRecording 
              ? isPaused 
                ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                : 'bg-red-100 dark:bg-red-900/30 animate-pulse'
              : 'bg-muted'
          }`}>
            <Mic className={`w-10 h-10 ${
              isRecording 
                ? isPaused 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
                : 'text-muted-foreground'
            }`} />
          </div>

          <div className="text-3xl font-mono" data-testid="text-recording-time">
            {formatTime(recordingTime)}
          </div>

          <div className="flex gap-4">
            {!isRecording && !audioBlob && (
              <Button onClick={startRecording} size="lg" data-testid="button-start-recording">
                <Mic className="w-5 h-5 mr-2" />
                {t('Common.actions.startRecording')}
              </Button>
            )}

            {isRecording && (
              <>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={pauseRecording}
                  data-testid="button-pause-recording"
                >
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? t('Common.actions.resume') : t('Common.actions.pause')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  onClick={stopRecording}
                  data-testid="button-stop-recording"
                >
                  <Square className="w-5 h-5 mr-2" />
                  {t('Common.actions.stop')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {audioBlob && audioUrl && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  {t('Common.messages.recordingComplete')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatTime(recordingTime)} / {formatFileSize(audioBlob.size)}
                </p>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                {t('Common.actions.download')}
              </Button>
            </div>

            <audio
              src={audioUrl}
              controls
              className="w-full"
              data-testid="audio-preview"
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
