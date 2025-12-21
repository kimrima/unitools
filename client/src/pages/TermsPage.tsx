import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-2" data-testid="text-terms-title">
          {t('Legal.terms.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('Legal.privacy.lastUpdated')}: December 2024</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.acceptance.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.acceptance.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.description.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.description.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.use.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('Legal.terms.use.desc')}</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.terms.use.item1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.terms.use.item2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.terms.use.item3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t('Legal.terms.use.item4')}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.ip.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.ip.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.disclaimer.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.disclaimer.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.liability.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.liability.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.changes.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.changes.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('Legal.terms.governing.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Legal.terms.governing.desc')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
