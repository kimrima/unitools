import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Server, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (locale && ['en', 'ko'].includes(locale)) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-privacy-title">
          {t('Legal.privacy.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('Legal.privacy.lastUpdated')}: December 2024</p>

        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="font-bold text-lg mb-2">{t('Legal.privacy.highlight.title')}</h2>
                <p className="text-muted-foreground">{t('Legal.privacy.highlight.desc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t('Legal.privacy.noServer.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.privacy.noServer.desc')}</p>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.privacy.noServer.item1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.privacy.noServer.item2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.privacy.noServer.item3')}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('Legal.privacy.dataCollection.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.privacy.dataCollection.desc')}</p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('Legal.privacy.dataCollection.analytics.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('Legal.privacy.dataCollection.analytics.desc')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('Legal.privacy.dataCollection.cookies.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('Legal.privacy.dataCollection.cookies.desc')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('Legal.privacy.thirdParty.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.privacy.thirdParty.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.privacy.changes.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.privacy.changes.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.privacy.contact.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.privacy.contact.desc')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
