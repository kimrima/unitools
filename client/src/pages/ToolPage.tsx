import { useTranslation } from 'react-i18next';
import { useRoute, Link } from 'wouter';
import { useLocale, useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';

export default function ToolPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/:locale/:toolId');
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  
  const toolId = params?.toolId || '';
  
  const toolTitle = t(`Tools.${toolId}.title`, { defaultValue: '' });
  const toolDescription = t(`Tools.${toolId}.description`, { defaultValue: '' });
  
  const toolExists = toolTitle !== '' && toolTitle !== `Tools.${toolId}.title`;

  if (!toolExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle data-testid="text-tool-not-found">
              {locale === 'ko' ? '도구를 찾을 수 없습니다' : 'Tool Not Found'}
            </CardTitle>
            <CardDescription data-testid="text-tool-not-found-desc">
              {locale === 'ko' 
                ? `"${toolId}" 도구가 존재하지 않습니다.`
                : `The tool "${toolId}" does not exist.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={localizedPath('/')}>
              <Button variant="outline" data-testid="button-go-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Common.nav.home')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={localizedPath('/')} className="hover:text-foreground transition-colors">
              <span data-testid="link-breadcrumb-home">{t('Common.nav.home')}</span>
            </Link>
            <span>/</span>
            <span data-testid="text-breadcrumb-tool" className="text-foreground">{toolTitle}</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href={localizedPath('/')}>
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-tool-title">
                {toolTitle}
              </h1>
              <p className="text-muted-foreground" data-testid="text-tool-description">
                {toolDescription}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg min-h-64 flex flex-col items-center justify-center gap-4 hover:border-muted-foreground/50 transition-colors cursor-pointer"
              data-testid="dropzone-upload"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium" data-testid="text-drag-drop">
                  {t('Common.messages.dragDrop')}
                </p>
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-privacy-notice">
                  {t('Common.messages.noServerUpload')}
                </p>
              </div>
              <Button data-testid="button-upload">
                {t('Common.actions.upload')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h2 className="font-medium mb-2">
            {locale === 'ko' ? '디버그 정보 (개발용)' : 'Debug Info (Development)'}
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li data-testid="debug-locale">Locale: <code className="bg-muted px-1 rounded">{locale}</code></li>
            <li data-testid="debug-tool-id">Tool ID: <code className="bg-muted px-1 rounded">{toolId}</code></li>
            <li data-testid="debug-title">Title Key: <code className="bg-muted px-1 rounded">Tools.{toolId}.title</code></li>
            <li data-testid="debug-resolved-title">Resolved Title: <code className="bg-muted px-1 rounded">{toolTitle}</code></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
