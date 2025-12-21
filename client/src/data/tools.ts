import {
  FileText,
  Image,
  ImagePlus,
  Film,
  Type,
  Share2,
  Code,
  Calculator,
  Merge,
  Scissors,
  Minimize2,
  RefreshCw,
  Maximize2,
  Crop,
  FileImage,
  Hash,
  Binary,
  Percent,
  Scale,
  type LucideIcon,
} from 'lucide-react';

export interface Tool {
  id: string;
  category: string;
  icon: LucideIcon;
  implemented: boolean;
}

export interface Category {
  id: string;
  icon: LucideIcon;
  toolCount: number;
}

export const categories: Category[] = [
  { id: 'pdf', icon: FileText, toolCount: 5 },
  { id: 'imageConvert', icon: Image, toolCount: 4 },
  { id: 'imageEdit', icon: ImagePlus, toolCount: 3 },
  { id: 'videoAudio', icon: Film, toolCount: 1 },
  { id: 'text', icon: Type, toolCount: 0 },
  { id: 'social', icon: Share2, toolCount: 0 },
  { id: 'developer', icon: Code, toolCount: 3 },
  { id: 'calculator', icon: Calculator, toolCount: 2 },
];

export const allTools: Tool[] = [
  { id: 'merge-pdf', category: 'pdf', icon: Merge, implemented: true },
  { id: 'split-pdf', category: 'pdf', icon: Scissors, implemented: true },
  { id: 'compress-pdf', category: 'pdf', icon: Minimize2, implemented: false },
  { id: 'pdf-to-jpg', category: 'pdf', icon: FileImage, implemented: false },
  { id: 'jpg-to-pdf', category: 'pdf', icon: FileText, implemented: false },
  
  { id: 'png-to-jpg', category: 'imageConvert', icon: RefreshCw, implemented: false },
  { id: 'jpg-to-png', category: 'imageConvert', icon: RefreshCw, implemented: false },
  { id: 'webp-to-jpg', category: 'imageConvert', icon: RefreshCw, implemented: false },
  { id: 'convert-image', category: 'imageConvert', icon: RefreshCw, implemented: true },
  
  { id: 'resize-image', category: 'imageEdit', icon: Maximize2, implemented: false },
  { id: 'crop-image', category: 'imageEdit', icon: Crop, implemented: false },
  { id: 'compress-image', category: 'imageEdit', icon: Minimize2, implemented: true },
  
  { id: 'video-to-gif', category: 'videoAudio', icon: Film, implemented: true },
  
  { id: 'json-formatter', category: 'developer', icon: Code, implemented: false },
  { id: 'base64-encode', category: 'developer', icon: Binary, implemented: false },
  { id: 'hash-generator', category: 'developer', icon: Hash, implemented: false },
  
  { id: 'unit-converter', category: 'calculator', icon: Scale, implemented: false },
  { id: 'percentage-calculator', category: 'calculator', icon: Percent, implemented: false },
];

export function getToolsByCategory(categoryId: string): Tool[] {
  return allTools.filter((tool) => tool.category === categoryId);
}

export function getImplementedTools(): Tool[] {
  return allTools.filter((tool) => tool.implemented);
}

export function getPopularTools(): Tool[] {
  return allTools.filter((tool) => tool.implemented).slice(0, 6);
}
