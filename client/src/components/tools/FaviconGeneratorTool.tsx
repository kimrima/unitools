import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUploadZone } from '@/components/tool-ui';
import { StagedLoadingOverlay } from '@/components/StagedLoadingOverlay';
import { useStagedProcessing } from '@/hooks/useStagedProcessing';
import { ShareActions } from '@/components/ShareActions';
import { Download, CheckCircle, Image, Package } from 'lucide-react';
import JSZip from 'jszip';

interface FaviconSize {
  size: number;
  label: string;
  description: string;
  checked: boolean;
}

const defaultSizes: FaviconSize[] = [
  { size: 16, label: '16x16', description: 'Browser tab', checked: true },
  { size: 32, label: '32x32', description: 'Browser tab (Retina)', checked: true },
  { size: 48, label: '48x48', description: 'Windows site icons', checked: true },
  { size: 64, label: '64x64', description: 'Windows taskbar', checked: false },
  { size: 180, label: '180x180', description: 'Apple Touch Icon', checked: true },
  { size: 192, label: '192x192', description: 'Android Chrome', checked: true },
  { size: 512, label: '512x512', description: 'PWA / Manifest', checked: true },
];

export default function FaviconGeneratorTool() {
  const { t } = useTranslation();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string>('');
  const [sizes, setSizes] = useState<FaviconSize[]>(defaultSizes);
  const [includeIco, setIncludeIco] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{ name: string; size: number }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const stagedProcessing = useStagedProcessing({
    minDuration: 3000,
    stages: [
      { name: 'analyzing', duration: 600, message: t('Common.stages.analyzingFiles', { defaultValue: 'Analyzing image...' }) },
      { name: 'processing', duration: 1800, message: t('Common.stages.generatingFavicons', { defaultValue: 'Generating favicons...' }) },
      { name: 'optimizing', duration: 600, message: t('Common.stages.packagingFiles', { defaultValue: 'Packaging files...' }) },
    ],
  });

  const handleFilesFromDropzone = useCallback((fileList: FileList) => {
    const file = fileList[0];
    if (file && file.type.startsWith('image/')) {
      setSourceFile(file);
      const url = URL.createObjectURL(file);
      setSourcePreview(url);
      setShowResults(false);
      setResultBlob(null);
      setGeneratedFiles([]);
    }
  }, []);

  const toggleSize = (index: number) => {
    setSizes(prev => prev.map((s, i) => i === index ? { ...s, checked: !s.checked } : s));
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateFavicon = async (img: HTMLImageElement, size: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed')), 'image/png');
    });
  };

  const generateIco = async (img: HTMLImageElement): Promise<Blob> => {
    const icoSizes = [16, 32, 48];
    const images: { size: number; data: Uint8Array }[] = [];

    for (const size of icoSizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);

      const bmpData = new Uint8Array(40 + size * size * 4);
      const dv = new DataView(bmpData.buffer);

      dv.setUint32(0, 40, true);
      dv.setInt32(4, size, true);
      dv.setInt32(8, size * 2, true);
      dv.setUint16(12, 1, true);
      dv.setUint16(14, 32, true);
      dv.setUint32(16, 0, true);
      dv.setUint32(20, size * size * 4, true);

      for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
          const srcIdx = (y * size + x) * 4;
          const dstIdx = 40 + ((size - 1 - y) * size + x) * 4;
          bmpData[dstIdx] = imageData.data[srcIdx + 2];
          bmpData[dstIdx + 1] = imageData.data[srcIdx + 1];
          bmpData[dstIdx + 2] = imageData.data[srcIdx];
          bmpData[dstIdx + 3] = imageData.data[srcIdx + 3];
        }
      }

      images.push({ size, data: bmpData });
    }

    const headerSize = 6 + images.length * 16;
    let dataOffset = headerSize;
    const totalSize = headerSize + images.reduce((sum, img) => sum + img.data.length, 0);
    const icoData = new Uint8Array(totalSize);
    const view = new DataView(icoData.buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, images.length, true);

    let dirOffset = 6;
    for (const img of images) {
      icoData[dirOffset] = img.size === 256 ? 0 : img.size;
      icoData[dirOffset + 1] = img.size === 256 ? 0 : img.size;
      icoData[dirOffset + 2] = 0;
      icoData[dirOffset + 3] = 0;
      view.setUint16(dirOffset + 4, 1, true);
      view.setUint16(dirOffset + 6, 32, true);
      view.setUint32(dirOffset + 8, img.data.length, true);
      view.setUint32(dirOffset + 12, dataOffset, true);
      dirOffset += 16;
      dataOffset += img.data.length;
    }

    let writeOffset = headerSize;
    for (const img of images) {
      icoData.set(img.data, writeOffset);
      writeOffset += img.data.length;
    }

    return new Blob([icoData], { type: 'image/x-icon' });
  };

  const handleGenerate = useCallback(async () => {
    if (!sourcePreview) return;
    setShowResults(false);

    const selectedSizes = sizes.filter(s => s.checked);
    if (selectedSizes.length === 0 && !includeIco) return;

    try {
      await stagedProcessing.runStagedProcessing(async () => {
        const img = await loadImage(sourcePreview);
        const zip = new JSZip();
        const files: { name: string; size: number }[] = [];

        for (const sizeConfig of selectedSizes) {
          const blob = await generateFavicon(img, sizeConfig.size);
          const name = sizeConfig.size === 180 
            ? 'apple-touch-icon.png' 
            : sizeConfig.size === 192 
              ? 'android-chrome-192x192.png'
              : sizeConfig.size === 512 
                ? 'android-chrome-512x512.png'
                : `favicon-${sizeConfig.size}x${sizeConfig.size}.png`;
          zip.file(name, blob);
          files.push({ name, size: blob.size });
        }

        if (includeIco) {
          const icoBlob = await generateIco(img);
          zip.file('favicon.ico', icoBlob);
          files.push({ name: 'favicon.ico', size: icoBlob.size });
        }

        const htmlSnippet = `<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
        zip.file('html-snippet.txt', htmlSnippet);

        const manifestJson = {
          name: 'Your App',
          short_name: 'App',
          icons: selectedSizes.filter(s => [192, 512].includes(s.size)).map(s => ({
            src: s.size === 192 ? '/android-chrome-192x192.png' : '/android-chrome-512x512.png',
            sizes: `${s.size}x${s.size}`,
            type: 'image/png',
          })),
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
        };
        zip.file('site.webmanifest', JSON.stringify(manifestJson, null, 2));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob(zipBlob);
        setGeneratedFiles(files);
        return zipBlob;
      });
      setShowResults(true);
    } catch (err) {
      console.error('Favicon generation error:', err);
    }
  }, [sourcePreview, sizes, includeIco, stagedProcessing]);

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(resultBlob);
    a.download = 'unitools_favicons.zip';
    a.click();
  };

  const reset = useCallback(() => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourceFile(null);
    setSourcePreview('');
    setSizes(defaultSizes);
    setIncludeIco(true);
    setResultBlob(null);
    setGeneratedFiles([]);
    setShowResults(false);
    stagedProcessing.reset();
  }, [sourcePreview, stagedProcessing]);

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    };
  }, []);

  const selectedCount = sizes.filter(s => s.checked).length + (includeIco ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{t('Tools.favicon-generator.description')}</div>

      {!stagedProcessing.isProcessing && !showResults && !sourceFile && (
        <FileUploadZone onFileSelect={handleFilesFromDropzone} accept="image/*" />
      )}

      {!stagedProcessing.isProcessing && !showResults && sourceFile && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                <img src={sourcePreview} alt="Source" className="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <p className="font-medium">{sourceFile.name}</p>
                <p className="text-sm text-muted-foreground">{t('Tools.favicon-generator.sourceImage', { defaultValue: 'Source image for favicons' })}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <Label className="text-base font-medium">{t('Tools.favicon-generator.selectSizes', { defaultValue: 'Select Sizes' })}</Label>
            <div className="space-y-3">
              {sizes.map((size, index) => (
                <div key={size.size} className="flex items-center gap-3">
                  <Checkbox
                    checked={size.checked}
                    onCheckedChange={() => toggleSize(index)}
                    id={`size-${size.size}`}
                    data-testid={`checkbox-size-${size.size}`}
                  />
                  <label htmlFor={`size-${size.size}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{size.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">- {size.description}</span>
                  </label>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Checkbox
                  checked={includeIco}
                  onCheckedChange={(c) => setIncludeIco(!!c)}
                  id="include-ico"
                  data-testid="checkbox-ico"
                />
                <label htmlFor="include-ico" className="flex-1 cursor-pointer">
                  <span className="font-medium">favicon.ico</span>
                  <span className="text-sm text-muted-foreground ml-2">- {t('Tools.favicon-generator.icoDescription', { defaultValue: 'Multi-size ICO (16, 32, 48)' })}</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleGenerate} disabled={selectedCount === 0} data-testid="button-generate">
              <Image className="w-4 h-4 mr-2" />
              {t('Tools.favicon-generator.generateButton', { defaultValue: 'Generate Favicons' })} ({selectedCount})
            </Button>
            <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
          </div>
        </div>
      )}

      {stagedProcessing.isProcessing && (
        <StagedLoadingOverlay
          stage={stagedProcessing.stage}
          progress={stagedProcessing.progress}
          stageProgress={stagedProcessing.stageProgress}
          message={stagedProcessing.message}
          error={stagedProcessing.error}
          onCancel={stagedProcessing.abort}
        />
      )}

      {showResults && resultBlob && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('Common.workflow.processingComplete')}</span>
              </div>
              <div className="w-full space-y-2">
                <p className="font-medium text-sm">{t('Tools.favicon-generator.generatedFiles', { defaultValue: 'Generated Files' })}:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {generatedFiles.map(file => (
                    <div key={file.name} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownload} data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Tools.favicon-generator.downloadZip', { defaultValue: 'Download ZIP' })}
                </Button>
                <Button variant="outline" onClick={reset}>{t('Common.workflow.startOver')}</Button>
              </div>
            </div>
          </Card>
          <ShareActions />
        </div>
      )}
    </div>
  );
}
