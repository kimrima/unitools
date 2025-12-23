import { useCallback } from 'react';
import { useLocale } from '@/components/LocaleProvider';

export function useToolUsageTracker() {
  const locale = useLocale();

  const trackUsage = useCallback(async (toolId: string) => {
    try {
      await fetch('/api/tool-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          locale,
        }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to track tool usage:', error);
    }
  }, [locale]);

  return { trackUsage };
}
