import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultSuccessHeader } from './ResultSuccessHeader';
import { FileResultCard } from './FileResultCard';
import { PrivacyNote } from './PrivacyNote';
import { RelatedTools } from './RelatedTools';

export interface ResultFile {
  fileName: string;
  fileSize: string;
  fileType?: 'image' | 'pdf' | 'video' | 'audio' | 'other';
  previewUrl?: string;
  downloadUrl: string;
  blob?: Blob;
}

interface ProcessingResultLayoutProps {
  toolId: string;
  toolCategory?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string | number }>;
  files: ResultFile[];
  onReset: () => void;
  onDownload: (file: ResultFile) => void;
  onDownloadAll?: () => void;
  onShare?: (file: ResultFile) => void;
  showRelatedTools?: boolean;
}

export function ProcessingResultLayout({
  toolId,
  toolCategory,
  title,
  subtitle,
  stats,
  files,
  onReset,
  onDownload,
  onDownloadAll,
  onShare,
  showRelatedTools = true,
}: ProcessingResultLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <ResultSuccessHeader 
        title={title} 
        subtitle={subtitle}
        stats={stats}
      />

      <div className="space-y-4">
        {files.map((file, index) => (
          <FileResultCard
            key={index}
            fileName={file.fileName}
            fileSize={file.fileSize}
            fileType={file.fileType}
            previewUrl={file.previewUrl}
            onDownload={() => onDownload(file)}
            onShare={onShare ? () => onShare(file) : undefined}
          />
        ))}
      </div>

      {files.length > 1 && onDownloadAll && (
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={onDownloadAll}
            className="rounded-xl"
            data-testid="button-download-all"
          >
            {t('Common.actions.downloadAll')}
          </Button>
        </div>
      )}

      <div className="flex justify-center py-4 border-y border-dashed border-border">
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-muted-foreground"
          data-testid="button-process-another"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Common.actions.processAnother')}
        </Button>
      </div>

      <PrivacyNote variant="success" />

      {showRelatedTools && (
        <RelatedTools 
          currentToolId={toolId} 
          category={toolCategory}
        />
      )}
    </div>
  );
}
