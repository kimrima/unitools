import { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { tools, type Tool } from "@/lib/tools-data";
import { 
  Upload, FileUp, Loader2, ArrowRight, CheckCircle2, AlertCircle, 
  Sparkles, Calendar as CalendarIcon, Hash, Type, Link as LinkIcon, 
  Percent, Calculator, Copy, Ruler, Palette, FileText, Image as ImageIcon,
  KeyRound, Braces, Minimize2, Search, RotateCw, Crop, RefreshCcw,
  Wifi, Eye, Eraser, PenTool, Grid, Layers, Split, Scissors, Check, Download,
  FlipHorizontal, FlipVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { processTextTool, type TextToolResult } from "@/lib/text-tools";
import { processDevTool, type DevToolResult } from "@/lib/dev-tools";
import { processCalcTool, type CalcToolResult } from "@/lib/calc-tools";
import { processImageTool, downloadImage, type ImageToolResult } from "@/lib/image-tools";
import { processConverterTool, getExtension } from "@/lib/image-converter";
import { processSocialTool, getAllFontVariations, type SocialToolResult } from "@/lib/social-tools";
import { processPdfTool, type PdfToolResult } from "@/lib/pdf-tools";
import { processVideoTool, type VideoToolResult } from "@/lib/video-tools";
import QRCode from "react-qr-code";
import { ImageEditor } from "@/components/ImageEditor";

// --- Specialized UI Components ---

const FileUploadUI = ({ onFileSelect, isDragging, handleDragOver, handleDragLeave, handleDrop, accept = "*/*", multiple = false }: any) => {
  const { t } = useTranslation();
  return (
  <div 
    className={`
      w-full max-w-2xl h-52 md:h-80 border-2 border-dashed rounded-2xl md:rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group px-4
      ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}
    `}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    onClick={() => document.getElementById('file-upload')?.click()}
  >
    <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
      <Upload className="w-7 h-7 md:w-10 md:h-10" />
    </div>
    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 md:mb-2 group-hover:text-primary transition-colors text-center">
      {multiple ? t('tool.upload_files', 'Upload files') : t('tool.upload_file', 'Upload your file')}
    </h3>
    <p className="text-sm md:text-base text-slate-500 mb-4 md:mb-8 max-w-sm text-center">
      {t('tool.drag_drop', 'Drag and drop here, or click to browse.')} <br />
      <span className="text-xs text-slate-400 mt-1 md:mt-2 block">
        {accept === "image/*" ? "JPG, PNG, WEBP, GIF" : 
         accept === "application/pdf" ? "PDF files" : 
         accept === "video/*" ? "MP4, MOV, AVI" : 
         "All common formats"}
      </span>
    </p>
    <Button 
      size="default" 
      className="rounded-full px-6 md:px-8 h-10 md:h-12 pointer-events-none bg-slate-900 text-white group-hover:bg-primary transition-colors text-sm md:text-base"
    >
      <FileUp className="w-4 h-4 mr-2" />
      {t('tool.select_file', 'Select File')}{multiple ? 's' : ''}
    </Button>
    <input 
      id="file-upload" 
      type="file" 
      accept={accept}
      multiple={multiple}
      className="hidden" 
      onChange={onFileSelect}
    />
  </div>
  );
};

const RelatedToolsUI = ({ currentTool, tools, t, setLocation }: { currentTool: Tool; tools: Tool[]; t: any; setLocation: any }) => {
  const related = tools
    .filter(tool => tool.category === currentTool.category && tool.id !== currentTool.id)
    .slice(0, 4);
  
  if (related.length === 0) return null;
  
  return (
    <div className="mt-8 pt-8 border-t border-slate-200 w-full max-w-xl">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">{t('tool.related_tools', 'Related Tools')}</p>
      <div className="grid grid-cols-2 gap-3">
        {related.map(tool => (
          <button
            key={tool.id}
            onClick={() => setLocation(`/tool/${tool.id}`)}
            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-colors border border-slate-200"
            data-testid={`link-related-${tool.id}`}
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100">
              <tool.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{t(`tools.${tool.id}.title`, tool.title)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TextInputUI = ({ value, onChange, placeholder, label, rows = 8, showCount = true, isFindReplace = false, findVal, setFindVal, replaceVal, setReplaceVal }: any) => {
  if (isFindReplace) {
    return (
      <div className="w-full max-w-3xl text-left space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Find</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="Text to find..."
                value={findVal}
                onChange={(e) => setFindVal(e.target.value)}
              />
           </div>
           <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Replace With</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="Replacement..."
                value={replaceVal}
                onChange={(e) => setReplaceVal(e.target.value)}
              />
           </div>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 block">Content</label>
          <textarea
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg resize-y shadow-inner font-mono leading-relaxed"
            placeholder="Paste your text here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl text-left">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          {label || "Enter Text"}
        </label>
        {showCount && (
          <div className="flex gap-3 text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
             <span>{value.length} chars</span>
             <span>{value.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        )}
      </div>
      <div className="relative">
        <textarea
          className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg resize-y shadow-inner font-mono leading-relaxed"
          placeholder={placeholder || "Type or paste specific content here..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      </div>
    </div>
  );
};

const UrlInputUI = ({ value, onChange, placeholder, label }: any) => (
  <div className="w-full max-w-2xl text-left">
    <label className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 block">
      {label || "Enter URL"}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <LinkIcon className="w-5 h-5" />
      </div>
      <input
        type="url"
        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg shadow-sm"
        placeholder={placeholder || "https://example.com/..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    <p className="text-sm text-slate-400 mt-2 ml-1">Paste the full URL including https://</p>
  </div>
);

const ConfigUI = ({ type, inputs, setInputs }: any) => {
  const { t } = useTranslation();
  const handleChange = (k: string, v: string) => setInputs({ ...inputs, [k]: v });

  // WiFi QR
  if (type === 'qr-wifi') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left space-y-4">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">{t('ui.wifi_config', 'WiFi Configuration')}</label>
      <div className="space-y-4">
         <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{t('ui.network_name', 'Network Name (SSID)')}</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300" placeholder="MyWiFi" onChange={(e) => handleChange('ssid', e.target.value)} />
         </div>
         <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{t('ui.password', 'Password')}</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300" placeholder="secret123" onChange={(e) => handleChange('password', e.target.value)} />
         </div>
         <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{t('ui.encryption', 'Encryption')}</label>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white" onChange={(e) => handleChange('encryption', e.target.value)}>
               <option value="WPA">WPA/WPA2</option>
               <option value="WEP">WEP</option>
               <option value="nopass">{t('ui.no_password', 'No Password')}</option>
            </select>
         </div>
      </div>
    </div>
  );

  // Percentage Calculator
  if (type === 'percentage-calc') return (
    <div className="w-full max-w-xl bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">{t('ui.calc_percentage', 'Calculate Percentage')}</label>
      <div className="flex items-center gap-4 text-xl">
        <div className="relative flex-1">
           <input type="number" className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="10" value={inputs.a || ''} onChange={(e) => handleChange('a', e.target.value)} />
           <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <span className="font-bold text-slate-400">{t('ui.of', 'OF')}</span>
        <div className="relative flex-1">
           <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="500" value={inputs.b || ''} onChange={(e) => handleChange('b', e.target.value)} />
        </div>
      </div>
    </div>
  );

  // Date/Age Calculator
  if (type === 'date-calc' || type === 'age-calc') return (
    <div className="w-full max-w-md bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">{t('ui.select_date', 'Select Date')}</label>
      <div className="relative">
        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="date" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg bg-white" value={inputs.date || ''} onChange={(e) => handleChange('date', e.target.value)} />
      </div>
    </div>
  );

  // BMI Calculator
  if (type === 'bmi-calc') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">{t('ui.bmi_config', 'BMI Configuration')}</label>
      <div className="grid grid-cols-2 gap-6">
         <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.weight_kg', 'Weight (kg)')}</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="70" onChange={(e) => handleChange('weight', e.target.value)} />
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.height_cm', 'Height (cm)')}</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="175" onChange={(e) => handleChange('height', e.target.value)} />
         </div>
      </div>
    </div>
  );

  // Unit Converter
  if (type === 'unit-converter') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">{t('ui.converter_settings', 'Converter Settings')}</label>
      <div className="space-y-4">
         <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.value', 'Value')}</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300" placeholder="1" onChange={(e) => handleChange('val', e.target.value)} />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.from', 'From')}</label>
               <select className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white">
                  <option>{t('ui.meters', 'Meters')}</option>
                  <option>{t('ui.feet', 'Feet')}</option>
                  <option>{t('ui.kilograms', 'Kilograms')}</option>
               </select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.to', 'To')}</label>
               <select className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white">
                  <option>{t('ui.feet', 'Feet')}</option>
                  <option>{t('ui.meters', 'Meters')}</option>
                  <option>{t('ui.pounds', 'Pounds')}</option>
               </select>
            </div>
         </div>
      </div>
    </div>
  );

  // Discount Calculator
  if (type === 'discount-calc') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">{t('ui.discount_details', 'Discount Details')}</label>
      <div className="grid grid-cols-2 gap-6">
         <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.original_price', 'Original Price ($)')}</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="100.00" onChange={(e) => handleChange('price', e.target.value)} />
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">{t('ui.discount_percent', 'Discount (%)')}</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="20" onChange={(e) => handleChange('discount', e.target.value)} />
         </div>
      </div>
    </div>
  );

  // GPA Calculator
  if (type === 'gpa-calc') return (
    <div className="w-full max-w-2xl bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">{t('ui.course_grades', 'Course Grades')}</label>
      <div className="space-y-3">
         {[1, 2, 3].map(i => (
           <div key={i} className="flex gap-4">
              <input type="text" className="flex-[2] px-4 py-3 rounded-xl border border-slate-300" placeholder={t('ui.course_name', 'Course') + ` ${i}`} />
              <select className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white">
                 <option>A (4.0)</option>
                 <option>B (3.0)</option>
                 <option>C (2.0)</option>
              </select>
              <input type="number" className="flex-1 px-4 py-3 rounded-xl border border-slate-300" placeholder={t('ui.credits', 'Credits')} defaultValue="3" />
           </div>
         ))}
         <Button variant="outline" size="sm" className="mt-2 text-xs">+ {t('ui.add_course', 'Add Course')}</Button>
      </div>
    </div>
  );

  // Password Generator
  if (type === 'password-gen') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">{t('ui.password_settings', 'Password Settings')}</label>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{t('ui.length', 'Length')}</span>
            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{inputs.length || 12}</span>
          </div>
          <input type="range" min="6" max="64" className="w-full accent-primary" value={inputs.length || 12} onChange={(e) => handleChange('length', e.target.value)} />
        </div>
        <div className="flex gap-4">
           {[{key: 'uppercase', label: t('ui.uppercase', 'Uppercase')}, {key: 'numbers', label: t('ui.numbers', 'Numbers')}, {key: 'symbols', label: t('ui.symbols', 'Symbols')}].map(opt => (
             <label key={opt.key} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors">
               <input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked />
               <span className="text-sm font-medium text-slate-600">{opt.label}</span>
             </label>
           ))}
        </div>
      </div>
    </div>
  );

  // QR URL
  if (type === 'qr-url') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">{t('ui.enter_url_qr', 'Enter URL for QR Code')}</label>
      <input type="url" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://example.com" value={inputs.url || ''} onChange={(e) => handleChange('url', e.target.value)} />
    </div>
  );

  // QR Text
  if (type === 'qr-text') return (
    <div className="w-full max-w-lg bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
      <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">{t('ui.enter_text_qr', 'Enter Text for QR Code')}</label>
      <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" rows={4} placeholder={t('ui.any_text', 'Any text content...')} value={inputs.text || ''} onChange={(e) => handleChange('text', e.target.value)} />
    </div>
  );

  // Default Generic Input
  return (
    <div className="w-full max-w-xl text-left">
      <label className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 block">{t('ui.enter_value', 'Enter Value')}</label>
      <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg shadow-sm" placeholder="Type here..." value={inputs.val || ''} onChange={(e) => handleChange('val', e.target.value)} />
    </div>
  );
};

// Result display components
const TextResultDisplay = ({ result, t }: { result: TextToolResult; t: any }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl space-y-6 animate-in fade-in duration-300">
      {result.stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(result.stats).map(([key, value]) => (
            <div key={key} className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 rounded-xl border border-primary/10 text-center">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase">{key}</div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('tool.result', 'Result')}</label>
        <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap break-all min-h-[100px] max-h-[300px] overflow-y-auto leading-relaxed">
          {result.output || t('tool.no_result', 'No result')}
        </pre>
        <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex gap-3">
        <Button size="lg" className="flex-1 h-12 rounded-xl" onClick={handleCopy}>
          <Copy className="mr-2 w-4 h-4" /> {t('tool.copy', 'Copy to Clipboard')}
        </Button>
        <Button variant="outline" size="lg" className="flex-1 h-12 rounded-xl" onClick={() => {
          const blob = new Blob([result.output], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'result.txt';
          a.click();
        }}>
          <Download className="mr-2 w-4 h-4" /> {t('tool.download_txt', 'Save as .txt')}
        </Button>
      </div>
    </div>
  );
};

const CalcResultDisplay = ({ result, t }: { result: CalcToolResult; t: any }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(result.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labelMap: Record<string, string> = {
    'Final Price': t('ui.final_price', 'Final Price'),
    'Result': t('tool.result', 'Result'),
    'Your Age': t('ui.your_age', 'Your Age'),
    'Your BMI': t('ui.your_bmi', 'Your BMI'),
    'Days Between': t('ui.days_between', 'Days Between'),
    'Converted': t('ui.converted', 'Converted'),
    'Your GPA': t('ui.your_gpa', 'Your GPA')
  };
  const statKeyMap: Record<string, string> = {
    'Original Price': t('ui.original_price_label', 'Original Price'),
    'Discount': t('ui.discount_label', 'Discount'),
    'You Save': t('ui.you_save', 'You Save'),
    'Final Price': t('ui.final_price', 'Final Price'),
    'Percentage': t('ui.percentage', 'Percentage'),
    'Base Value': t('ui.base_value', 'Base Value'),
    'Days': t('ui.days', 'Days'),
    'Weeks': t('ui.weeks', 'Weeks'),
    'Months': t('ui.months', 'Months'),
    'Years': t('ui.years', 'Years'),
    'Total Days': t('ui.total_days', 'Total Days'),
    'BMI': 'BMI',
    'Category': t('ui.category', 'Category'),
    'Weight': t('ui.weight', 'Weight'),
    'Height': t('ui.height', 'Height'),
    'Input': t('ui.input', 'Input'),
    'Output': t('ui.output', 'Output')
  };
  const bmiCategoryMap: Record<string, string> = {
    'Underweight': t('ui.bmi_underweight', 'Underweight'),
    'Normal Weight': t('ui.bmi_normal', 'Normal Weight'),
    'Normal': t('ui.bmi_normal', 'Normal'),
    'Overweight': t('ui.bmi_overweight', 'Overweight'),
    'Obese': t('ui.bmi_obese', 'Obese')
  };
  const unitMap: Record<string, string> = {
    'days': t('ui.days_unit', 'days'),
    'years': t('ui.years_unit', 'years'),
    'months': t('ui.months_unit', 'months'),
    'weeks': t('ui.weeks_unit', 'weeks')
  };
  const translateLabel = (label: string) => labelMap[label] || label;
  const translateKey = (key: string) => statKeyMap[key] || key;
  const translateValue = (val: string | number): string => {
    if (typeof val === 'number') return val.toLocaleString();
    let str = String(val);
    Object.entries(unitMap).forEach(([en, trans]) => {
      str = str.replace(new RegExp(`\\b${en}\\b`, 'gi'), trans);
    });
    Object.entries(bmiCategoryMap).forEach(([en, trans]) => {
      str = str.replace(new RegExp(`\\b${en}\\b`, 'g'), trans);
    });
    return str;
  };

  return (
    <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-primary/5 via-white to-purple-500/5 p-10 rounded-3xl border border-primary/10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500 opacity-50" />
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-3">{translateLabel(result.label)}</span>
        <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2">{translateValue(result.value)}</div>
        {result.detail && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold">{translateValue(result.detail)}</div>
        )}
      </div>
      {result.stats && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.stats).map(([key, value]) => (
            <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-500">{translateKey(key)}</span>
              <span className="font-bold text-slate-900">{translateValue(value)}</span>
            </div>
          ))}
        </div>
      )}
      <Button size="lg" className="w-full h-12 rounded-xl" onClick={handleCopy}>
        {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />} {t('tool.copy_result', 'Copy Result')}
      </Button>
    </div>
  );
};

const ImageResultDisplay = ({ result, toolId, t }: { result: ImageToolResult; toolId: string; t: any }) => {
  const [copied, setCopied] = useState(false);
  
  const handleDownload = () => {
    if (!result.dataUrl) return;
    const ext = getExtension(result.format);
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `${toolId}-result.${ext}`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.message || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // OCR result - show extracted text
  if (result.message && result.format === 'text/plain') {
    return (
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('tool.extracted_text', 'Extracted Text')}</label>
          <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap break-all min-h-[100px] max-h-[300px] overflow-y-auto leading-relaxed">
            {result.message || t('tool.no_text', 'No text detected')}
          </pre>
          <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <Button size="lg" className="w-full h-12 rounded-xl" onClick={handleCopy}>
          {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />} {t('tool.copy', 'Copy to Clipboard')}
        </Button>
      </div>
    );
  }

  if (result.requiresServer) {
    return (
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="bg-amber-50 rounded-2xl p-8 flex flex-col items-center border border-amber-200">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="font-bold text-lg text-slate-900 text-center">{t('tool.server_required', 'Server Processing Required')}</p>
          <p className="text-sm text-slate-600 mt-3 text-center leading-relaxed">{result.message}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            {t('tool.server_coming', 'We are working on bringing this feature to you. Stay tuned!')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center overflow-hidden" style={{ maxHeight: '400px' }}>
        <img src={result.dataUrl} alt="Processed" className="max-w-full max-h-[380px] object-contain rounded-lg shadow-lg" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 block">{t('tool.width', 'Width')}</span>
          <span className="font-bold text-slate-900">{result.width}px</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 block">{t('tool.height', 'Height')}</span>
          <span className="font-bold text-slate-900">{result.height}px</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 block">{t('tool.size', 'Size')}</span>
          <span className="font-bold text-slate-900">{formatSize(result.size)}</span>
        </div>
      </div>
      <Button size="lg" className="w-full h-12 rounded-xl" onClick={handleDownload}>
        <Download className="mr-2 w-4 h-4" /> {t('tool.download', 'Download Image')}
      </Button>
    </div>
  );
};

const QRResultDisplay = ({ value, type, t }: { value: string; type: string; t: any }) => {
  const [copied, setCopied] = useState(false);
  
  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 256;
      canvas.height = 256;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      ctx.drawImage(img, 0, 0, 256, 256);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `qr-code-${type}.png`;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 flex items-center justify-center">
        <QRCode id="qr-code-svg" value={value} size={200} level="H" />
      </div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500 block mb-1">{t('tool.encoded_data', 'Encoded Data')}</span>
        <p className="text-sm font-mono text-slate-700 break-all">{value.slice(0, 100)}{value.length > 100 ? '...' : ''}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" className="h-12 rounded-xl" onClick={handleDownload}>
          <Download className="mr-2 w-4 h-4" /> {t('tool.download_png', 'Download PNG')}
        </Button>
        <Button size="lg" variant="outline" className="h-12 rounded-xl" onClick={handleCopy}>
          {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />} {t('tool.copy', 'Copy')}
        </Button>
      </div>
    </div>
  );
};

const VideoResultDisplay = ({ result, t }: { result: VideoToolResult; t: any }) => {
  const handleDownload = () => {
    if (!result.dataUrl) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = result.filename || 'output.mp4';
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Server required message
  if (result.requiresServer) {
    return (
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="bg-amber-50 rounded-2xl p-8 flex flex-col items-center border border-amber-200">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="font-bold text-lg text-slate-900 text-center">{t('tool.desktop_recommended', 'Desktop Software Recommended')}</p>
          <p className="text-sm text-slate-600 mt-3 text-center leading-relaxed">{result.message}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            <strong>{t('tool.free_tools', 'Free Tools')}:</strong> HandBrake, VLC Media Player, ClipChamp
          </p>
        </div>
      </div>
    );
  }

  // If successful processing with blob
  if (result.blob && result.dataUrl) {
    const isGif = result.filename?.endsWith('.gif');
    const isAudio = result.filename?.endsWith('.mp3');
    
    return (
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center">
          {isGif ? (
            <img src={result.dataUrl} alt="GIF Result" className="max-w-full max-h-[300px] rounded-lg" />
          ) : isAudio ? (
            <audio controls src={result.dataUrl} className="w-full" />
          ) : (
            <video controls src={result.dataUrl} className="max-w-full max-h-[300px] rounded-lg" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block">{t('tool.format', 'Format')}</span>
            <span className="font-bold text-slate-900">{result.filename?.split('.').pop()?.toUpperCase() || 'MP4'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 block">{t('tool.size', 'Size')}</span>
            <span className="font-bold text-slate-900">{formatSize(result.blob.size)}</span>
          </div>
        </div>
        <Button size="lg" className="w-full h-12 rounded-xl" onClick={handleDownload}>
          <Download className="mr-2 w-4 h-4" /> {t('tool.download', 'Download')}
        </Button>
      </div>
    );
  }

  // Fallback for other errors
  return (
    <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-red-50 rounded-2xl p-8 flex flex-col items-center border border-red-200">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="font-bold text-lg text-slate-900 text-center">{t('tool.processing_failed', 'Processing Failed')}</p>
        <p className="text-sm text-slate-600 mt-2 text-center">{result.message || t('tool.try_again', 'Please try again')}</p>
      </div>
    </div>
  );
};

const PdfResultDisplay = ({ result, t }: { result: PdfToolResult; t: any }) => {
  const handleDownload = () => {
    if (!result.dataUrl) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = result.filename;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (result.requiresServer) {
    return (
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="bg-amber-50 rounded-2xl p-8 flex flex-col items-center border border-amber-200">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="font-bold text-lg text-slate-900 text-center">{t('tool.server_required', 'Server Processing Required')}</p>
          <p className="text-sm text-slate-600 mt-3 text-center leading-relaxed">{result.message}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            {t('tool.server_coming', 'We are working on bringing this feature to you. Stay tuned!')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
        <FileText className="w-16 h-16 text-red-500 mb-4" />
        <p className="font-bold text-lg text-slate-900">{result.filename}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 block">{t('tool.pages', 'Pages')}</span>
          <span className="font-bold text-slate-900">{result.pageCount}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-xs text-slate-500 block">{t('tool.size', 'Size')}</span>
          <span className="font-bold text-slate-900">{formatSize(result.size)}</span>
        </div>
      </div>
      <Button size="lg" className="w-full h-12 rounded-xl" onClick={handleDownload}>
        <Download className="mr-2 w-4 h-4" /> {t('tool.download_pdf', 'Download PDF')}
      </Button>
    </div>
  );
};

const SocialResultDisplay = ({ result, toolId, t }: { result: SocialToolResult; toolId: string; t: any }) => {
  const [copied, setCopied] = useState(false);
  const [fontVariations, setFontVariations] = useState<{ name: string; text: string }[]>([]);

  useEffect(() => {
    if (toolId === 'insta-fonts' && result.output) {
      setFontVariations(getAllFontVariations(result.output.split('').slice(0, 20).join('')));
    }
  }, [result, toolId]);

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (toolId === 'yt-thumbnail' && result.type === 'list') {
    const thumbnails = result.output.split('\n').filter(Boolean);
    return (
      <div className="w-full max-w-2xl space-y-4 animate-in fade-in duration-300">
        <div className="grid grid-cols-2 gap-4">
          {thumbnails.slice(0, 4).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
              <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full rounded-xl shadow-md hover:shadow-xl transition-shadow" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </a>
          ))}
        </div>
        <Button size="lg" className="w-full h-12 rounded-xl" onClick={() => handleCopy(thumbnails[0])}>
          <Copy className="mr-2 w-4 h-4" /> {t('tool.copy_link', 'Copy Best Quality Link')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-4 animate-in fade-in duration-300">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-sm whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
        {result.output}
      </div>
      {result.stats && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.stats).map(([key, value]) => (
            <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-500">{key}</span>
              <span className="font-bold text-slate-900">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      <Button size="lg" className="w-full h-12 rounded-xl" onClick={() => handleCopy()}>
        {copied ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />} {t('tool.copy_result', 'Copy Result')}
      </Button>
    </div>
  );
};

export default function ToolView() {
  const { t } = useTranslation();
  const { id } = useParams();

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const tool = tools.find(t => t.id === id);
  
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [inputs, setInputs] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textResult, setTextResult] = useState<TextToolResult | null>(null);
  const [calcResult, setCalcResult] = useState<CalcToolResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageToolResult | null>(null);
  const [qrResult, setQrResult] = useState<string>('');
  const [socialResult, setSocialResult] = useState<SocialToolResult | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfToolResult | null>(null);
  const [videoResult, setVideoResult] = useState<VideoToolResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Scroll to top when navigating to a tool page
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Manage image preview URL with cleanup to prevent memory leaks
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setImagePreviewUrl(null);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [file]);

  if (!tool) return <div className="p-20 text-center">{t('tool.not_found')}</div>;

  // Tool Type Detection - Comprehensive classification
  const isMerge = tool.id === 'merge-pdf';
  const isSplit = tool.id === 'split-pdf';
  const isPdfTool = tool.category === 'pdf';
  const isVideoTool = tool.category === 'video';
  
  // Image tools (editor + converter) - client-side with Canvas API
  const isImageEditor = tool.category === 'image-editor';
  const isImageConverter = tool.category === 'image-converter';
  const isImageTool = isImageEditor || isImageConverter;
  
  // File upload tools (need file input)
  const isFileTool = isPdfTool || isImageTool || isVideoTool;
  
  // Social tools with URL input
  const isUrlTool = ['yt-thumbnail', 'tiktok-downloader', 'insta-profile'].includes(tool.id);
  
  // Social tools with text input
  const isSocialTextTool = ['insta-spacer', 'insta-fonts', 'hashtag-gen'].includes(tool.id);
  const isSocialTool = tool.category === 'social';
  
  // Calculator tools with ConfigUI
  const isCalcTool = ['percentage-calc', 'date-calc', 'age-calc', 'bmi-calc', 'unit-converter', 'discount-calc', 'gpa-calc'].includes(tool.id);
  
  // Dev tools that need text input
  const isDevToolWithInput = ['url-encode', 'url-decode', 'base64-encode', 'base64-decode', 'json-formatter', 'json-minify', 'xml-formatter', 'html-escape', 'md5-gen', 'sha2-gen', 'barcode-generator'].includes(tool.id);
  
  // Dev tools with config UI (generators)
  const isDevToolGenerator = ['password-gen', 'uuid-gen'].includes(tool.id);
  
  // QR tools with config UI
  const isQRTool = ['qr-wifi', 'qr-url', 'qr-text'].includes(tool.id);
  
  // All write category tools
  const isWriteTool = tool.category === 'write';
  
  // All tools that need text input area
  const needsTextInput = isWriteTool || isDevToolWithInput || isSocialTextTool;
  
  // All tools processed client-side
  const isClientSideTool = isWriteTool || isDevToolWithInput || isDevToolGenerator || isCalcTool || isQRTool || isSocialTool || isImageTool;

  const handleFileSelect = (e: any) => {
    if (e.target.files) {
      if (isMerge) {
        setFiles(Array.from(e.target.files));
      } else if (e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    }
  };

  const resetResult = () => {
    setShowResult(false);
    setTextResult(null);
    setCalcResult(null);
    setImageResult(null);
    setQrResult('');
    setSocialResult(null);
    setPdfResult(null);
    setVideoResult(null);
    setInputs({});
    setFile(null);
  };

  const startProcessing = async () => {
    // Basic Validation
    if (isMerge && files.length < 2) { toast({ title: t('tool.error_files_required'), description: t('tool.error_files_merge'), variant: "destructive" }); return; }
    if (isFileTool && !isMerge && !file) { toast({ title: t('tool.error_file_required'), description: t('tool.error_upload_first'), variant: "destructive" }); return; }
    if (needsTextInput && !inputs.text && tool.id !== 'lorem-ipsum') { toast({ title: t('tool.error_input_required'), description: t('tool.error_enter_text'), variant: "destructive" }); return; }
    if (isUrlTool && !inputs.url) { toast({ title: t('tool.error_url_required'), description: t('tool.error_valid_url'), variant: "destructive" }); return; }

    // For write category tools - process client-side
    if (isWriteTool) {
      const options = {
        caseType: inputs.caseType || 'upper',
        find: inputs.find,
        replace: inputs.replace,
        paragraphs: parseInt(inputs.paragraphs) || 3,
        mode: inputs.reverseMode || 'chars'
      };
      const result = processTextTool(tool.id, inputs.text || '', options);
      setTextResult(result);
      setShowResult(true);
      return;
    }

    // For dev tools with text input (encode/decode/format)
    if (isDevToolWithInput) {
      const result = await processDevTool(tool.id, inputs.text || '', {});
      setTextResult(result as TextToolResult);
      setShowResult(true);
      return;
    }

    // For dev tool generators (password, uuid)
    if (isDevToolGenerator) {
      const options = {
        length: parseInt(inputs.length) || 16,
        uppercase: inputs.uppercase !== false,
        numbers: inputs.numbers !== false,
        symbols: inputs.symbols !== false,
        count: parseInt(inputs.count) || 5
      };
      const result = await processDevTool(tool.id, '', options);
      setTextResult(result as TextToolResult);
      setShowResult(true);
      return;
    }

    // For calculator tools - process client-side
    if (isCalcTool) {
      const result = processCalcTool(tool.id, inputs);
      setCalcResult(result);
      setShowResult(true);
      return;
    }

    // For QR code tools
    if (isQRTool) {
      let qrData = '';
      if (tool.id === 'qr-url') {
        qrData = inputs.url || inputs.text || 'https://example.com';
      } else if (tool.id === 'qr-text') {
        qrData = inputs.text || 'Hello World';
      } else if (tool.id === 'qr-wifi') {
        const ssid = inputs.ssid || 'MyNetwork';
        const password = inputs.password || '';
        const encryption = inputs.encryption || 'WPA';
        qrData = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      }
      setQrResult(qrData);
      setShowResult(true);
      return;
    }

    // For social media tools
    if (isSocialTool) {
      const input = inputs.url || inputs.text || '';
      const result = processSocialTool(tool.id, input, inputs);
      setSocialResult(result);
      setShowResult(true);
      return;
    }

    // For image editor/converter tools - client-side Canvas processing
    if (isImageTool && file) {
      setIsProcessing(true);
      try {
        let result: ImageToolResult;
        if (isImageConverter) {
          result = await processConverterTool(tool.id, file, inputs);
        } else {
          result = await processImageTool(tool.id, file, inputs);
        }
        setImageResult(result);
        setIsProcessing(false);
        setShowResult(true);
        return;
      } catch (error: any) {
        toast({ title: 'Processing Error', description: error.message, variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
    }

    // For PDF tools - client-side processing with pdf-lib
    if (isPdfTool) {
      setIsProcessing(true);
      try {
        const result = await processPdfTool(tool.id, file, files, inputs);
        setPdfResult(result);
        setIsProcessing(false);
        setShowResult(true);
        return;
      } catch (error: any) {
        toast({ title: 'PDF Processing Error', description: error.message, variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
    }

    // For Video tools - process and show result
    if (isVideoTool) {
      setIsProcessing(true);
      try {
        const result = await processVideoTool(tool.id, file, inputs);
        setVideoResult(result);
        setIsProcessing(false);
        setShowResult(true);
        return;
      } catch (error: any) {
        toast({ title: 'Video Processing Error', description: error.message, variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
    }

    // Fallback - show error for unknown tools
    toast({ title: 'Tool Not Supported', description: 'This tool is not yet implemented.', variant: 'destructive' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center justify-center p-3 md:p-5 bg-white rounded-xl md:rounded-2xl shadow-lg shadow-primary/5 mb-4 md:mb-6 text-primary ring-1 ring-slate-100">
              <tool.icon className="w-7 h-7 md:w-10 md:h-10" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mb-2 md:mb-4 tracking-tight">{t(`tools.${tool.id}.title`, tool.title)}</h1>
            <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">{t(`tools.${tool.id}.description`, tool.description)}</p>
          </div>

          {/* Main Card */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[350px] md:min-h-[500px] relative flex flex-col">
            <AnimatePresence mode="wait">
              {/* --- RESULT VIEW --- */}
              {showResult && (textResult || calcResult || imageResult || qrResult || socialResult || pdfResult || videoResult) ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full">
                  
                  {/* File-based tools show file ready message */}
                  {(imageResult || pdfResult || videoResult) && (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-xl shadow-green-500/30">
                        <Check className="w-8 h-8 md:w-10 md:h-10 text-white stroke-[3px]" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8">{t('tool.file_ready', 'Your file is ready!')}</h2>
                    </>
                  )}
                  
                  {/* Text/Calc/QR/Social tools - no file message, just show result directly */}
                  {textResult && <TextResultDisplay result={textResult} t={t} />}
                  {calcResult && <CalcResultDisplay result={calcResult} t={t} />}
                  {imageResult && <ImageResultDisplay result={imageResult} toolId={tool.id} t={t} />}
                  {qrResult && <QRResultDisplay value={qrResult} type={tool.id} t={t} />}
                  {socialResult && <SocialResultDisplay result={socialResult} toolId={tool.id} t={t} />}
                  {pdfResult && <PdfResultDisplay result={pdfResult} t={t} />}
                  {videoResult && <VideoResultDisplay result={videoResult} t={t} />}
                  
                  <Button variant="ghost" className="mt-6 md:mt-8 text-slate-500" onClick={resetResult}>
                    <RefreshCcw className="mr-2 w-4 h-4" /> {t('tool.try_again', 'Process Again')}
                  </Button>
                  
                  <RelatedToolsUI currentTool={tool} tools={tools} t={t} setLocation={setLocation} />
                </motion.div>
              ) : !isProcessing ? (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-8 md:p-16 w-full">
                  
                  {/* --- FILE UPLOAD UI --- */}
                  {isFileTool && !file && files.length === 0 && (
                    <FileUploadUI 
                      onFileSelect={handleFileSelect}
                      accept={tool.category.includes('image') ? "image/*" : tool.category === 'pdf' ? "application/pdf" : tool.category === 'video' ? "video/*" : "*/*"}
                      multiple={isMerge}
                    />
                  )}

                  {/* --- Interactive Image Editor for image-editor tools --- */}
                  {isImageEditor && file && (
                    <ImageEditor 
                      file={file}
                      toolId={tool.id}
                      onComplete={(result) => {
                        setImageResult({
                          dataUrl: result.dataUrl,
                          format: result.format,
                          width: result.width,
                          height: result.height,
                          size: result.dataUrl.length * 0.75
                        });
                        setShowResult(true);
                      }}
                      onCancel={() => setFile(null)}
                    />
                  )}

                  {/* --- FILE SELECTED UI (Single) - for non-image-editor tools --- */}
                  {isFileTool && file && !isMerge && !isImageEditor && (
                    <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300">
                      
                      {/* File info */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex items-center gap-5 w-full shadow-sm">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-bold text-lg text-slate-900 truncate mb-1">{file.name}</p>
                          <p className="text-sm text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md inline-block border border-slate-100">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => setFile(null)}>
                          <RefreshCcw className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {/* --- Specific Tool Options --- */}
                      
                      {/* Image Resize */}
                      {tool.id === 'resize-image' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.width', 'Width')}</label>
                              <input type="number" placeholder="1920" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.width || ''} onChange={(e) => setInputs({...inputs, width: parseInt(e.target.value) || 800})} />
                           </div>
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.height', 'Height')}</label>
                              <input type="number" placeholder="1080" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.height || ''} onChange={(e) => setInputs({...inputs, height: parseInt(e.target.value) || 600})} />
                           </div>
                        </div>
                      )}

                      {/* Image Rotate */}
                      {tool.id === 'rotate-image' && (
                        <div className="flex justify-center gap-4 mb-8">
                           {[90, 180, 270].map(deg => (
                              <Button key={deg} variant={inputs.degrees === deg ? 'default' : 'outline'} className="h-12 w-20 font-bold" onClick={() => setInputs({...inputs, degrees: deg})}>{deg}°</Button>
                           ))}
                        </div>
                      )}

                      {/* Image Flip */}
                      {tool.id === 'flip-image' && (
                        <div className="flex justify-center gap-4 mb-8">
                           <Button variant={inputs.direction === 'horizontal' ? 'default' : 'outline'} className="h-12 px-6" onClick={() => setInputs({...inputs, direction: 'horizontal'})}>
                              <FlipHorizontal className="w-5 h-5 mr-2" /> Horizontal
                           </Button>
                           <Button variant={inputs.direction === 'vertical' ? 'default' : 'outline'} className="h-12 px-6" onClick={() => setInputs({...inputs, direction: 'vertical'})}>
                              <FlipVertical className="w-5 h-5 mr-2" /> Vertical
                           </Button>
                        </div>
                      )}

                      {/* Blur / Pixelate */}
                      {(tool.id === 'blur-image' || tool.id === 'pixelate-image') && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{tool.id === 'blur-image' ? 'Blur Radius' : 'Pixel Size'}</label>
                           <input type="range" min="1" max="50" className="w-full accent-primary" value={inputs.radius || inputs.pixelSize || 10} onChange={(e) => setInputs({...inputs, [tool.id === 'blur-image' ? 'radius' : 'pixelSize']: parseInt(e.target.value)})} />
                           <div className="text-center text-sm font-bold text-primary mt-2">{inputs.radius || inputs.pixelSize || 10}px</div>
                        </div>
                      )}

                      {/* Compress */}
                      {tool.id === 'compress-image' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Quality ({Math.round((inputs.quality || 0.7) * 100)}%)</label>
                           <input type="range" min="10" max="100" step="5" className="w-full accent-primary" value={(inputs.quality || 0.7) * 100} onChange={(e) => setInputs({...inputs, quality: parseInt(e.target.value) / 100})} />
                        </div>
                      )}

                      {/* Add Text */}
                      {tool.id === 'add-text-image' && (
                        <div className="w-full max-w-md mb-8 space-y-4 text-left">
                           <div>
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Text</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" placeholder="Enter text..." value={inputs.text || ''} onChange={(e) => setInputs({...inputs, text: e.target.value})} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Font Size</label>
                                 <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="32" value={inputs.fontSize || ''} onChange={(e) => setInputs({...inputs, fontSize: parseInt(e.target.value)})} />
                              </div>
                              <div>
                                 <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Color</label>
                                 <input type="color" className="w-full h-12 rounded-xl cursor-pointer" value={inputs.color || '#ffffff'} onChange={(e) => setInputs({...inputs, color: e.target.value})} />
                              </div>
                           </div>
                        </div>
                      )}

                      {/* Watermark */}
                      {tool.id === 'watermark-image' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Watermark Text</label>
                           <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" placeholder="Your brand name" value={inputs.text || ''} onChange={(e) => setInputs({...inputs, text: e.target.value})} />
                        </div>
                      )}

                      {/* Round Corners */}
                      {tool.id === 'round-corners' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Corner Radius ({inputs.radius || 20}px)</label>
                           <input type="range" min="5" max="100" className="w-full accent-primary" value={inputs.radius || 20} onChange={(e) => setInputs({...inputs, radius: parseInt(e.target.value)})} />
                        </div>
                      )}

                      {/* Video Trim */}
                      {tool.id === 'trim-video' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.start_time', 'Start Time')}</label>
                              <input type="text" placeholder="0:00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.startTime || ''} onChange={(e) => setInputs({...inputs, startTime: e.target.value})} />
                           </div>
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.duration', 'Duration (sec)')}</label>
                              <input type="number" placeholder="10" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.duration || ''} onChange={(e) => setInputs({...inputs, duration: e.target.value})} />
                           </div>
                        </div>
                      )}

                      {/* Video Speed */}
                      {tool.id === 'speed-video' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.speed', 'Speed')} ({inputs.speed || 1.5}x)</label>
                           <input type="range" min="0.25" max="4" step="0.25" className="w-full accent-primary" value={inputs.speed || 1.5} onChange={(e) => setInputs({...inputs, speed: parseFloat(e.target.value)})} />
                           <div className="flex justify-between text-xs text-slate-400 mt-1">
                              <span>0.25x</span><span>1x</span><span>2x</span><span>4x</span>
                           </div>
                        </div>
                      )}

                      {/* Video Resize */}
                      {tool.id === 'resize-video' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.resolution', 'Resolution')}</label>
                           <div className="flex gap-2 flex-wrap">
                              {[{w: 1920, h: 1080, l: '1080p'}, {w: 1280, h: 720, l: '720p'}, {w: 854, h: 480, l: '480p'}, {w: 640, h: 360, l: '360p'}].map(res => (
                                 <Button key={res.l} variant={inputs.width === res.w ? 'default' : 'outline'} className="h-10 px-4" onClick={() => setInputs({...inputs, width: res.w, height: res.h})}>{res.l}</Button>
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Video Compress */}
                      {tool.id === 'compress-video' && (
                        <div className="w-full max-w-md mb-8 text-left">
                           <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.quality', 'Quality')}</label>
                           <div className="flex gap-2">
                              {['high', 'medium', 'low'].map(q => (
                                 <Button key={q} variant={inputs.quality === q ? 'default' : 'outline'} className="h-10 px-6 capitalize" onClick={() => setInputs({...inputs, quality: q})}>{q}</Button>
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Video Rotate */}
                      {tool.id === 'rotate-video' && (
                        <div className="flex justify-center gap-4 mb-8">
                           {[90, 180, 270].map(deg => (
                              <Button key={deg} variant={inputs.rotation === deg ? 'default' : 'outline'} className="h-12 w-20 font-bold" onClick={() => setInputs({...inputs, rotation: deg})}>{deg}°</Button>
                           ))}
                        </div>
                      )}

                      {/* Video Flip */}
                      {tool.id === 'flip-video' && (
                        <div className="flex justify-center gap-4 mb-8">
                           <Button variant={inputs.direction === 'horizontal' ? 'default' : 'outline'} className="h-12 px-6" onClick={() => setInputs({...inputs, direction: 'horizontal'})}>
                              <FlipHorizontal className="w-5 h-5 mr-2" /> Horizontal
                           </Button>
                           <Button variant={inputs.direction === 'vertical' ? 'default' : 'outline'} className="h-12 px-6" onClick={() => setInputs({...inputs, direction: 'vertical'})}>
                              <FlipVertical className="w-5 h-5 mr-2" /> Vertical
                           </Button>
                        </div>
                      )}

                      {/* Video to GIF */}
                      {tool.id === 'video-to-gif' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">FPS</label>
                              <input type="number" placeholder="10" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.fps || ''} onChange={(e) => setInputs({...inputs, fps: parseInt(e.target.value) || 10})} />
                           </div>
                           <div className="text-left">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">{t('tool.width', 'Width')}</label>
                              <input type="number" placeholder="480" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" value={inputs.width || ''} onChange={(e) => setInputs({...inputs, width: parseInt(e.target.value) || 480})} />
                           </div>
                        </div>
                      )}

                      {/* PDF Split / Extract Pages */}
                      {(isSplit || tool.id === 'extract-pdf-pages') && (
                         <div className="mb-8 text-left p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 block">Select Pages</label>
                            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                               {[1,2,3,4,5,6,7,8,9,10,11,12].map(pageNum => (
                                  <div key={pageNum} className="aspect-[3/4] bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-all text-slate-400 font-bold text-sm">
                                     {pageNum}
                                  </div>
                               ))}
                            </div>
                            <div className="mt-4 flex gap-2 text-sm">
                               <Button variant="outline" size="sm" className="h-8">Select All</Button>
                               <Button variant="outline" size="sm" className="h-8">Odd</Button>
                               <Button variant="outline" size="sm" className="h-8">Even</Button>
                            </div>
                         </div>
                      )}
                    </div>
                  )}

                  {/* --- FILES SELECTED UI (Merge) --- */}
                  {isMerge && files.length > 0 && (
                     <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300">
                        <div className="space-y-2 mb-8">
                           {files.map((f, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 w-full shadow-sm">
                                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0">
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1 min-w-0 text-left">
                                    <p className="font-bold text-sm text-slate-900 truncate">{f.name}</p>
                                    <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(2)} KB</p>
                                 </div>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                                    <RefreshCcw className="w-4 h-4" />
                                 </Button>
                              </div>
                           ))}
                           <Button variant="outline" className="w-full border-dashed" onClick={() => document.getElementById('file-upload')?.click()}>
                              + Add more files
                           </Button>
                        </div>
                     </div>
                  )}

                  {/* --- TEXT INPUT UI (Write tools and Dev tools needing text) --- */}
                  {needsTextInput && (
                    <>
                      <TextInputUI 
                        value={inputs.text || ''} 
                        onChange={(v: string) => setInputs({...inputs, text: v})} 
                        label={tool.id.includes('json') ? 'Paste JSON' : t('tool.input_text', 'Input Text')}
                        placeholder={tool.id.includes('json') ? '{"key": "value"}' : undefined}
                        isFindReplace={tool.id === 'find-replace'}
                        findVal={inputs.find} setFindVal={(v: string) => setInputs({...inputs, find: v})}
                        replaceVal={inputs.replace} setReplaceVal={(v: string) => setInputs({...inputs, replace: v})}
                      />
                      
                      {/* Case Converter Options */}
                      {tool.id === 'case-converter' && (
                        <div className="w-full max-w-3xl mt-4 flex flex-wrap gap-2 justify-center">
                          {[
                            { id: 'upper', label: 'UPPERCASE' },
                            { id: 'lower', label: 'lowercase' },
                            { id: 'title', label: 'Title Case' },
                            { id: 'sentence', label: 'Sentence case' },
                            { id: 'toggle', label: 'tOGGLE cASE' }
                          ].map(opt => (
                            <Button 
                              key={opt.id} 
                              variant={inputs.caseType === opt.id ? 'default' : 'outline'} 
                              className="font-medium"
                              onClick={() => setInputs({...inputs, caseType: opt.id})}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Lorem Ipsum Options */}
                      {tool.id === 'lorem-ipsum' && (
                        <div className="w-full max-w-xl mt-4">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('tool.paragraphs', 'Number of Paragraphs')}</label>
                          <input 
                            type="number" 
                            min="1" max="10" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary" 
                            value={inputs.paragraphs || 3}
                            onChange={(e) => setInputs({...inputs, paragraphs: e.target.value})}
                          />
                        </div>
                      )}

                      {/* Reverse Text Options */}
                      {tool.id === 'reverse-text' && (
                        <div className="w-full max-w-xl mt-4 flex gap-2 justify-center">
                          {[
                            { id: 'chars', label: t('tool.reverse_chars', 'Reverse Characters') },
                            { id: 'words', label: t('tool.reverse_words', 'Reverse Words') },
                            { id: 'lines', label: t('tool.reverse_lines', 'Reverse Lines') }
                          ].map(opt => (
                            <Button 
                              key={opt.id} 
                              variant={inputs.reverseMode === opt.id ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setInputs({...inputs, reverseMode: opt.id})}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* --- URL INPUT UI --- */}
                  {isUrlTool && (
                    <UrlInputUI 
                      value={inputs.url || ''} 
                      onChange={(v: string) => setInputs({...inputs, url: v})} 
                      label="Target URL"
                    />
                  )}

                  {/* --- CONFIG UI (Calculators, QR, Password/UUID Generators) --- */}
                  {(isQRTool || isCalcTool || isDevToolGenerator) && (
                    <ConfigUI type={tool.id} inputs={inputs} setInputs={setInputs} />
                  )}

                  <div className="w-full max-w-xl mt-10">
                     <Button 
                        size="lg" 
                        className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" 
                        onClick={startProcessing}
                        disabled={(isFileTool && !isMerge && !file) || (isMerge && files.length < 2)}
                     >
                        {isClientSideTool ? t('tool.process_btn', 'Process') : t('tool.convert_btn', 'Start Conversion')} 
                        <ArrowRight className="ml-2 w-5 h-5" />
                     </Button>
                  </div>

                </motion.div>
              ) : (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-12 text-center w-full">
                  <div className="relative w-32 h-32 mb-8">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" strokeDasharray={364} strokeDashoffset={364 - (364 * progress) / 100} className="text-primary transition-all duration-300 ease-linear" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="font-bold text-3xl text-slate-900">{Math.round(progress)}%</span>
                     </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('tool.processing')}</h3>
                  <p className="text-slate-500">Please wait while we handle your request.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}