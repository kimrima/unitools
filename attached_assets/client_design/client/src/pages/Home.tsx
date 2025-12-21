import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, ArrowRight, Star, Zap, Shield, Sparkles, TrendingUp, Cpu, Flame, Command, ChevronDown, ChevronUp, Layers, CheckCircle2, FileText, Image as ImageIcon, Video, Type, Share2, Code2, Calculator, Crop, Eraser, Minimize2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { tools, categories } from "@/lib/tools-data";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(16);
  const { t } = useTranslation();

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const displayedTools = filteredTools.slice(0, visibleCount);
  const popularTools = tools.filter(t => t.popular).slice(0, 8);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 16);
  };

  const handleShowLess = () => {
    setVisibleCount(16);
    document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(16);
    setTimeout(() => {
      document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight"
            >
              {t('hero.title_prefix')} <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">{t('hero.title_highlight')}</span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-primary/20 -rotate-2 -z-10 rounded-full" />
              </span> {t('hero.title_suffix')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto mb-6 md:mb-10 font-medium px-4"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-xl mx-auto mb-8 md:mb-16 px-4"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                setActiveCategory('all');
                setVisibleCount(100);
                setTimeout(() => {
                  document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}>
               <input 
                 type="text" 
                 className="w-full h-12 md:h-16 pl-4 md:pl-6 pr-20 md:pr-32 bg-white border-2 border-slate-100 rounded-full shadow-xl shadow-slate-200/40 text-base md:text-lg focus:outline-none focus:border-primary transition-all placeholder:text-slate-400"
                 placeholder={t('nav.search_placeholder')}
                 value={searchQuery}
                 onChange={(e) => {
                   setSearchQuery(e.target.value);
                   if (e.target.value) {
                     setActiveCategory('all');
                     setVisibleCount(100);
                   }
                 }}
                 data-testid="input-search"
               />
               <button type="submit" className="absolute right-5 md:right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 bg-primary text-white px-4 md:px-8 rounded-full font-bold text-sm md:text-base hover:bg-primary/90 transition-colors" data-testid="button-search">
                 {t('nav.search', 'Search')}
               </button>
              </form>
            </motion.div>

            {/* Category Grid - Redesigned (Vibrant & Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto"
            >
              {categories.map((cat) => {
                // Generate lighter shades based on the category color class
                const baseColor = cat.color.replace('bg-', ''); // e.g., "red-500"
                const colorName = baseColor.split('-')[0]; // e.g., "red"
                const bgClass = `bg-${colorName}-50`;
                const borderClass = `border-${colorName}-100`;
                const textClass = `text-${colorName}-600`;
                const hoverBorderClass = `group-hover:border-${colorName}-300`;
                const iconBgClass = `bg-${colorName}-100`;

                return (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`
                      relative overflow-hidden flex flex-col items-start p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 group
                      ${bgClass} border-2 ${borderClass} ${hoverBorderClass} hover:shadow-xl hover:-translate-y-1
                    `}
                  >
                    {/* Abstract Decorative Circle */}
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${iconBgClass} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
                    
                    <div className={`
                      relative z-10 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110
                      ${cat.color} text-white
                    `}>
                       <cat.icon className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    
                    <div className="relative z-10 text-left">
                      <h3 className={`text-sm md:text-xl font-black ${textClass} mb-0.5 md:mb-1`}>
                        {t(`categories.${cat.id}`, cat.name)}
                      </h3>
                      <p className="text-slate-500 font-medium text-xs md:text-sm">
                        {cat.count || "10+"} {t('nav.tools', 'Tools')}
                      </p>
                    </div>

                    <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${textClass}`}>
                       <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </motion.div>

             {/* Quick Stats */}
             <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 md:mt-12 text-slate-400 font-medium text-xs md:text-sm">
                <span><strong className="text-slate-900">1m</strong> Active Users</span>
                <span className="hidden md:block w-px h-4 bg-slate-300"></span>
                <span><strong className="text-slate-900">10m</strong> Files Converted</span>
                <span className="hidden md:block w-px h-4 bg-slate-300"></span>
                <span><strong className="text-slate-900">100+</strong> Online Tools</span>
             </div>

          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4">{t('home.popular_title')}</h2>
            <p className="text-sm md:text-base text-slate-500">{t('home.popular_subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
            {popularTools.map((tool) => (
              <Link key={tool.id} href={`/tool/${tool.id}`} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex flex-col items-start h-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 mb-3 md:mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <tool.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1 group-hover:text-primary transition-colors">{t(`tools.${tool.id}.title`, tool.title)}</h3>
                <p className="text-xs md:text-sm text-slate-500 line-clamp-2">{t(`tools.${tool.id}.description`, tool.description)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Usually Pay For Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6 md:mb-10 max-w-6xl mx-auto">
             <div>
               <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">{t('home.featured_title')}</h2>
               <p className="text-sm md:text-base text-slate-500">{t('home.featured_subtitle')}</p>
             </div>
             <div className="hidden md:flex gap-2">
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">←</button>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">→</button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
             {[
               { title: t('tools.pdf-to-word.title', "PDF Editor"), desc: t('tools.pdf-to-word.description', "Edit text and images in your PDF"), icon: FileText, color: "text-red-500", bg: "bg-red-50" },
               { title: t('tools.remove-bg.title', "Background Remover"), desc: t('tools.remove-bg.description', "Remove image background automatically"), icon: Eraser, color: "text-orange-500", bg: "bg-orange-50" },
               { title: t('tools.compress-video.title', "Video Compressor"), desc: t('tools.compress-video.description', "Reduce video size without quality loss"), icon: Minimize2, color: "text-blue-500", bg: "bg-blue-50" },
             ].map((item, i) => (
               <div key={i} className="bg-slate-50 rounded-3xl p-8 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="mb-6 bg-white w-full h-40 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                     {/* Placeholder for tool preview */}
                     <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                        <item.icon className="w-8 h-8" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 mb-4">{item.desc}</p>
                  <div className="text-sm font-bold text-primary flex items-center">Learn more <ArrowRight className="w-4 h-4 ml-1" /></div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* All Tools Grid Section */}
      <section id="tools-grid" className="py-12 md:py-20 bg-slate-50 border-t border-slate-200 scroll-mt-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">{t('home.all_tools_title')}</h2>
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 px-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === "all" 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t('home.filter_all')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                    activeCategory === cat.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/25" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.name.replace(" Tools", "").replace(" Write", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-center mb-6">
              <p className="text-slate-600 font-medium">
                {filteredTools.length > 0 
                  ? `"${searchQuery}" ${t('home.search_results', 'search results')}: ${filteredTools.length} ${t('nav.tools', 'tools')}`
                  : `"${searchQuery}" - ${t('home.no_results', 'No matching tools found')}`
                }
              </p>
            </div>
          )}

          {displayedTools.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
            {displayedTools.map((tool) => (
              <Link key={tool.id} href={`/tool/${tool.id}`} className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all group flex flex-col md:flex-row items-start gap-3 md:gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <tool.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-primary transition-colors mb-1 truncate">
                    {t(`tools.${tool.id}.title`, tool.title)}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed hidden md:block">
                    {t(`tools.${tool.id}.description`, tool.description)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">{t('home.no_results', 'No matching tools found')}</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                {t('home.clear_search', 'Clear Search')}
              </Button>
            </div>
          )}

          {/* Pagination / Show More Buttons */}
          {filteredTools.length > 16 && (
            <div className="mt-12 text-center">
              {visibleCount < filteredTools.length ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 h-12 bg-white border-2 hover:bg-slate-50 text-slate-600 font-bold"
                  onClick={handleShowMore}
                >
                  {t('home.show_more')} <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                 <Button 
                  size="lg" 
                  variant="ghost"
                  className="rounded-full px-8 h-12 text-slate-400 hover:text-slate-600 font-bold"
                  onClick={handleShowLess}
                >
                  {t('home.show_less')} <ChevronUp className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Premium CTA Section (Blue) */}
      <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative z-10">
           <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-10">
              <div className="text-left md:w-1/2">
                 <h2 className="text-3xl md:text-4xl font-black mb-4">{t('home.pro_title')}</h2>
                 <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                    {t('home.pro_subtitle')}
                 </p>
                 <div className="flex flex-wrap gap-4 mb-8">
                    <span className="flex items-center gap-2 text-sm font-bold bg-blue-500/50 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> {t('home.pro_ad_free')}</span>
                    <span className="flex items-center gap-2 text-sm font-bold bg-blue-500/50 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> {t('home.pro_unlimited')}</span>
                    <span className="flex items-center gap-2 text-sm font-bold bg-blue-500/50 px-3 py-1 rounded-full"><Zap className="w-4 h-4" /> {t('home.pro_faster')}</span>
                 </div>
                 <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 h-12 font-bold shadow-xl">{t('home.pro_cta')}</Button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                 <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg">
                          <Flame className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="font-bold text-lg">{t('home.pro_plan_name')}</div>
                          <div className="text-sm opacity-80">{t('home.pro_plan_desc')}</div>
                       </div>
                    </div>
                    <div className="space-y-3 mb-6">
                       <div className="h-2 bg-white/20 rounded-full w-full"></div>
                       <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                       <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                    </div>
                    <div className="text-center text-xs opacity-60 font-mono">
                       PROCESSING_SPEED: 100%
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}