import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, Wifi, Globe, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  org?: string;
}

export default function WhatIsMyIpTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIpInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setIpInfo({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        timezone: data.timezone,
        org: data.org,
      });
    } catch {
      try {
        const fallbackResponse = await fetch('https://api.ipify.org?format=json');
        const fallbackData = await fallbackResponse.json();
        setIpInfo({ ip: fallbackData.ip });
      } catch {
        setError(t('Tools.what-is-my-ip.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('Common.actions.copy') + '!' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchIpInfo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('Tools.what-is-my-ip.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex flex-col items-center gap-4">
          <Wifi className="w-12 h-12 text-primary" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('Tools.what-is-my-ip.yourIp')}</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-3xl font-mono font-bold">{ipInfo?.ip}</code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => ipInfo && copyToClipboard(ipInfo.ip)}
                data-testid="button-copy-ip"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {ipInfo && (ipInfo.city || ipInfo.country || ipInfo.timezone) && (
        <div className="grid gap-4 md:grid-cols-2">
          {(ipInfo.city || ipInfo.region || ipInfo.country) && (
            <Card className="p-4 space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {t('Tools.what-is-my-ip.location')}
              </Label>
              <p className="font-medium">
                {[ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(', ')}
              </p>
            </Card>
          )}

          {ipInfo.timezone && (
            <Card className="p-4 space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('Tools.what-is-my-ip.timezone')}
              </Label>
              <p className="font-medium">{ipInfo.timezone}</p>
            </Card>
          )}

          {ipInfo.org && (
            <Card className="p-4 space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4" />
                {t('Tools.what-is-my-ip.isp')}
              </Label>
              <p className="font-medium">{ipInfo.org}</p>
            </Card>
          )}
        </div>
      )}

      <Button variant="outline" onClick={fetchIpInfo} className="w-full" data-testid="button-refresh">
        <RefreshCw className="w-4 h-4 mr-2" />
        {t('Tools.what-is-my-ip.refresh')}
      </Button>
    </div>
  );
}
