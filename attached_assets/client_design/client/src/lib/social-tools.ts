// Social Media Tools - Client-side processing

export interface SocialToolResult {
  output: string;
  stats?: Record<string, string | number>;
  type: 'text' | 'url' | 'list';
}

// Instagram Spacer - Add invisible characters for line breaks
export function instaSpacerText(text: string): SocialToolResult {
  // Replace regular line breaks with Instagram-compatible breaks
  const spacedText = text
    .split('\n')
    .map(line => line.trim())
    .join('\n⠀\n'); // Using invisible character (U+2800)

  return {
    output: spacedText,
    type: 'text',
    stats: {
      'Lines': text.split('\n').length,
      'Characters': spacedText.length
    }
  };
}

// Instagram Fancy Fonts
const fontStyles: Record<string, (char: string) => string> = {
  bold: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D400 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D41A + offset - 97);
    return c;
  },
  italic: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D434 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D44E + offset - 97);
    return c;
  },
  script: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D49C + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D4B6 + offset - 97);
    return c;
  },
  fraktur: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D504 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D51E + offset - 97);
    return c;
  },
  double: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D538 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D552 + offset - 97);
    return c;
  },
  monospace: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1D670 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x1D68A + offset - 97);
    if (offset >= 48 && offset <= 57) return String.fromCodePoint(0x1D7F6 + offset - 48);
    return c;
  },
  circled: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x24B6 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x24D0 + offset - 97);
    return c;
  },
  squared: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x1F130 + offset - 65);
    return c;
  },
  fullwidth: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 33 && offset <= 126) return String.fromCodePoint(0xFF01 + offset - 33);
    return c;
  },
  bubble: (c) => {
    const offset = c.charCodeAt(0);
    if (offset >= 65 && offset <= 90) return String.fromCodePoint(0x24B6 + offset - 65);
    if (offset >= 97 && offset <= 122) return String.fromCodePoint(0x24D0 + offset - 97);
    if (offset >= 48 && offset <= 57) return offset === 48 ? '⓪' : String.fromCodePoint(0x2460 + offset - 49);
    return c;
  }
};

export function instaFonts(text: string, style: string = 'bold'): SocialToolResult {
  const converter = fontStyles[style] || fontStyles.bold;
  const converted = text.split('').map(converter).join('');
  
  // Generate all styles for display
  const allStyles = Object.keys(fontStyles).map(s => ({
    name: s,
    text: text.split('').map(fontStyles[s]).join('')
  }));

  return {
    output: converted,
    type: 'text',
    stats: {
      'Style': style.charAt(0).toUpperCase() + style.slice(1),
      'Characters': text.length
    }
  };
}

// Get all font variations
export function getAllFontVariations(text: string): { name: string; text: string }[] {
  return Object.keys(fontStyles).map(style => ({
    name: style.charAt(0).toUpperCase() + style.slice(1),
    text: text.split('').map(fontStyles[style]).join('')
  }));
}

// Instagram Profile Link Generator
export function instaProfileLink(username: string): SocialToolResult {
  const cleanUsername = username.replace(/^@/, '').trim();
  const link = `https://instagram.com/${cleanUsername}`;
  
  return {
    output: link,
    type: 'url',
    stats: {
      'Username': `@${cleanUsername}`,
      'Direct Link': link
    }
  };
}

