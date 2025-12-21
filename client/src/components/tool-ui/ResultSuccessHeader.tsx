import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

interface ResultSuccessHeaderProps {
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string | number }>;
}

export function ResultSuccessHeader({ title, subtitle, stats }: ResultSuccessHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold">
            {title || t('Common.messages.processingComplete', { defaultValue: 'Processing Complete!' })}
          </h2>
          <p className="text-green-100 text-sm md:text-base">
            {subtitle || t('Common.messages.readyToDownload', { defaultValue: 'Your file is ready to download' })}
          </p>
        </div>
      </div>
      
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-green-100 text-xs uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
