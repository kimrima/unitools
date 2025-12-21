import { useTranslation } from 'react-i18next';
import { Check, Shield } from 'lucide-react';

interface PrivacyNoteProps {
  variant?: 'info' | 'success';
}

export function PrivacyNote({ variant = 'info' }: PrivacyNoteProps) {
  const { t } = useTranslation();

  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900 text-green-800 dark:text-green-200',
  };

  const iconStyles = {
    info: 'bg-blue-100 dark:bg-blue-900/50',
    success: 'bg-green-100 dark:bg-green-900/50',
  };

  return (
    <div className={`${styles[variant]} border p-4 rounded-xl text-sm flex items-start gap-3`}>
      <div className={`${iconStyles[variant]} p-1.5 rounded-full shrink-0`}>
        {variant === 'success' ? (
          <Check className="w-4 h-4" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
      </div>
      <div>
        <span className="font-bold">
          {t('Common.messages.privacyTitle', { defaultValue: 'Your privacy is protected!' })}
        </span>{' '}
        {t('Common.messages.privacyNote', { 
          defaultValue: 'All files are processed locally in your browser and never uploaded to any server.' 
        })}
      </div>
    </div>
  );
}