// YouTube Thumbnail Downloader
export function getYouTubeThumbnails(url: string): SocialToolResult {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  let videoId = '';
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }
  
  if (!videoId) {
    return {
      output: 'Invalid YouTube URL',
      type: 'text',
      stats: { 'Error': 'Could not extract video ID' }
    };
  }

  const thumbnails = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`
  ];

  return {
    output: thumbnails.join('\n'),
    type: 'list',
    stats: {
      'Video ID': videoId,
      'Thumbnails Found': thumbnails.length
    }
  };
}

// YouTube Tag Extractor (returns placeholder - actual extraction needs server)
export function extractYouTubeTags(url: string): SocialToolResult {
  // Extract video ID
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  const videoId = match ? match[1] : '';

  return {
    output: videoId ? `Tags for video ${videoId} would require server-side extraction.\nTry using browser extensions or manual inspection.` : 'Invalid YouTube URL',
    type: 'text',
    stats: {
      'Video ID': videoId || 'Not found',
      'Note': 'Server-side feature'
    }
  };
}

// Hashtag Generator
const hashtagCategories: Record<string, string[]> = {
  general: ['love', 'instagood', 'photooftheday', 'beautiful', 'happy', 'cute', 'tbt', 'like4like', 'followme', 'picoftheday', 'follow', 'me', 'selfie', 'summer', 'art', 'instadaily', 'friends', 'repost', 'nature', 'girl'],
  travel: ['travel', 'traveling', 'travelgram', 'travelphotography', 'instatravel', 'wanderlust', 'adventure', 'explore', 'vacation', 'trip', 'holiday', 'tourism', 'tourist', 'travelblogger', 'traveltheworld', 'traveler', 'travelling', 'backpacking', 'roadtrip', 'globetrotter'],
  food: ['food', 'foodie', 'foodporn', 'instafood', 'yummy', 'delicious', 'foodphotography', 'foodstagram', 'foodlover', 'tasty', 'healthyfood', 'homemade', 'dinner', 'lunch', 'breakfast', 'cooking', 'chef', 'restaurant', 'recipe', 'eat'],
  fitness: ['fitness', 'gym', 'workout', 'fit', 'motivation', 'bodybuilding', 'training', 'health', 'fitnessmotivation', 'muscle', 'strong', 'fitfam', 'exercise', 'healthy', 'lifestyle', 'gains', 'cardio', 'crossfit', 'weightlifting', 'yoga'],
  fashion: ['fashion', 'style', 'ootd', 'fashionblogger', 'streetstyle', 'outfit', 'fashionista', 'beauty', 'model', 'shopping', 'dress', 'clothes', 'shoes', 'trendy', 'designer', 'stylish', 'accessories', 'makeup', 'jewelry', 'bag'],
  photography: ['photography', 'photo', 'photographer', 'photooftheday', 'photoshoot', 'portrait', 'camera', 'canon', 'nikon', 'sony', 'streetphotography', 'naturephotography', 'landscape', 'photographylovers', 'photographyislife', 'capture', 'shot', 'pictures', 'pics', 'focus'],
  business: ['business', 'entrepreneur', 'success', 'marketing', 'motivation', 'money', 'startup', 'entrepreneurship', 'goals', 'hustle', 'mindset', 'smallbusiness', 'ceo', 'leadership', 'growth', 'invest', 'wealth', 'branding', 'strategy', 'networking']
};

export function generateHashtags(topic: string, count: number = 30): SocialToolResult {
  const topicLower = topic.toLowerCase();
  
  // Find matching category or use general
  let selectedTags: string[] = [];
  for (const [category, tags] of Object.entries(hashtagCategories)) {
    if (topicLower.includes(category) || tags.some(t => topicLower.includes(t))) {
      selectedTags = [...tags];
      break;
    }
  }
  
  // Mix with general tags if not enough
  if (selectedTags.length < count) {
    selectedTags = [...selectedTags, ...hashtagCategories.general];
  }
  
  // Add topic as hashtag
  const topicHashtag = topic.replace(/\s+/g, '').toLowerCase();
  if (!selectedTags.includes(topicHashtag)) {
    selectedTags.unshift(topicHashtag);
  }

  // Randomize and limit
  const shuffled = selectedTags.sort(() => Math.random() - 0.5).slice(0, count);
  const formatted = shuffled.map(tag => `#${tag}`);

  return {
    output: formatted.join(' '),
    type: 'text',
    stats: {
      'Topic': topic,
      'Hashtags Generated': formatted.length
    }
  };
}

// TikTok Downloader (placeholder - needs server)
export function tiktokDownloader(url: string): SocialToolResult {
  return {
    output: 'TikTok video download requires server-side processing due to API restrictions.\nPlease use a dedicated TikTok downloader service.',
    type: 'text',
    stats: {
      'URL': url,
      'Status': 'Server-side feature'
    }
  };
}

// Process social tool based on tool ID
export function processSocialTool(toolId: string, input: string, options: any = {}): SocialToolResult {
  switch (toolId) {
    case 'insta-spacer':
      return instaSpacerText(input);
    case 'insta-fonts':
      return instaFonts(input, options.style || 'bold');
    case 'insta-profile':
      return instaProfileLink(input);
    case 'yt-thumbnail':
      return getYouTubeThumbnails(input);
    case 'yt-tag-extractor':
      return extractYouTubeTags(input);
    case 'hashtag-gen':
      return generateHashtags(input, options.count || 30);
    case 'tiktok-downloader':
      return tiktokDownloader(input);
    default:
      return { output: 'Unknown tool', type: 'text' };
  }
}
