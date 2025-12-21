import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, AlertCircle, Clock, Check, X } from 'lucide-react';

interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
  nbf?: number;
}

function decodeBase64Url(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

export default function JwtDecoderTool() {
  const { t } = useTranslation();
  const [token, setToken] = useState('');

  const decoded = useMemo(() => {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { error: t('Tools.jwt-decoder.invalidFormat') };
      }

      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
      const signature = parts[2];

      const now = Math.floor(Date.now() / 1000);
      let isExpired = false;
      let expiresAt: Date | null = null;
      let issuedAt: Date | null = null;

      if (payload.exp) {
        isExpired = payload.exp < now;
        expiresAt = new Date(payload.exp * 1000);
      }
      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000);
      }

      return { header, payload, signature, isExpired, expiresAt, issuedAt };
    } catch {
      return { error: t('Tools.jwt-decoder.parseError') };
    }
  }, [token, t]);

  const formatJson = (obj: unknown) => JSON.stringify(obj, null, 2);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          {t('Tools.jwt-decoder.inputLabel')}
        </Label>
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value.trim())}
          placeholder={t('Tools.jwt-decoder.placeholder')}
          className="min-h-24 font-mono text-sm"
          data-testid="input-jwt"
        />
      </div>

      {decoded?.error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{decoded.error}</span>
          </div>
        </Card>
      )}

      {decoded && !decoded.error && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {decoded.isExpired !== undefined && (
              <Badge variant={decoded.isExpired ? 'destructive' : 'default'} className="gap-1">
                {decoded.isExpired ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {decoded.isExpired ? t('Tools.jwt-decoder.expired') : t('Tools.jwt-decoder.valid')}
              </Badge>
            )}
            {decoded.header?.alg && (
              <Badge variant="secondary">{decoded.header.alg}</Badge>
            )}
            {decoded.header?.typ && (
              <Badge variant="outline">{decoded.header.typ}</Badge>
            )}
          </div>

          {decoded.expiresAt && (
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('Tools.jwt-decoder.expiresAt')}:</span>
                <span className="font-mono">{decoded.expiresAt.toLocaleString()}</span>
              </div>
              {decoded.issuedAt && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('Tools.jwt-decoder.issuedAt')}:</span>
                  <span className="font-mono">{decoded.issuedAt.toLocaleString()}</span>
                </div>
              )}
            </Card>
          )}

          <Card className="p-4 space-y-2">
            <Label className="text-red-500">HEADER</Label>
            <pre className="text-sm font-mono bg-muted/50 p-3 rounded-md overflow-x-auto">
              {formatJson(decoded.header)}
            </pre>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="text-purple-500">PAYLOAD</Label>
            <pre className="text-sm font-mono bg-muted/50 p-3 rounded-md overflow-x-auto">
              {formatJson(decoded.payload)}
            </pre>
          </Card>

          <Card className="p-4 space-y-2">
            <Label className="text-blue-500">SIGNATURE</Label>
            <code className="text-sm font-mono bg-muted/50 p-3 rounded-md block break-all">
              {decoded.signature}
            </code>
          </Card>
        </div>
      )}

      {!token && (
        <div className="text-center py-8 text-muted-foreground">
          {t('Tools.jwt-decoder.empty')}
        </div>
      )}
    </div>
  );
}
