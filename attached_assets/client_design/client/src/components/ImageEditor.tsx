import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, FlipHorizontal, FlipVertical, Crop, Maximize2, RefreshCcw, Download, Check, ZoomIn, ZoomOut, Type, Droplet, Sun, Contrast, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageEditorProps {
  file: File;
  toolId: string;
  onComplete: (result: { dataUrl: string; format: string; width: number; height: number }) => void;
  onCancel: () => void;
}

export function ImageEditor({ file, toolId, onComplete, onCancel }: ImageEditorProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);
  const [quality, setQuality] = useState(80);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(90);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(false);
  const [hueRotate, setHueRotate] = useState(0);
  
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 100, y: 100 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleRatio = scale / 100;
    let w = image.width * scaleRatio;
    let h = image.height * scaleRatio;

    if (rotation === 90 || rotation === 270) {
      [w, h] = [h, w];
    }

    canvas.width = w;
    canvas.height = h;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) saturate(${saturation}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg) ${invert ? 'invert(100%)' : ''}`;

    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const drawW = (rotation === 90 || rotation === 270) ? h : w;
    const drawH = (rotation === 90 || rotation === 270) ? w : h;
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    if (cornerRadius > 0) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const r = cornerRadius;
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    if (text) {
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(text, (textX / 100) * w, (textY / 100) * h);
    }

    if (cropMode) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      const cx = (cropStart.x / 100) * w;
      const cy = (cropStart.y / 100) * h;
      const cw = ((cropEnd.x - cropStart.x) / 100) * w;
      const ch = ((cropEnd.y - cropStart.y) / 100) * h;
      ctx.strokeRect(cx, cy, cw, ch);
      
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, w, cy);
      ctx.fillRect(0, cy + ch, w, h - cy - ch);
      ctx.fillRect(0, cy, cx, ch);
      ctx.fillRect(cx + cw, cy, w - cx - cw, ch);
    }
  }, [image, rotation, flipH, flipV, scale, brightness, contrast, blur, saturation, sepia, invert, hueRotate, cornerRadius, text, fontSize, textColor, textX, textY, cropMode, cropStart, cropEnd]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScale(100);
    setBrightness(100);
    setContrast(100);
    setBlur(0);
    setSaturation(100);
    setSepia(0);
    setInvert(false);
    setHueRotate(0);
    setCornerRadius(0);
    setText('');
    setCropMode(false);
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 100, y: 100 });
  };

  const handleApplyCrop = () => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const w = canvas.width;
    const h = canvas.height;
    
    const cx = (cropStart.x / 100) * w;
    const cy = (cropStart.y / 100) * h;
    const cw = ((cropEnd.x - cropStart.x) / 100) * w;
    const ch = ((cropEnd.y - cropStart.y) / 100) * h;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cw;
    tempCanvas.height = ch;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
    
    const croppedImg = new Image();
    croppedImg.onload = () => {
      setImage(croppedImg);
      setCropMode(false);
      setCropStart({ x: 0, y: 0 });
      setCropEnd({ x: 100, y: 100 });
    };
    croppedImg.src = tempCanvas.toDataURL('image/png');
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', quality / 100);
    onComplete({
      dataUrl,
      format: 'image/png',
      width: canvasRef.current.width,
      height: canvasRef.current.height
    });
  };

  const showRotate = ['rotate-image', 'crop-image', 'resize-image'].includes(toolId) || toolId.startsWith('image-');
  const showFlip = ['flip-image', 'crop-image'].includes(toolId) || toolId.startsWith('image-');
  const showCrop = toolId === 'crop-image';
  const showResize = toolId === 'resize-image';
  const showBlur = ['blur-image', 'pixelate-image'].includes(toolId);
  const showCompress = toolId === 'compress-image';
  const showCorners = toolId === 'round-corners';
  const showText = ['add-text-image', 'watermark-image'].includes(toolId);
  const showFilters = ['grayscale', 'sepia', 'invert'].some(f => toolId.includes(f));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-[50vh] mx-auto block"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)} title={t('tool.rotate', 'Rotate')}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant={flipH ? 'default' : 'outline'} size="sm" onClick={() => setFlipH(!flipH)} title={t('tool.flip_h', 'Flip H')}>
            <FlipHorizontal className="w-4 h-4" />
          </Button>
          <Button variant={flipV ? 'default' : 'outline'} size="sm" onClick={() => setFlipV(!flipV)} title={t('tool.flip_v', 'Flip V')}>
            <FlipVertical className="w-4 h-4" />
          </Button>
          {showCrop && (
            <Button variant={cropMode ? 'default' : 'outline'} size="sm" onClick={() => setCropMode(!cropMode)} title={t('tool.crop', 'Crop')}>
              <Crop className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(10, s - 10))} title={t('tool.zoom_out', 'Zoom Out')}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="px-2 py-1 text-sm font-medium">{scale}%</span>
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(200, s + 10))} title={t('tool.zoom_in', 'Zoom In')}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {cropMode && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-xl">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">X Start %</label>
              <input type="range" min="0" max="100" value={cropStart.x} onChange={(e) => setCropStart(p => ({ ...p, x: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Y Start %</label>
              <input type="range" min="0" max="100" value={cropStart.y} onChange={(e) => setCropStart(p => ({ ...p, y: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">X End %</label>
              <input type="range" min="0" max="100" value={cropEnd.x} onChange={(e) => setCropEnd(p => ({ ...p, x: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Y End %</label>
              <input type="range" min="0" max="100" value={cropEnd.y} onChange={(e) => setCropEnd(p => ({ ...p, y: Number(e.target.value) }))} className="w-full accent-primary" />
            </div>
            <div className="col-span-full">
              <Button size="sm" className="w-full" onClick={handleApplyCrop}>
                <Check className="w-4 h-4 mr-2" /> {t('tool.apply_crop', 'Apply Crop')}
              </Button>
            </div>
          </div>
        )}

        {showResize && (
          <div className="flex gap-4 items-center justify-center">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">{t('tool.scale', 'Scale')} %</label>
              <input type="number" min="10" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg text-center" />
            </div>
          </div>
        )}

        {showBlur && (
          <div className="px-4">
            <label className="text-xs font-bold text-slate-500 block mb-1">{toolId === 'blur-image' ? t('tool.blur', 'Blur') : t('tool.pixelate', 'Pixelate')}: {blur}px</label>
            <input type="range" min="0" max="20" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        )}

        {showCompress && (
          <div className="px-4">
            <label className="text-xs font-bold text-slate-500 block mb-1">{t('tool.quality', 'Quality')}: {quality}%</label>
            <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        )}

        {showCorners && (
          <div className="px-4">
            <label className="text-xs font-bold text-slate-500 block mb-1">{t('tool.corner_radius', 'Corner Radius')}: {cornerRadius}px</label>
            <input type="range" min="0" max="100" value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        )}

        {showText && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl">
            <input 
              type="text" 
              placeholder={t('tool.enter_text', 'Enter text...')} 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t('tool.font_size', 'Font Size')}</label>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full px-2 py-1 border rounded" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t('tool.color', 'Color')}</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">X %</label>
                <input type="range" min="0" max="100" value={textX} onChange={(e) => setTextX(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Y %</label>
                <input type="range" min="0" max="100" value={textY} onChange={(e) => setTextY(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500"><Sun className="w-3 h-3 inline mr-1" />{brightness}%</label>
            <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500"><Contrast className="w-3 h-3 inline mr-1" />{contrast}%</label>
            <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500"><Palette className="w-3 h-3 inline mr-1" />{saturation}%</label>
            <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500">{t('tool.sepia', 'Sepia')} {sepia}%</label>
            <input type="range" min="0" max="100" value={sepia} onChange={(e) => setSepia(Number(e.target.value))} className="w-24 accent-primary" />
          </div>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant={invert ? 'default' : 'outline'} size="sm" onClick={() => setInvert(!invert)}>
            {t('tool.invert', 'Invert')}
          </Button>
          <Button variant={saturation === 0 ? 'default' : 'outline'} size="sm" onClick={() => setSaturation(saturation === 0 ? 100 : 0)}>
            {t('tool.grayscale', 'Grayscale')}
          </Button>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">{t('tool.hue', 'Hue')}</label>
            <input type="range" min="0" max="360" value={hueRotate} onChange={(e) => setHueRotate(Number(e.target.value))} className="w-20 accent-primary" />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            <RefreshCcw className="w-4 h-4 mr-2" /> {t('tool.reset', 'Reset')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {t('tool.cancel', 'Cancel')}
          </Button>
          <Button className="flex-1" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> {t('tool.export', 'Export')}
          </Button>
        </div>
      </div>
    </div>
  );
}
