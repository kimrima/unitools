import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmailSignatureTool() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  const generateHtml = () => {
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333;">
  <tr>
    <td style="padding-right: 15px; border-right: 3px solid ${primaryColor};">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size: 18px; font-weight: bold; color: ${primaryColor}; padding-bottom: 5px;">
            ${name || 'Your Name'}
          </td>
        </tr>
        ${title ? `<tr><td style="font-size: 14px; color: #666666; padding-bottom: 3px;">${title}</td></tr>` : ''}
        ${company ? `<tr><td style="font-size: 14px; font-weight: bold; padding-bottom: 10px;">${company}</td></tr>` : ''}
      </table>
    </td>
    <td style="padding-left: 15px;">
      <table cellpadding="0" cellspacing="0" border="0">
        ${email ? `<tr><td style="padding-bottom: 3px;"><a href="mailto:${email}" style="color: #333333; text-decoration: none;">${email}</a></td></tr>` : ''}
        ${phone ? `<tr><td style="padding-bottom: 3px;"><a href="tel:${phone}" style="color: #333333; text-decoration: none;">${phone}</a></td></tr>` : ''}
        ${website ? `<tr><td><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${primaryColor}; text-decoration: none;">${website}</a></td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>
    `.trim();
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(generateHtml());
    toast({
      title: t('Common.messages.complete'),
      description: t('Tools.email-signature.htmlCopied'),
    });
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generateHtml()], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = 'email-signature.html';
    link.href = URL.createObjectURL(blob);
    link.click();
    
    toast({
      title: t('Common.messages.complete'),
      description: t('Common.actions.download'),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>{t('Tools.email-signature.nameLabel')}</Label>
                  <Input
                    placeholder={t('Tools.email-signature.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.email-signature.titleLabel')}</Label>
                  <Input
                    placeholder={t('Tools.email-signature.titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.email-signature.companyLabel')}</Label>
                  <Input
                    placeholder={t('Tools.email-signature.companyPlaceholder')}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    data-testid="input-company"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.email-signature.emailLabel')}</Label>
                  <Input
                    type="email"
                    placeholder={t('Tools.email-signature.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('Tools.email-signature.phoneLabel')}</Label>
                  <Input
                    placeholder={t('Tools.email-signature.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label>{t('Tools.email-signature.websiteLabel')}</Label>
                  <Input
                    placeholder={t('Tools.email-signature.websitePlaceholder')}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    data-testid="input-website"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label>{t('Tools.email-signature.colorLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>{t('Tools.email-signature.previewLabel')}</Label>
              <div 
                className="border rounded-lg p-6 bg-white"
                dangerouslySetInnerHTML={{ __html: generateHtml() }}
              />
              
              <div className="flex gap-2">
                <Button onClick={handleCopyHtml} data-testid="button-copy-html">
                  <Copy className="w-4 h-4 mr-2" />
                  {t('Tools.email-signature.copyHtml')}
                </Button>
                <Button variant="outline" onClick={handleDownloadHtml} data-testid="button-download-html">
                  <Download className="w-4 h-4 mr-2" />
                  {t('Common.actions.download')}
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {t('Tools.email-signature.instructions')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
