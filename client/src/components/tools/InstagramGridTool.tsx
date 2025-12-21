import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Grid, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const GRID_OPTIONS = [
  { id: '3x1', cols: 3, rows: 1, label: '3x1 (Horizontal)' },
  { id: '1x3', cols: 1, rows: 3, label: '1x3 (Vertical)' },
  { id: '3x2', cols: 3, rows: 2, label: '3x2 (6 images)' },
  { id: '3x3', cols: 3, rows: 3, label: '3x3 (9 images)' },
];

export default function InstagramGridTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [gridType, setGridType] = useState('3x3');
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      generatePreviews(img, gridType);
    };
    img.src = URL.createObjectURL(file);
  };

  const generatePreviews = (img: HTMLImageElement, grid: string) => {
    const option = GRID_OPTIONS.find(o => o.id === grid);
    if (!option) return;

    const { cols, rows } = option;
    const tileWidth = img.width / cols;
    const tileHeight = img.height / rows;
    const newPreviews: string[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = document.createElement('canvas');
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(
            img,
            col * tileWidth, row * tileHeight, tileWidth, tileHeight,
            0, 0, tileWidth, tileHeight
          );
          newPreviews.push(canvas.toDataURL('image/png'));
        }
      }
    }

    setPreviews(newPreviews);
  };

  const handleGridChange = (value: string) => {
    setGridType(value);
    if (image) {
      generatePreviews(image, value);
    }
  };

  const handleDownloadAll = async () => {
    if (previews.length === 0) return;

    const zip = new JSZip();
    
    previews.forEach((preview, index) => {
      const base64 = preview.split(',')[1];
      zip.file(`grid-${index + 1}.png`, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'instagram-grid.zip';
    link.click();

    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.instagram-grid.downloaded'),
    });
  };

  const handleDownloadSingle = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `grid-${index + 1}.png`;
    link.click();
  };

  const currentGrid = GRID_OPTIONS.find(o => o.id === gridType);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Tools.instagram-grid.gridLabel')}</Label>
                <Select value={gridType} onValueChange={handleGridChange}>
                  <SelectTrigger data-testid="select-grid">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRID_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('Tools.instagram-grid.uploadLabel')}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="grid-upload"
                    data-testid="input-file"
                  />
                  <label htmlFor="grid-upload" className="cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('Tools.instagram-grid.uploadHint')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {previews.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <Label>{t('Tools.instagram-grid.previewLabel')}</Label>
                  <Button onClick={handleDownloadAll} data-testid="button-download-all">
                    <Download className="h-4 w-4 mr-2" />
                    {t('Tools.instagram-grid.downloadAll')}
                  </Button>
                </div>
                
                <div 
                  className="grid gap-2 border rounded-lg p-4 bg-muted/30"
                  style={{ 
                    gridTemplateColumns: `repeat(${currentGrid?.cols || 3}, 1fr)` 
                  }}
                >
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Grid ${index + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDownloadSingle(preview, index)}
                        data-testid={`button-download-${index}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <span className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  {t('Tools.instagram-grid.uploadOrder')}
                </p>
              </>
            )}

            {!image && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Grid className="h-12 w-12 mx-auto mb-2" />
                  <p>{t('Tools.instagram-grid.noImage')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
