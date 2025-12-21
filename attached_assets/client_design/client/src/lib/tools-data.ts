import { 
  FileText, Image as ImageIcon, Video, PenTool, File, Crop, QrCode, Minimize2, 
  FileType, Scissors, Wand2, FileEdit, Eraser, VolumeX, FileSpreadsheet, Lock, 
  Unlock, Images, Palette, Calculator, Code2, Share2, Type, Hash, Instagram, 
  Youtube, Percent, Calendar, KeyRound, Braces, Split, Copy, RotateCw, 
  FlipHorizontal, Type as TypeIcon, Music, Mic, Film, Globe, Database, 
  Barcode, AlignLeft, Layers, MousePointerClick, ShieldCheck, Download, 
  Mail as MailIcon, Search, CheckSquare, Ruler, Settings, User, Book,
  Wifi, Phone, Binary, Eye, Grid, ScanText, RefreshCcw
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "pdf" | "image-editor" | "image-converter" | "video" | "write" | "social" | "dev" | "calc";
  popular?: boolean;
}

export const tools: Tool[] = [
  // --- 1. PDF Tools ---
  { id: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDF files into one document.", icon: Layers, category: "pdf", popular: true },
  { id: "split-pdf", title: "Split PDF", description: "Extract pages from your PDF or save each page as a separate PDF.", icon: Split, category: "pdf" },
  { id: "extract-pdf-pages", title: "Extract PDF Pages", description: "Get specific pages from a PDF file.", icon: Copy, category: "pdf" },
  { id: "remove-pdf-pages", title: "Remove PDF Pages", description: "Delete unwanted pages from your PDF.", icon: Scissors, category: "pdf" },
  { id: "remove-pdf-pages-odd", title: "Remove Odd Pages", description: "Remove only odd-numbered pages from PDF.", icon: Scissors, category: "pdf" },
  { id: "remove-pdf-pages-even", title: "Remove Even Pages", description: "Remove only even-numbered pages from PDF.", icon: Scissors, category: "pdf" },
  { id: "remove-pdf-first", title: "Remove First Page", description: "Delete the first page of the PDF.", icon: Scissors, category: "pdf" },
  { id: "remove-pdf-last", title: "Remove Last Page", description: "Delete the last page of the PDF.", icon: Scissors, category: "pdf" },
  { id: "compress-pdf", title: "Compress PDF", description: "Reduce PDF file size while maintaining best quality.", icon: Minimize2, category: "pdf", popular: true },
  
  // To PDF (Image to PDF - works client-side)
  { id: "jpg-to-pdf", title: "JPG to PDF", description: "Convert JPG images to PDF documents.", icon: FileType, category: "pdf" },
  { id: "png-to-pdf", title: "PNG to PDF", description: "Convert PNG images to PDF documents.", icon: FileType, category: "pdf" },
  { id: "webp-to-pdf", title: "WebP to PDF", description: "Convert WebP images to PDF.", icon: FileType, category: "pdf" },
  { id: "text-to-pdf", title: "Text to PDF", description: "Convert plain text files to PDF.", icon: FileText, category: "pdf" },

  // PDF Edit & Transform
  { id: "add-watermark-pdf", title: "Add Watermark", description: "Stamp text or image watermarks on your PDF.", icon: ShieldCheck, category: "pdf" },
  { id: "rotate-pdf", title: "Rotate PDF", description: "Rotate PDF pages 90, 180 or 270 degrees.", icon: RotateCw, category: "pdf" },
  { id: "add-page-numbers", title: "Add Page Numbers", description: "Add page numbers into PDF documents.", icon: Hash, category: "pdf" },

  // --- 2. Image Editor ---
  { id: "resize-image", title: "Resize Image", description: "Change image dimensions (width & height).", icon: Minimize2, category: "image-editor", popular: true },
  { id: "crop-image", title: "Crop Image", description: "Crop specific areas from your images.", icon: Crop, category: "image-editor" },
  { id: "circle-crop", title: "Circle Crop", description: "Crop images into a perfect circle.", icon: Crop, category: "image-editor" },
  { id: "flip-image", title: "Flip Image", description: "Mirror images horizontally or vertically.", icon: FlipHorizontal, category: "image-editor" },
  { id: "rotate-image", title: "Rotate Image", description: "Rotate images 90 degrees or arbitrary angles.", icon: RotateCw, category: "image-editor" },
  { id: "blur-image", title: "Blur Image", description: "Add blur effect or mosaic to images.", icon: Wand2, category: "image-editor" },
  { id: "pixelate-image", title: "Pixelate Image", description: "Censor parts of image with pixelation.", icon: Grid, category: "image-editor" },
  { id: "grayscale-image", title: "Black & White", description: "Convert colorful images to grayscale.", icon: Palette, category: "image-editor" },
  { id: "add-text-image", title: "Add Text to Image", description: "Insert text or captions onto your photos.", icon: TypeIcon, category: "image-editor" },
  { id: "round-corners", title: "Round Corners", description: "Add rounded corners to your images.", icon: Crop, category: "image-editor" },
  { id: "compress-image", title: "Compress Image", description: "Reduce image file size significantly.", icon: Minimize2, category: "image-editor" },
  { id: "ocr-image", title: "Image to Text (OCR)", description: "Extract text from images using OCR.", icon: ScanText, category: "image-editor" },
  { id: "watermark-image", title: "Watermark Image", description: "Add logo or text watermark to images.", icon: ShieldCheck, category: "image-editor" },
  
  // Standard Photos
  { id: "passport-photo", title: "Passport Photo", description: "Create professional passport size photos.", icon: User, category: "image-editor" },
  { id: "id-photo", title: "ID Photo Maker", description: "Create standardized ID card photos.", icon: User, category: "image-editor" },
  { id: "insta-size", title: "Instagram Size", description: "Resize images for Instagram feed/stories.", icon: Instagram, category: "image-editor" },
  { id: "youtube-banner", title: "YouTube Banner", description: "Resize images for YouTube channel art.", icon: Youtube, category: "image-editor" },

  // --- 3. Image Converter ---
  { id: "heic-to-jpg", title: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPG.", icon: Images, category: "image-converter", popular: true },
  { id: "heic-to-png", title: "HEIC to PNG", description: "Convert HEIC to PNG format.", icon: Images, category: "image-converter" },
  { id: "jpg-to-png", title: "JPG to PNG", description: "Convert JPG to transparent PNG format.", icon: FileType, category: "image-converter" },
  { id: "png-to-jpg", title: "PNG to JPG", description: "Convert PNG images to JPG format.", icon: FileType, category: "image-converter" },
  { id: "jpg-to-webp", title: "JPG to WebP", description: "Convert JPG to modern WebP format.", icon: FileType, category: "image-converter" },
  { id: "webp-to-jpg", title: "WebP to JPG", description: "Convert WebP images to standard JPG.", icon: FileType, category: "image-converter" },
  { id: "png-to-webp", title: "PNG to WebP", description: "Convert PNG to WebP format.", icon: FileType, category: "image-converter" },
  { id: "webp-to-png", title: "WebP to PNG", description: "Convert WebP images to lossless PNG.", icon: FileType, category: "image-converter" },
  { id: "jpg-to-gif", title: "JPG to GIF", description: "Create GIF from JPG images.", icon: Film, category: "image-converter" },
  { id: "png-to-gif", title: "PNG to GIF", description: "Create GIF from PNG images.", icon: Film, category: "image-converter" },
  { id: "svg-to-png", title: "SVG to PNG", description: "Convert vector SVG to raster PNG.", icon: Wand2, category: "image-converter" },
  { id: "svg-to-jpg", title: "SVG to JPG", description: "Convert vector SVG to JPG image.", icon: Wand2, category: "image-converter" },
  { id: "tiff-to-jpg", title: "TIFF to JPG", description: "Convert TIFF images to JPG.", icon: FileType, category: "image-converter" },
  { id: "bmp-to-jpg", title: "BMP to JPG", description: "Convert Bitmap images to JPG.", icon: FileType, category: "image-converter" },
  { id: "jpg-to-ico", title: "JPG to ICO", description: "Create favicons from JPG.", icon: FileType, category: "image-converter" },
  { id: "png-to-ico", title: "PNG to ICO", description: "Create icons (ICO) from PNG images.", icon: FileType, category: "image-converter" },
  
  // --- 4. Video & GIF ---
  { id: "video-to-gif", title: "Video to GIF", description: "Create animated GIFs from video clips.", icon: Film, category: "video", popular: true },
  { id: "gif-to-mp4", title: "GIF to MP4", description: "Convert animated GIFs back to video.", icon: Film, category: "video" },
  { id: "mov-to-mp4", title: "MOV to MP4", description: "Convert Apple MOV videos to MP4.", icon: Video, category: "video" },
  { id: "webm-to-mp4", title: "WebM to MP4", description: "Convert WebM videos to MP4.", icon: Video, category: "video" },
  { id: "mkv-to-mp4", title: "MKV to MP4", description: "Convert MKV videos to MP4.", icon: Video, category: "video" },
  { id: "avi-to-mp4", title: "AVI to MP4", description: "Convert AVI videos to MP4.", icon: Video, category: "video" },
  { id: "mp4-to-mp3", title: "MP4 to MP3", description: "Extract audio from video files.", icon: Music, category: "video" },
  
  { id: "trim-video", title: "Trim Video", description: "Cut and trim video clips.", icon: Scissors, category: "video" },
  { id: "mute-video", title: "Mute Video", description: "Remove audio track from video.", icon: VolumeX, category: "video" },
  { id: "speed-video", title: "Video Speed", description: "Change playback speed (Slow/Fast).", icon: RefreshCcw, category: "video" },
  { id: "resize-video", title: "Resize Video", description: "Change video resolution and dimensions.", icon: Minimize2, category: "video" },
  { id: "compress-video", title: "Compress Video", description: "Reduce video file size.", icon: Minimize2, category: "video" },
  { id: "rotate-video", title: "Rotate Video", description: "Rotate video 90°, 180°, or 270°.", icon: RefreshCcw, category: "video" },
  { id: "flip-video", title: "Flip Video", description: "Flip video horizontally or vertically.", icon: RefreshCcw, category: "video" },

  // --- 5. Text & Write ---
  { id: "word-counter", title: "Word Counter", description: "Count words, chars, and reading time.", icon: AlignLeft, category: "write" },
  { id: "sentence-counter", title: "Sentence Counter", description: "Count the number of sentences in your text.", icon: AlignLeft, category: "write" },
  { id: "char-counter", title: "Character Counter", description: "Count characters with/without spaces.", icon: AlignLeft, category: "write" },
  { id: "find-replace", title: "Find & Replace", description: "Search and replace text content.", icon: Search, category: "write" },
  
  { id: "case-converter", title: "Case Converter", description: "UPPERCASE, lowercase, Title Case.", icon: Type, category: "write" },
  { id: "remove-line-breaks", title: "Remove Line Breaks", description: "Remove unnecessary new lines from text.", icon: AlignLeft, category: "write" },
  { id: "duplicate-lines", title: "Remove Duplicates", description: "Remove duplicate lines from text.", icon: Copy, category: "write" },
  { id: "empty-lines", title: "Remove Empty Lines", description: "Delete all empty lines from text.", icon: Eraser, category: "write" },
  { id: "remove-white-space", title: "Remove Whitespace", description: "Trim leading, trailing, and extra spaces.", icon: Scissors, category: "write" },
  { id: "reverse-text", title: "Reverse Text", description: "Flip text backwards.", icon: FlipHorizontal, category: "write" },
  { id: "lorem-ipsum", title: "Lorem Ipsum Gen", description: "Generate dummy placeholder text.", icon: Type, category: "write" },
  
  { id: "extract-email", title: "Extract Emails", description: "Pull email addresses from text.", icon: MailIcon, category: "write" },
  { id: "extract-phone", title: "Extract Phones", description: "Pull phone numbers from text.", icon: Phone, category: "write" },
  { id: "extract-urls", title: "Extract URLs", description: "Pull all website links from text.", icon: Globe, category: "write" },

  // --- 6. Social Media ---
  { id: "insta-spacer", title: "Instagram Spacer", description: "Create clean line breaks for IG captions.", icon: Instagram, category: "social" },
  { id: "insta-fonts", title: "Instagram Fonts", description: "Generate fancy fonts for bio/posts.", icon: Type, category: "social" },
  { id: "insta-profile", title: "Profile Link Gen", description: "Create direct links to Instagram profiles.", icon: Instagram, category: "social" },
  { id: "yt-thumbnail", title: "YouTube Thumbnail", description: "Download YouTube video thumbnails.", icon: Youtube, category: "social", popular: true },
  { id: "yt-tag-extractor", title: "YouTube Tags", description: "Extract tags/keywords from YouTube videos.", icon: Hash, category: "social" },
    { id: "hashtag-gen", title: "Hashtag Generator", description: "Generate trending hashtags.", icon: Hash, category: "social" },

  // --- 7. Dev & Security ---
  { id: "qr-url", title: "URL to QR", description: "Create QR code for a website URL.", icon: QrCode, category: "dev", popular: true },
  { id: "qr-text", title: "Text to QR", description: "Create QR code for plain text.", icon: QrCode, category: "dev" },
  { id: "qr-wifi", title: "WiFi QR Code", description: "Create QR code for WiFi login.", icon: Wifi, category: "dev" },
  { id: "barcode-generator", title: "Barcode Generator", description: "Generate UPC, EAN, and other barcodes.", icon: Barcode, category: "dev" },
  { id: "password-gen", title: "Password Generator", description: "Create strong, secure passwords.", icon: KeyRound, category: "dev" },
  { id: "uuid-gen", title: "UUID Generator", description: "Generate random UUIDs/GUIDs.", icon: Database, category: "dev" },
  
  { id: "url-encode", title: "URL Encode", description: "Percent-encode URLs.", icon: Globe, category: "dev" },
  { id: "url-decode", title: "URL Decode", description: "Decode URL strings.", icon: Globe, category: "dev" },
  { id: "base64-encode", title: "Base64 Encoder", description: "Encode text/files to Base64.", icon: Code2, category: "dev" },
  { id: "base64-decode", title: "Base64 Decoder", description: "Decode Base64 strings.", icon: Code2, category: "dev" },
  { id: "json-formatter", title: "JSON Formatter", description: "Beautify and validate JSON.", icon: Braces, category: "dev" },
  { id: "json-minify", title: "JSON Minify", description: "Compact JSON data into one line.", icon: Minimize2, category: "dev" },
  { id: "xml-formatter", title: "XML Formatter", description: "Beautify XML code.", icon: Code2, category: "dev" },
  { id: "html-escape", title: "HTML Escape", description: "Escape special characters in HTML.", icon: Code2, category: "dev" },
  
  { id: "md5-gen", title: "MD5 Generator", description: "Calculate MD5 hash of text.", icon: ShieldCheck, category: "dev" },
  { id: "sha2-gen", title: "SHA-2 Generator", description: "Calculate SHA-256 hash of text.", icon: ShieldCheck, category: "dev" },

  // --- 8. Calculators ---
  { id: "percentage-calc", title: "Percentage Calc", description: "Calculate percentages easily.", icon: Percent, category: "calc" },
  { id: "discount-calc", title: "Discount Calculator", description: "Calculate sale price and savings.", icon: Percent, category: "calc" },
  { id: "date-calc", title: "Date Calculator", description: "Days between dates, add/sub days.", icon: Calendar, category: "calc" },
  { id: "age-calc", title: "Age Calculator", description: "Calculate exact age from birthdate.", icon: Calendar, category: "calc" },
  { id: "unit-converter", title: "Unit Converter", description: "Convert length, weight, volume, etc.", icon: Calculator, category: "calc" },
  { id: "gpa-calc", title: "GPA Calculator", description: "Calculate Grade Point Average.", icon: Calculator, category: "calc" },
  { id: "bmi-calc", title: "BMI Calculator", description: "Calculate Body Mass Index.", icon: Calculator, category: "calc" }
];

export const categories = [
  { id: "pdf", name: "PDF Tools", color: "bg-red-500", icon: FileText, count: "27" },
  { id: "image-editor", name: "Image Editor", color: "bg-blue-500", icon: Crop, count: "18" },
  { id: "image-converter", name: "Image Converter", color: "bg-purple-500", icon: Images, count: "16" },
  { id: "video", name: "Video & GIF", color: "bg-pink-500", icon: Video, count: "12" },
  { id: "write", name: "Text Tools", color: "bg-indigo-500", icon: Type, count: "14" },
  { id: "social", name: "Social Media", color: "bg-orange-500", icon: Share2, count: "6" },
  { id: "dev", name: "Dev & Security", color: "bg-slate-700", icon: Code2, count: "15" },
  { id: "calc", name: "Calculators", color: "bg-green-500", icon: Calculator, count: "7" },
];