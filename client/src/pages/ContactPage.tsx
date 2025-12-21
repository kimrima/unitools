import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (locale && ['en', 'ko'].includes(locale)) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: t('Legal.contact.success.title'),
      description: t('Legal.contact.success.desc'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-contact-title">
          {t('Legal.contact.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('Legal.contact.subtitle')}</p>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            {isSubmitted ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t('Legal.contact.success.title')}</h2>
                    <p className="text-muted-foreground">{t('Legal.contact.success.desc')}</p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      data-testid="button-send-another"
                    >
                      {t('Legal.contact.sendAnother')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('Legal.contact.form.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('Legal.contact.form.name')}</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          data-testid="input-contact-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('Legal.contact.form.email')}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          data-testid="input-contact-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('Legal.contact.form.subject')}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        data-testid="input-contact-subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t('Legal.contact.form.message')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        data-testid="input-contact-message"
                      />
                    </div>
                    <Button type="submit" className="w-full" data-testid="button-contact-submit">
                      {t('Legal.contact.form.submit')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('Legal.contact.info.email.title')}</h3>
                    <p className="text-sm text-muted-foreground">support@unitools.app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('Legal.contact.info.response.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('Legal.contact.info.response.desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
