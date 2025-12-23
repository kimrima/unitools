import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Download, Share2, QrCode, Link, Wifi, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

type QRType = 'url' | 'text' | 'wifi';

export default function QrCodeTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [qrType, setQrType] = useState<QRType>('url');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [size, setSize] = useState('256');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [generated, setGenerated] = useState(false);

  const getQRContent = (): string => {
    if (qrType === 'wifi') {
      const hidden = wifiHidden ? 'H:true;' : '';
      const password = wifiPassword ? `P:${wifiPassword};` : '';
      return `WIFI:T:${wifiEncryption};S:${wifiSsid};${password}${hidden};`;
    }
    return text;
  };

  const canGenerate = (): boolean => {
    if (qrType === 'wifi') {
      return wifiSsid.length > 0;
    }
    return text.length > 0;
  };

  useEffect(() => {
    if (canGenerate() && canvasRef.current) {
      generateQR();
    } else {
      setGenerated(false);
    }
  }, [text, wifiSsid, wifiPassword, wifiEncryption, wifiHidden, size, fgColor, bgColor, qrType]);

  const generateQR = async () => {
    if (!canGenerate() || !canvasRef.current) return;
    
    try {
      const content = getQRContent();
      await QRCode.toCanvas(canvasRef.current, content, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setGenerated(true);
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: t('Common.errors.PROCESSING_FAILED'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = qrType === 'wifi' ? `wifi-${wifiSsid}.png` : 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.qr-code-generator.downloaded'),
    });
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'qrcode.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
          title: 'QR Code',
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      handleDownload();
    }
  };

  const handleTypeChange = (type: QRType) => {
    setQrType(type);
    setText('');
    setWifiSsid('');
    setWifiPassword('');
    setGenerated(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={qrType} onValueChange={(v) => handleTypeChange(v as QRType)}>
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="url" className="gap-2" data-testid="tab-url">
                <Link className="w-4 h-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2" data-testid="tab-text">
                <Type className="w-4 h-4" />
                {t('Tools.qr-code-generator.textTab')}
              </TabsTrigger>
              <TabsTrigger value="wifi" className="gap-2" data-testid="tab-wifi">
                <Wifi className="w-4 h-4" />
                WiFi
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TabsContent value="url" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.urlLabel')}</Label>
                    <Input
                      placeholder={t('Tools.qr-code-generator.urlPlaceholder')}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      data-testid="input-url"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.textLabel')}</Label>
                    <Input
                      placeholder={t('Tools.qr-code-generator.textPlaceholder')}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      data-testid="input-text"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="wifi" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.wifiSsid')}</Label>
                    <Input
                      placeholder={t('Tools.qr-code-generator.wifiSsidPlaceholder')}
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      data-testid="input-wifi-ssid"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.wifiPassword')}</Label>
                    <Input
                      type="password"
                      placeholder={t('Tools.qr-code-generator.wifiPasswordPlaceholder')}
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      data-testid="input-wifi-password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.wifiEncryption')}</Label>
                    <Select value={wifiEncryption} onValueChange={(v) => setWifiEncryption(v as 'WPA' | 'WEP' | 'nopass')}>
                      <SelectTrigger data-testid="select-wifi-encryption">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">{t('Tools.qr-code-generator.wifiNoPassword')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hidden-network">{t('Tools.qr-code-generator.wifiHidden')}</Label>
                    <Switch
                      id="hidden-network"
                      checked={wifiHidden}
                      onCheckedChange={setWifiHidden}
                      data-testid="switch-wifi-hidden"
                    />
                  </div>
                </TabsContent>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.sizeLabel')}</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger data-testid="select-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128px</SelectItem>
                        <SelectItem value="256">256px</SelectItem>
                        <SelectItem value="512">512px</SelectItem>
                        <SelectItem value="1024">1024px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('Tools.qr-code-generator.fgColorLabel')}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer"
                        data-testid="input-fg-color"
                      />
                      <Input
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.qr-code-generator.bgColorLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                      data-testid="input-bg-color"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  {!canGenerate() ? (
                    <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                      <QrCode className="w-16 h-16" />
                    </div>
                  ) : (
                    <canvas ref={canvasRef} data-testid="canvas-qr" />
                  )}
                </div>
                
                {generated && canGenerate() && (
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} data-testid="button-download">
                      <Download className="w-4 h-4 mr-2" />
                      {t('Common.actions.download')}
                    </Button>
                    <Button variant="outline" onClick={handleShare} data-testid="button-share">
                      <Share2 className="w-4 h-4 mr-2" />
                      {t('Common.actions.share')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
