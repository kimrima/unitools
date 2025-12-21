import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools-data";
import { 
  Download, Share2, ArrowLeft, CheckCircle, RefreshCcw, 
  Copy, FileText, Check, ArrowRight, Eye, Video, Image as ImageIcon,
  FileSpreadsheet, FileCode, Minimize2, Search, Hash
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

// --- Result Components for different types ---

const FileResultUI = ({ tool, t }: any) => {
  const isImage = tool.category.includes('image');
  const isVideo = tool.category.includes('video');
  const isPDF = tool.category === 'pdf';

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
         <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0 overflow-hidden relative">
            {isImage ? (
               <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-blue-500 opacity-50" />
               </div>
            ) : isVideo ? (
               <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <Video className="w-10 h-10 text-white" />
               </div>
            ) : (
               <tool.icon className="w-12 h-12" />
            )}
         </div>

         <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
            <div className="font-bold text-slate-900 text-xl truncate">
               {isImage ? 'edited-image.jpg' : isVideo ? 'processed-video.mp4' : 'document-final.pdf'}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-medium text-slate-500">
               <span className="bg-white px-3 py-1 rounded-full border border-slate-200">2.4 MB</span>
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {t('tool.ready', 'Ready')}
               </span>
            </div>
         </div>

         <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button size="lg" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
               <Download className="mr-2 w-5 h-5" /> {t('tool.download_file', 'Download File')}
            </Button>
            <div className="flex gap-2">
               <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white" title="Save to Drive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
               </Button>
               <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white" title="Share">
                  <Share2 className="w-5 h-5" />
               </Button>
            </div>
         </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
         <div className="bg-blue-100 p-1 rounded-full shrink-0"><Check className="w-4 h-4" /></div>
         <div>
            <span className="font-bold">{t('tool.privacy_note_title', 'Did you know?')}</span> {t('tool.privacy_note', 'Your file is processed locally in your browser and never uploaded to our servers.')}
         </div>
      </div>
    </div>
  );
};

const TextResultUI = ({ content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", label }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group shadow-inner">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{label || "Generated Output"}</label>
        <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap break-all min-h-[200px] leading-relaxed">
          {content}
        </pre>
        <button 
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" className="w-full h-14 rounded-xl shadow-md" onClick={handleCopy}>
          <Copy className="mr-2 w-5 h-5" /> Copy to Clipboard
        </Button>
        <Button variant="outline" size="lg" className="w-full h-14 rounded-xl bg-white hover:bg-slate-50">
          <FileText className="mr-2 w-5 h-5" /> Save as .txt
        </Button>
      </div>
    </div>
  );
};

const ValueResultUI = ({ value = "1,234", label = "Result", toolId }: any) => {
  // Customize mock result based on calculator type
  let displayValue = value;
  let displayLabel = label;
  let detailText = "";

  if (toolId === 'percentage-calc') {
     displayValue = "150";
     displayLabel = "Calculated Percentage";
     detailText = "10% of 1500";
  } else if (toolId === 'discount-calc') {
     displayValue = "$85.00";
     displayLabel = "Final Price";
     detailText = "You saved $15.00 (15%)";
  } else if (toolId === 'bmi-calc') {
     displayValue = "22.4";
     displayLabel = "Your BMI";
     detailText = "Normal Weight Range";
  } else if (toolId === 'age-calc' || toolId === 'date-calc') {
     displayValue = "24 Years";
     displayLabel = "Calculated Age";
     detailText = "3 Months, 12 Days";
  } else if (toolId === 'gpa-calc') {
     displayValue = "3.85";
     displayLabel = "Cumulative GPA";
     detailText = "Magna Cum Laude";
  } else if (toolId === 'password-gen') {
     displayValue = "Tr5#bP9@xL";
     displayLabel = "Secure Password";
     detailText = "Strong Strength";
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-primary/5 via-white to-purple-500/5 p-12 rounded-[2.5rem] border border-primary/10 text-center shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500 opacity-50" />
         <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">{displayLabel}</span>
         <div className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter tabular-nums mb-2">
            {displayValue}
         </div>
         {detailText && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
               {detailText}
            </div>
         )}
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
         <Button size="lg" className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">
           <Copy className="mr-2 w-4 h-4" /> Copy
         </Button>
         <Button variant="outline" size="lg" className="w-full h-12 rounded-xl">
           <Share2 className="mr-2 w-4 h-4" /> Share
         </Button>
      </div>
    </div>
  );
};

