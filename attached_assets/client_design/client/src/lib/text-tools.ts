// Text Tool Processing Functions - All client-side, no server needed

export interface TextToolResult {
  output: string;
  stats?: Record<string, string | number>;
}

// Word Counter
export function wordCounter(text: string): TextToolResult {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
  const readingTime = Math.ceil(words / 200); // 200 words per minute

  return {
    output: text,
    stats: {
      'Characters': chars,
      'Characters (no spaces)': charsNoSpace,
      'Words': words,
      'Sentences': sentences,
      'Paragraphs': paragraphs,
      'Reading Time': `${readingTime} min`
    }
  };
}

// Sentence Counter
export function sentenceCounter(text: string): TextToolResult {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  return {
    output: text,
    stats: {
      'Sentences': sentences.length,
      'Average Words/Sentence': sentences.length ? Math.round(text.trim().split(/\s+/).length / sentences.length) : 0
    }
  };
}

// Character Counter
export function charCounter(text: string): TextToolResult {
  return {
    output: text,
    stats: {
      'With Spaces': text.length,
      'Without Spaces': text.replace(/\s/g, '').length,
      'Letters Only': text.replace(/[^a-zA-Z]/g, '').length,
      'Digits Only': text.replace(/[^0-9]/g, '').length
    }
  };
}

// Case Converter
export function caseConverter(text: string, type: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle'): TextToolResult {
  let output = text;
  switch (type) {
    case 'upper':
      output = text.toUpperCase();
      break;
    case 'lower':
      output = text.toLowerCase();
      break;
    case 'title':
      output = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      break;
    case 'sentence':
      output = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
      break;
    case 'toggle':
      output = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
      break;
  }
  return { output };
}

// Find & Replace
export function findReplace(text: string, find: string, replace: string, caseSensitive = false): TextToolResult {
  if (!find) return { output: text, stats: { 'Replacements': 0 } };
  const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
  const matches = (text.match(regex) || []).length;
  return {
    output: text.replace(regex, replace),
    stats: { 'Replacements Made': matches }
  };
}

// Remove Line Breaks
export function removeLineBreaks(text: string): TextToolResult {
  const lineBreaks = (text.match(/\n/g) || []).length;
  return {
    output: text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim(),
    stats: { 'Line Breaks Removed': lineBreaks }
  };
}

// Remove Duplicate Lines
export function removeDuplicateLines(text: string): TextToolResult {
  const lines = text.split('\n');
  const unique = Array.from(new Set(lines));
  return {
    output: unique.join('\n'),
    stats: { 
      'Original Lines': lines.length,
      'Duplicates Removed': lines.length - unique.length
    }
  };
}

// Remove Empty Lines
export function removeEmptyLines(text: string): TextToolResult {
  const lines = text.split('\n');
  const filtered = lines.filter(line => line.trim());
  return {
    output: filtered.join('\n'),
    stats: { 'Empty Lines Removed': lines.length - filtered.length }
  };
}

// Remove Extra Whitespace
export function removeWhitespace(text: string): TextToolResult {
  return {
    output: text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim(),
    stats: { 'Characters Before': text.length, 'Characters After': text.replace(/[ \t]+/g, ' ').trim().length }
  };
}

// Reverse Text
export function reverseText(text: string, mode: 'chars' | 'words' | 'lines' = 'chars'): TextToolResult {
  let output = text;
  switch (mode) {
    case 'chars':
      output = text.split('').reverse().join('');
      break;
    case 'words':
      output = text.split(' ').reverse().join(' ');
      break;
    case 'lines':
      output = text.split('\n').reverse().join('\n');
      break;
  }
  return { output };
}

// Lorem Ipsum Generator
export function loremIpsum(paragraphs: number = 3): TextToolResult {
  const lorem = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident."
  ];
  const output = Array.from({ length: paragraphs }, (_, i) => lorem[i % lorem.length]).join('\n\n');
  return { 
    output,
    stats: { 'Paragraphs': paragraphs, 'Words': output.split(/\s+/).length }
  };
}

// Extract Emails
export function extractEmails(text: string): TextToolResult {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = Array.from(new Set(text.match(emailRegex) || []));
  return {
    output: emails.join('\n'),
    stats: { 'Emails Found': emails.length }
  };
}

// Extract Phone Numbers
export function extractPhones(text: string): TextToolResult {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const phones = Array.from(new Set(text.match(phoneRegex) || []));
  return {
    output: phones.join('\n'),
    stats: { 'Phone Numbers Found': phones.length }
  };
}

// Extract URLs
export function extractUrls(text: string): TextToolResult {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = Array.from(new Set(text.match(urlRegex) || []));
  return {
    output: urls.join('\n'),
    stats: { 'URLs Found': urls.length }
  };
}

// Process text based on tool ID
export function processTextTool(toolId: string, text: string, options?: any): TextToolResult {
  switch (toolId) {
    case 'word-counter':
      return wordCounter(text);
    case 'sentence-counter':
      return sentenceCounter(text);
    case 'char-counter':
      return charCounter(text);
    case 'case-converter':
      return caseConverter(text, options?.caseType || 'upper');
    case 'find-replace':
      return findReplace(text, options?.find || '', options?.replace || '', options?.caseSensitive);
    case 'remove-line-breaks':
      return removeLineBreaks(text);
    case 'duplicate-lines':
      return removeDuplicateLines(text);
    case 'empty-lines':
      return removeEmptyLines(text);
    case 'remove-white-space':
      return removeWhitespace(text);
    case 'reverse-text':
      return reverseText(text, options?.mode || 'chars');
    case 'lorem-ipsum':
      return loremIpsum(options?.paragraphs || 3);
    case 'extract-email':
      return extractEmails(text);
    case 'extract-phone':
      return extractPhones(text);
    case 'extract-urls':
      return extractUrls(text);
    default:
      return { output: text };
  }
}
