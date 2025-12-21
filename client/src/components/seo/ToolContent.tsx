import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLocalizedPath } from '@/components/LocaleProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getToolById, getRelatedTools, formatUsageCount, Tool } from '@/data/tools';
import { Star, Users, ArrowRight, CheckCircle } from 'lucide-react';

interface ToolContentProps {
  toolId: string;
}

export function ToolStats({ toolId }: ToolContentProps) {
  const tool = getToolById(toolId);

  if (!tool) return null;

  return null;
}

export function HowToUse({ toolId }: ToolContentProps) {
  const { t } = useTranslation();
  
  const steps = [
    t(`Tools.${toolId}.howToUse.step1`, { defaultValue: '' }),
    t(`Tools.${toolId}.howToUse.step2`, { defaultValue: '' }),
    t(`Tools.${toolId}.howToUse.step3`, { defaultValue: '' }),
    t(`Tools.${toolId}.howToUse.step4`, { defaultValue: '' }),
  ].filter((step) => step && step !== '');

  if (steps.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">{t('Common.seo.howToUse')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                {index + 1}
              </div>
              <p className="text-muted-foreground pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function ToolFeatures({ toolId }: ToolContentProps) {
  const { t } = useTranslation();

  const features = [
    t(`Tools.${toolId}.features.feature1`, { defaultValue: '' }),
    t(`Tools.${toolId}.features.feature2`, { defaultValue: '' }),
    t(`Tools.${toolId}.features.feature3`, { defaultValue: '' }),
    t(`Tools.${toolId}.features.feature4`, { defaultValue: '' }),
  ].filter((feature) => feature && feature !== '');

  if (features.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">{t('Common.seo.features')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ToolFAQ({ toolId }: ToolContentProps) {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t(`Tools.${toolId}.faq.q1`, { defaultValue: '' }),
      answer: t(`Tools.${toolId}.faq.a1`, { defaultValue: '' }),
    },
    {
      question: t(`Tools.${toolId}.faq.q2`, { defaultValue: '' }),
      answer: t(`Tools.${toolId}.faq.a2`, { defaultValue: '' }),
    },
    {
      question: t(`Tools.${toolId}.faq.q3`, { defaultValue: '' }),
      answer: t(`Tools.${toolId}.faq.a3`, { defaultValue: '' }),
    },
  ].filter((faq) => faq.question && faq.answer);

  if (faqs.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">{t('Common.seo.faq')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function RelatedTools({ toolId }: ToolContentProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const relatedTools = getRelatedTools(toolId);

  if (relatedTools.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">{t('Common.seo.relatedTools')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={localizedPath(`/${tool.id}`)}>
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                  data-testid={`related-tool-${tool.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {t(`Tools.${tool.id}.title`)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolSEOContent({ toolId }: ToolContentProps) {
  return (
    <div className="mt-8 space-y-0">
      <HowToUse toolId={toolId} />
      <ToolFeatures toolId={toolId} />
      <ToolFAQ toolId={toolId} />
      <RelatedTools toolId={toolId} />
    </div>
  );
}
