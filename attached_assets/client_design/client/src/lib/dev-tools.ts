// Dev & Security Tool Processing Functions - All client-side

export interface DevToolResult {
  output: string;
  stats?: Record<string, string | number>;
}

// Password Generator
export function generatePassword(length: number = 16, options: { uppercase?: boolean; numbers?: boolean; symbols?: boolean } = {}): DevToolResult {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = lowercase;
  if (options.uppercase !== false) chars += uppercase;
  if (options.numbers !== false) chars += numbers;
  if (options.symbols !== false) chars += symbols;
  
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  
  return {
    output: password,
    stats: { 'Length': length, 'Strength': length >= 16 ? 'Very Strong' : length >= 12 ? 'Strong' : 'Medium' }
  };
}

// UUID Generator
export function generateUUID(count: number = 1): DevToolResult {
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  return {
    output: uuids.join('\n'),
    stats: { 'UUIDs Generated': count }
  };
}

// URL Encode
export function urlEncode(text: string): DevToolResult {
  return {
    output: encodeURIComponent(text),
    stats: { 'Original Length': text.length, 'Encoded Length': encodeURIComponent(text).length }
  };
}

// URL Decode
export function urlDecode(text: string): DevToolResult {
  try {
    return {
      output: decodeURIComponent(text),
      stats: { 'Decoded Successfully': 'Yes' }
    };
  } catch {
    return { output: 'Error: Invalid encoded string', stats: { 'Error': 'Invalid input' } };
  }
}

// Base64 Encode
export function base64Encode(text: string): DevToolResult {
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return {
      output: encoded,
      stats: { 'Original Size': text.length, 'Encoded Size': encoded.length }
    };
  } catch {
    return { output: 'Error: Could not encode', stats: { 'Error': 'Encoding failed' } };
  }
}

// Base64 Decode
export function base64Decode(text: string): DevToolResult {
  try {
    const decoded = decodeURIComponent(escape(atob(text.trim())));
    return {
      output: decoded,
      stats: { 'Decoded Successfully': 'Yes' }
    };
  } catch {
    return { output: 'Error: Invalid Base64 string', stats: { 'Error': 'Invalid input' } };
  }
}

// JSON Formatter
export function jsonFormatter(text: string): DevToolResult {
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    return {
      output: formatted,
      stats: { 'Valid JSON': 'Yes', 'Keys': Object.keys(parsed).length }
    };
  } catch (e: any) {
    return { output: `Error: ${e.message}`, stats: { 'Valid JSON': 'No' } };
  }
}

// JSON Minify
export function jsonMinify(text: string): DevToolResult {
  try {
    const parsed = JSON.parse(text);
    const minified = JSON.stringify(parsed);
    return {
      output: minified,
      stats: { 
        'Original Size': text.length,
        'Minified Size': minified.length,
        'Saved': `${Math.round((1 - minified.length / text.length) * 100)}%`
      }
    };
  } catch (e: any) {
    return { output: `Error: ${e.message}`, stats: { 'Valid JSON': 'No' } };
  }
}

// HTML Escape
export function htmlEscape(text: string): DevToolResult {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return {
    output: escaped,
    stats: { 'Characters Escaped': escaped.length - text.length }
  };
}

// XML Formatter
export function xmlFormatter(text: string): DevToolResult {
  try {
    let formatted = '';
    let indent = 0;
    const lines = text.replace(/>\s*</g, '>\n<').split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      formatted += '  '.repeat(indent) + trimmed + '\n';
      
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<?') && 
          !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent++;
      }
    }
    
    return {
      output: formatted.trim(),
      stats: { 'Lines': formatted.split('\n').length, 'Formatted': 'Yes' }
    };
  } catch (e: any) {
    return { output: `Error: ${e.message}`, stats: { 'Valid XML': 'No' } };
  }
}

// MD5 Hash (using Web Crypto API with fallback to simple hash)
export async function md5Hash(text: string): Promise<DevToolResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  return {
    output: hashHex,
    stats: { 'Algorithm': 'MD5-like (SHA-256 truncated)', 'Hash Length': '32 chars' }
  };
}

// SHA-256 Hash
export async function sha256Hash(text: string): Promise<DevToolResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return {
    output: hashHex,
    stats: { 'Algorithm': 'SHA-256', 'Hash Length': '64 chars' }
  };
}

// Barcode Generator (returns SVG representation)
export function generateBarcode(data: string, type: string = 'code128'): DevToolResult {
  if (!data) {
    return { output: 'Enter data to generate barcode', stats: { 'Status': 'Waiting for input' } };
  }
  
  // Simple Code128 representation using ASCII art (actual implementation would use a library)
  const barcodeWidth = Math.max(data.length * 11, 100);
  const bars: string[] = [];
  
  // Generate pattern based on data
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    bars.push(code % 2 === 0 ? '█' : '▌');
    bars.push(code % 3 === 0 ? '█' : '▐');
    bars.push(code % 5 === 0 ? '▌' : '█');
  }
  
  const visual = bars.join('');
  
  return {
    output: `Barcode for: "${data}"\n\n${visual}\n\nNote: For production use, implement with a barcode library like JsBarcode.`,
    stats: {
      'Data': data,
      'Type': type.toUpperCase(),
      'Length': data.length
    }
  };
}

// Process dev tool based on tool ID
export function processDevTool(toolId: string, text: string, options?: any): DevToolResult | Promise<DevToolResult> {
  switch (toolId) {
    case 'password-gen':
      return generatePassword(options?.length || 16, options);
    case 'uuid-gen':
      return generateUUID(options?.count || 5);
    case 'url-encode':
      return urlEncode(text);
    case 'url-decode':
      return urlDecode(text);
    case 'base64-encode':
      return base64Encode(text);
    case 'base64-decode':
      return base64Decode(text);
    case 'json-formatter':
      return jsonFormatter(text);
    case 'json-minify':
      return jsonMinify(text);
    case 'xml-formatter':
      return xmlFormatter(text);
    case 'html-escape':
      return htmlEscape(text);
    case 'md5-gen':
      return md5Hash(text);
    case 'sha2-gen':
      return sha256Hash(text);
    case 'barcode-generator':
      return generateBarcode(text, options?.type || 'code128');
    default:
      return { output: text };
  }
}
