import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Shield, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold mb-6" data-testid="text-about-title">
          {t('Legal.about.title')}
        </h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('Legal.about.intro')}
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('Legal.about.mission.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Legal.about.mission.desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('Legal.about.privacy.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Legal.about.privacy.desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('Legal.about.speed.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Legal.about.speed.desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('Legal.about.global.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Legal.about.global.desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.about.whyUs.title')}</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.about.whyUs.item1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.about.whyUs.item2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.about.whyUs.item3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.about.whyUs.item4')}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.about.tools.title')}</h2>
            <p className="text-muted-foreground">{t('Legal.about.tools.desc')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