import { useTranslation } from "react-i18next";
// --- Recommended Tools Data ---
const recommendedTools = {
  'pdf': [
    { id: 'compress-pdf', title: 'Compress PDF', icon: Minimize2 },
    { id: 'protect-pdf', title: 'Protect PDF', icon: CheckCircle },
    { id: 'pdf-to-word', title: 'PDF to Word', icon: FileText },
  ],
  'image-editor': [
    { id: 'resize-image', title: 'Resize Image', icon: Minimize2 },
    { id: 'compress-image', title: 'Compress Image', icon: CheckCircle },
    { id: 'image-converter', title: 'Convert Format', icon: RefreshCcw },
  ],
  'image-converter': [
    { id: 'resize-image', title: 'Resize Image', icon: Minimize2 },
    { id: 'crop-image', title: 'Crop Image', icon: CheckCircle },
    { id: 'compress-image', title: 'Compress Image', icon: Minimize2 },
  ],
  'video': [
    { id: 'compress-video', title: 'Compress Video', icon: Minimize2 },
    { id: 'video-to-gif', title: 'Video to GIF', icon: ImageIcon },
    { id: 'trim-video', title: 'Trim Video', icon: CheckCircle },
  ],
  'write': [
    { id: 'case-converter', title: 'Case Converter', icon: RefreshCcw },
    { id: 'find-replace', title: 'Find & Replace', icon: Search },
    { id: 'word-counter', title: 'Word Counter', icon: FileText },
  ],
  'social': [
    { id: 'insta-size', title: 'Instagram Resize', icon: ImageIcon },
    { id: 'hashtag-gen', title: 'Hashtag Gen', icon: Hash },
    { id: 'yt-thumbnail', title: 'YT Thumbnail', icon: ImageIcon },
  ],
  'dev': [
    { id: 'password-gen', title: 'Password Gen', icon: CheckCircle },
    { id: 'qr-url', title: 'URL to QR', icon: ImageIcon },
    { id: 'json-formatter', title: 'JSON Format', icon: FileText },
  ],
  'calc': [
    { id: 'percentage-calc', title: 'Percentage', icon: CheckCircle },
    { id: 'discount-calc', title: 'Discount', icon: CheckCircle },
    { id: 'unit-converter', title: 'Converter', icon: RefreshCcw },
  ]
};

export default function DownloadView() {
  const { id } = useParams();
  const tool = tools.find(t => t.id === id);
  const { t } = useTranslation();

  // Determine Result Type
  const isFileTool = ['pdf', 'image-editor', 'image-converter', 'video', 'social'].includes(tool?.category || '');
  const isCalcTool = tool?.category === 'calc' || tool?.category === 'dev';
  const isTextTool = tool?.category === 'write';

  // Get recommendations
  const recommendations = recommendedTools[tool?.category as keyof typeof recommendedTools] || [];

  useEffect(() => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 }, colors: ['#5b21b6', '#8b5cf6', '#f97316'], disableForReducedMotion: true, startVelocity: 40 });
  }, []);

  if (!tool) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-12">
             {/* Header */}
             <div className="bg-slate-900 text-white p-10 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                
                {/* Background Glows */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />

                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }} className="relative z-10">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 ring-4 ring-green-500/20">
                    <Check className="w-10 h-10 text-white stroke-[3px]" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">{t('tool.success_title')}</h1>
                  <p className="text-slate-300 text-lg">{t('tool.success_desc')}</p>
                </motion.div>
             </div>

             {/* Content */}
             <div className="p-8 md:p-12">
                <div className="max-w-2xl mx-auto">
                   {isFileTool && <FileResultUI tool={tool} t={t} />}
                   {isTextTool && <TextResultUI label={t(`tools.${tool.id}.title`, tool.title) + " Result"} />}
                   {isCalcTool && <ValueResultUI toolId={tool.id} label="Calculated Result" />}
                </div>
             </div>
          </div>

          {/* Recommendations / Next Steps */}
          {recommendations.length > 0 && (
            <div className="mb-12">
               <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">What would you like to do next?</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map(rec => (
                     <Link key={rec.id} href={`/tool/${rec.id}`}>
                        <a className="bg-white p-4 rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group">
                           <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                              <rec.icon className="w-5 h-5" />
                           </div>
                           <span className="font-bold text-slate-700 group-hover:text-primary">{t(`tools.${rec.id}.title`, rec.title)}</span>
                           <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary" />
                        </a>
                     </Link>
                  ))}
               </div>
            </div>
          )}

          <div className="text-center">
             <Link href={`/tool/${id}`}>
               <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-6 py-6 h-auto rounded-full transition-all">
                 <RefreshCcw className="mr-2 w-4 h-4" /> {t('tool.process_again')}
               </Button>
             </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}