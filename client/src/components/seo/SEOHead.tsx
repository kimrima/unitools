import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/components/LocaleProvider';
import { getToolById, Tool } from '@/data/tools';

interface SEOHeadProps {
  toolId?: string;
  pageType?: 'home' | 'tool' | 'category';
  categoryId?: string;
}

export function SEOHead({ toolId, pageType = 'home', categoryId }: SEOHeadProps) {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const currentLang = i18n.language;
  const tool = toolId ? getToolById(toolId) : undefined;

  useEffect(() => {
    let title = t('Common.siteTitle');
    let description = t('Common.siteDescription');

    if (pageType === 'tool' && toolId) {
      const toolTitle = t(`Tools.${toolId}.title`, { defaultValue: '' });
      const toolDesc = t(`Tools.${toolId}.description`, { defaultValue: '' });
      
      if (toolTitle) {
        title = `${toolTitle} - ${t('Common.siteName')}`;
        description = toolDesc || t('Common.siteDescription');
      }
    } else if (pageType === 'category' && categoryId) {
      const categoryName = t(`Categories.${categoryId}.name`, { defaultValue: '' });
      const categoryDesc = t(`Categories.${categoryId}.description`, { defaultValue: '' });
      
      if (categoryName) {
        title = `${categoryName} - ${t('Common.siteName')}`;
        description = categoryDesc || t('Common.siteDescription');
      }
    }

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    updateHreflangTags(toolId, categoryId, pageType);
    updateCanonicalTag(toolId, categoryId, pageType, currentLang);
    
    if (pageType === 'tool' && tool) {
      updateJsonLd(tool, t, currentLang);
    } else {
      removeJsonLd();
    }

    return () => {
      removeJsonLd();
    };
  }, [toolId, categoryId, pageType, currentLang, t, tool]);

  return null;
}

function updateHreflangTags(toolId?: string, categoryId?: string, pageType?: string) {
  const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existingHreflang.forEach((el) => el.remove());

  const supportedLocales = ['en', 'ko'];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  let path = '';
  if (pageType === 'tool' && toolId) {
    path = `/${toolId}`;
  } else if (pageType === 'category' && categoryId) {
    path = `/category/${categoryId}`;
  }

  supportedLocales.forEach((locale) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', locale);
    link.setAttribute('href', `${baseUrl}/${locale}${path}`);
    document.head.appendChild(link);
  });

  const xDefaultLink = document.createElement('link');
  xDefaultLink.setAttribute('rel', 'alternate');
  xDefaultLink.setAttribute('hreflang', 'x-default');
  xDefaultLink.setAttribute('href', `${baseUrl}/en${path}`);
  document.head.appendChild(xDefaultLink);
}

function updateCanonicalTag(toolId?: string, categoryId?: string, pageType?: string, currentLang?: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let path = '';
  
  if (pageType === 'tool' && toolId) {
    path = `/${toolId}`;
  } else if (pageType === 'category' && categoryId) {
    path = `/category/${categoryId}`;
  }

  canonical.setAttribute('href', `${baseUrl}/${currentLang}${path}`);
}

function updateJsonLd(tool: Tool, t: (key: string) => string, lang: string) {
  removeJsonLd();

  const toolTitle = t(`Tools.${tool.id}.title`);
  const toolDesc = t(`Tools.${tool.id}.description`);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': toolTitle,
    'description': toolDesc,
    'url': `${baseUrl}/${lang}/${tool.id}`,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': tool.rating.toString(),
      'ratingCount': tool.ratingCount.toString(),
      'bestRating': '5',
      'worstRating': '1',
    },
    'author': {
      '@type': 'Organization',
      'name': 'UniTools',
      'url': baseUrl,
    },
    'inLanguage': lang,
  };

  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute('id', 'json-ld-schema');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function removeJsonLd() {
  const existing = document.getElementById('json-ld-schema');
  if (existing) {
    existing.remove();
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}
