import { Link } from "wouter";
import { categories, tools } from "@/lib/tools-data";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  
  // Organize tools by category for the SEO grid
  const toolsByCategory = categories.map(cat => ({
    ...cat,
    items: tools.filter(t => t.category === cat.id).slice(0, 5) // Show up to 5 links per category for SEO
  }));

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 mt-20 border-t border-slate-800 font-sans">
      <div className="container mx-auto px-6">
        
        {/* Top Section: Brand & Main Nav */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 border-b border-slate-800 pb-12">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-1 mb-6 group">
              <span className="font-extrabold text-2xl tracking-tighter text-white group-hover:text-primary transition-colors">
                Uni<span className="text-primary">Tools</span>.
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t('footer.desc', 'The ultimate all-in-one digital toolkit. We provide free, secure, and fast online tools to help you solve file problems, create content, and boost productivity.')}
            </p>
            <div className="flex gap-4">
               {/* Social Icons Placeholder */}
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary transition-colors cursor-pointer" />
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary transition-colors cursor-pointer" />
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary transition-colors cursor-pointer" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
             <div>
                <h4 className="font-bold text-white mb-4">{t('footer.company', 'Company')}</h4>
                <ul className="space-y-2">
                   <li><Link href="/about" className="hover:text-primary transition-colors">{t('footer.about', 'About Us')}</Link></li>
                   <li><Link href="/contact" className="hover:text-primary transition-colors">{t('footer.contact', 'Contact')}</Link></li>
                   <li><Link href="/pricing" className="hover:text-primary transition-colors">{t('footer.pricing', 'Pricing')}</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-white mb-4">{t('footer.support', 'Support')}</h4>
                <ul className="space-y-2">
                   <li><Link href="/faq" className="hover:text-primary transition-colors">{t('footer.faq', 'FAQ')}</Link></li>
                   <li><Link href="/help" className="hover:text-primary transition-colors">{t('footer.help', 'Help Center')}</Link></li>
                   <li><Link href="/report" className="hover:text-primary transition-colors">{t('footer.report', 'Report Issue')}</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-white mb-4">{t('footer.legal', 'Legal')}</h4>
                <ul className="space-y-2">
                   <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link></li>
                   <li><Link href="/terms" className="hover:text-primary transition-colors">{t('footer.terms', 'Terms of Use')}</Link></li>
                   <li><Link href="/cookies" className="hover:text-primary transition-colors">{t('footer.cookies', 'Cookie Policy')}</Link></li>
                </ul>
             </div>
          </div>
        </div>

        {/* SEO Grid: "The Net" */}
        <div className="mb-16">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">{t('footer.directory', 'Directory')}</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-8">
              {toolsByCategory.map(cat => (
                 <div key={cat.id}>
                    <h4 className="font-bold text-slate-200 text-xs uppercase mb-3 truncate" title={t(`categories.${cat.id}`, cat.name)}>{t(`categories.${cat.id}`, cat.name)}</h4>
                    <ul className="space-y-1.5">
                       {cat.items.length > 0 ? (
                          cat.items.map(tool => (
                             <li key={tool.id}>
                                <Link href={`/tool/${tool.id}`} className="text-[11px] text-slate-500 hover:text-white transition-colors block truncate" title={t(`tools.${tool.id}.title`, tool.title)}>
                                   {t(`tools.${tool.id}.title`, tool.title)}
                                </Link>
                             </li>
                          ))
                       ) : (
                          <li className="text-[11px] text-slate-600 italic">{t('footer.coming_soon', 'Coming soon')}</li>
                       )}
                       {cat.items.length >= 5 && (
                          <li>
                             <Link href={`/category/${cat.id}`} className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase mt-1 block">
                                {t('footer.view_all', 'View All')} &rarr;
                             </Link>
                          </li>
                       )}
                    </ul>
                 </div>
              ))}
           </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} UniTools Inc. {t('footer.rights', 'All rights reserved.')}</p>
          <p className="mt-2 md:mt-0">{t('footer.made_with', 'Made with ❤️ for creators everywhere.')}</p>
        </div>
      </div>
    </footer>
  );
}