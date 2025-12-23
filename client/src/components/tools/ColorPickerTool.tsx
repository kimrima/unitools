import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileHandler } from '@/hooks/useFileHandler';
import { extractColors } from '@/lib/engines/imageEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadZone } from '@/components/tool-ui';
import { Copy, Check, Crosshair, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PickedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  x: number;
  y: number;
}

export default function ColorPickerTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [mode, setMode] = useState<'picker' | 'palette'>('picker');
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const { files, addFiles, reset } = useFileHandler({ accept: 'image/*', multiple: false });

  useEffect(() => {
    async function extract() {
      if (files.length > 0 && files[0].previewUrl) {
        try {
          const extractedColors = await extractColors(files[0].previewUrl, 8);
          setPaletteColors(extractedColors);
        } catch {
          setPaletteColors([]);
        }
      }
    }
    extract();
  }, [files]);

  useEffect(() => {
    if (files.length > 0 && files[0].previewUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = document.createElement('img');
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = files[0].previewUrl;
    }
  }, [files]);

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    addFiles(fileList);
    setPickedColors([]);
    setPaletteColors([]);
  }, [addFiles]);

  const getColorAtPosition = useCallback((clientX: number, clientY: number): PickedColor | null => {
    if (!canvasRef.current || !containerRef.current || !imageDimensions) return null;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;
    const scaleX = imageDimensions.width / displayWidth;
    const scaleY = imageDimensions.height / displayHeight;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x < 0 || y < 0 || x >= imageDimensions.width || y >= imageDimensions.height) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;

    return {
      hex,
      rgb: { r: pixel[0], g: pixel[1], b: pixel[2] },
      x,
      y,
    };
  }, [imageDimensions]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const color = getColorAtPosition(e.clientX, e.clientY);
    if (color) {
      setPickedColors(prev => [color, ...prev.slice(0, 9)]);
      toast({ title: t('Tools.color-picker.colorPicked', { defaultValue: 'Color picked!' }), description: color.hex.toUpperCase() });
    }
  }, [getColorAtPosition, toast, t]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const color = getColorAtPosition(e.clientX, e.clientY);
    setHoverColor(color?.hex || null);
  }, [getColorAtPosition]);

  const handleMouseLeave = useCallback(() => {
    setHoverColor(null);
    setCursorPos(null);
  }, []);

  const copyColor = useCallback((color: string, id: string) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(id);
    toast({ title: t('Tools.color-picker.copied', { defaultValue: 'Color copied!' }), description: color.toUpperCase() });
    setTimeout(() => setCopiedIndex(null), 2000);
  }, [t, toast]);

  const handleReset = useCallback(() => {
    reset();
    setPaletteColors([]);
    setPickedColors([]);
    setImageDimensions(null);
  }, [reset]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.color-picker.description')}</div>

      {files.length === 0 && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'picker' | 'palette')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="picker" data-testid="tab-picker">
                <Crosshair className="w-4 h-4 mr-2" />
                {t('Tools.color-picker.pickMode', { defaultValue: 'Pick Color' })}
              </TabsTrigger>
              <TabsTrigger value="palette" data-testid="tab-palette">
                <Palette className="w-4 h-4 mr-2" />
                {t('Tools.color-picker.paletteMode', { defaultValue: 'Extract Palette' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="picker" className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('Tools.color-picker.clickInstruction', { defaultValue: 'Click on the image to pick exact colors' })}
                </p>
                <div
                  ref={containerRef}
                  className="relative cursor-crosshair bg-muted rounded overflow-hidden"
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {files[0].previewUrl && (
                    <img src={files[0].previewUrl} alt="Source" className="w-full max-h-80 object-contain" />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                  {hoverColor && cursorPos && (
                    <div
                      className="absolute pointer-events-none z-10 flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-black/80 text-white"
                      style={{ left: cursorPos.x + 10, top: cursorPos.y + 10 }}
                    >
                      <div className="w-4 h-4 rounded border border-white/50" style={{ backgroundColor: hoverColor }} />
                      {hoverColor.toUpperCase()}
                    </div>
                  )}
                </div>
              </Card>

              {pickedColors.length > 0 && (
                <Card className="p-4">
                  <p className="font-medium mb-3">{t('Tools.color-picker.pickedColors', { defaultValue: 'Picked Colors' })}</p>
                  <div className="grid grid-cols-5 gap-3">
                    {pickedColors.map((color, index) => (
                      <div
                        key={`picked-${index}`}
                        onClick={() => copyColor(color.hex, `picked-${index}`)}
                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: color.hex }} />
                        <div className="flex items-center gap-1 text-xs font-mono">
                          {copiedIndex === `picked-${index}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          {color.hex.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="palette" className="space-y-4">
              <Card className="p-4">
                {files[0].previewUrl && (
                  <img src={files[0].previewUrl} alt="Image" className="w-full max-h-64 object-contain bg-muted rounded" />
                )}
              </Card>

              {paletteColors.length > 0 && (
                <Card className="p-4">
                  <p className="font-medium mb-3">{t('Tools.color-picker.extractedColors', { defaultValue: 'Extracted Palette' })}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {paletteColors.map((color, index) => (
                      <div
                        key={`palette-${index}`}
                        onClick={() => copyColor(color, `palette-${index}`)}
                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: color }} />
                        <div className="flex items-center gap-1 text-xs font-mono">
                          {copiedIndex === `palette-${index}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          {color.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Button variant="outline" onClick={handleReset} className="w-full" data-testid="button-reset">
            {t('Common.workflow.startOver')}
          </Button>
        </div>
      )}
    </div>
  );
}
