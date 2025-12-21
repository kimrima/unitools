import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Share2, Check, Image as ImageIcon, FileText, Video, Music } from 'lucide-react';

interface FileResultCardProps {
  fileName: string;
  fileSize: string;
  fileType?: 'image' | 'pdf' | 'video' | 'audio' | 'other';
  previewUrl?: string;
  onDownload: () => void;
  onShare?: () => void;
}

export function FileResultCard({ 
  fileName, 
  fileSize, 
  fileType = 'other',
  previewUrl,
  onDownload, 
  onShare 
}: FileResultCardProps) {
  const { t } = useTranslation();

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return ImageIcon;
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  const FileIcon = getFileIcon();

  return (
    <div className="bg-muted/50 p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-background rounded-xl flex items-center justify-center border shrink-0 overflow-hidden relative">
        {previewUrl && fileType === 'image' ? (
          <img 
            src={previewUrl} 
            alt={fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            fileType === 'image' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' :
            fileType === 'video' ? 'bg-black' :
            'bg-muted'
          }`}>
            <FileIcon className={`w-10 h-10 ${fileType === 'video' ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
        <div className="font-bold text-lg truncate" data-testid="text-filename">
          {fileName}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          <span className="bg-background px-3 py-1 rounded-full border text-xs font-medium text-muted-foreground">
            {fileSize}
          </span>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1 text-xs font-medium">
            <Check className="w-3 h-3" /> 
            {t('Common.messages.ready', { defaultValue: 'Ready' })}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full md:w-auto">
        <Button 
          size="lg" 
          onClick={onDownload}
          className="w-full rounded-xl shadow-lg"
          data-testid="button-download"
        >
          <Download className="mr-2 w-5 h-5" /> 
          {t('Common.actions.download', { defaultValue: 'Download' })}
        </Button>
        {onShare && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={onShare}
            className="w-full rounded-xl"
            data-testid="button-share"
          >
            <Share2 className="mr-2 w-5 h-5" /> 
            {t('Common.actions.share', { defaultValue: 'Share' })}
          </Button>
        )}
      </div>
    </div>
  );
}
