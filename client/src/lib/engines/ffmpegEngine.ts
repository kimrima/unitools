declare global {
  interface Window {
    FFmpeg: {
      createFFmpeg: (options?: { log?: boolean; corePath?: string; mainName?: string }) => FFmpegInstance;
      fetchFile: (file: File | Blob | string) => Promise<Uint8Array>;
    };
  }
}

interface FFmpegInstance {
  load: () => Promise<void>;
  isLoaded: () => boolean;
  run: (...args: string[]) => Promise<void>;
  FS: (method: string, ...args: any[]) => any;
  setProgress: (callback: (progress: { ratio: number }) => void) => void;
  exit: () => void;
}

let isLoading = false;
let loadFailed = false;
let failReason = '';
let scriptLoaded = false;
let useCount = 0;

export type FFmpegErrorCode = 
  | 'NO_FILE_PROVIDED'
  | 'FFMPEG_LOAD_FAILED'
  | 'PROCESSING_FAILED'
  | 'INVALID_FILE'
  | 'SHAREDARRAYBUFFER_NOT_AVAILABLE';

export class FFmpegError extends Error {
  code: FFmpegErrorCode;
  fileName?: string;

  constructor(code: FFmpegErrorCode, fileName?: string) {
    super(code);
    this.code = code;
    this.fileName = fileName;
    this.name = 'FFmpegError';
  }
}

export type ProgressCallback = (progress: number) => void;

export function isFFmpegSupported(): boolean {
  return true;
}

export function getFFmpegLoadStatus(): { failed: boolean; reason: string } {
  return { failed: loadFailed, reason: failReason };
}

async function loadScript(): Promise<void> {
  if (scriptLoaded) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      scriptLoaded = true;
      console.log('[FFmpeg] Script loaded from CDN');
      resolve();
    };
    script.onerror = (e) => {
      console.error('[FFmpeg] Script load error:', e);
      reject(new Error('Failed to load FFmpeg script'));
    };
    document.head.appendChild(script);
  });
}

async function loadFFmpeg(): Promise<FFmpegInstance> {
  if (loadFailed) {
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  try {
    console.log('[FFmpeg] Loading script...');
    await loadScript();
    
    if (!window.FFmpeg) {
      throw new Error('FFmpeg global not found after script load');
    }

    const { createFFmpeg } = window.FFmpeg;
    
    useCount++;
    console.log(`[FFmpeg] Creating new instance #${useCount}...`);
    const instance = createFFmpeg({
      log: true,
      mainName: 'main',
      corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js'
    });

    console.log('[FFmpeg] Loading WASM...');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('FFmpeg load timeout (180s)')), 180000);
    });

    await Promise.race([instance.load(), timeoutPromise]);
    
    console.log('[FFmpeg] Loaded successfully');
    return instance;
  } catch (e) {
    loadFailed = true;
    failReason = e instanceof Error ? e.message : 'Unknown error loading FFmpeg';
    console.error('[FFmpeg] Load failed:', failReason);
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }
}

async function fetchFile(file: File): Promise<Uint8Array> {
  if (window.FFmpeg?.fetchFile) {
    return window.FFmpeg.fetchFile(file);
  }
  return new Uint8Array(await file.arrayBuffer());
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '.mp4';
}

function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

export interface TrimVideoOptions {
  startTime: number;
  endTime: number;
}

export interface TrimVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function trimVideo(
  file: File,
  options: TrimVideoOptions,
  onProgress?: ProgressCallback
): Promise<TrimVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { startTime, endTime } = options;
  const duration = endTime - startTime;

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    console.log(`[FFmpeg] Trim: file=${file.name}, size=${(file.size/1024/1024).toFixed(2)}MB, start=${startTime}, end=${endTime}, duration=${duration}`);
    
    const fileData = await fetchFile(file);
    console.log(`[FFmpeg] File loaded into memory: ${(fileData.length/1024/1024).toFixed(2)}MB`);
    
    ff.FS('writeFile', inputFileName, fileData);
    console.log('[FFmpeg] File written to virtual FS');

    console.log('[FFmpeg] Running trim command...');
    await ff.run(
      '-ss', startTime.toString(),
      '-i', inputFileName,
      '-t', duration.toString(),
      '-c', 'copy',
      '-avoid_negative_ts', 'make_zero',
      outputFileName
    );
    console.log('[FFmpeg] Trim command completed');

    const data = ff.FS('readFile', outputFileName);
    console.log(`[FFmpeg] Output size: ${(data.length/1024/1024).toFixed(2)}MB`);
    
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    console.error('[FFmpeg] Trim error:', e);
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface MuteVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function muteVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<MuteVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-c:v', 'copy',
      '-an',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ExtractAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function extractAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'audio/mp3' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface CompressVideoOptions {
  quality: 'high' | 'medium' | 'low';
}

export interface CompressVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
  compressionRatio: number;
}

export async function compressVideo(
  file: File,
  options: CompressVideoOptions,
  onProgress?: ProgressCallback
): Promise<CompressVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const crfValues = {
    high: '23',
    medium: '28',
    low: '35'
  };

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-crf', crfValues[options.quality],
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
      compressionRatio: file.size / outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ConvertVideoOptions {
  format: 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv';
}

export interface ConvertVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
  format: string;
}

export async function convertVideo(
  file: File,
  options: ConvertVideoOptions,
  onProgress?: ProgressCallback
): Promise<ConvertVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const formatSettings: Record<string, { ext: string; mime: string; args: string[] }> = {
    mp4: { ext: 'mp4', mime: 'video/mp4', args: ['-c:v', 'libx264', '-c:a', 'aac'] },
    webm: { ext: 'webm', mime: 'video/webm', args: ['-c:v', 'libvpx', '-c:a', 'libvorbis'] },
    avi: { ext: 'avi', mime: 'video/avi', args: ['-c:v', 'mpeg4', '-c:a', 'mp3'] },
    mov: { ext: 'mov', mime: 'video/quicktime', args: ['-c:v', 'libx264', '-c:a', 'aac'] },
    mkv: { ext: 'mkv', mime: 'video/x-matroska', args: ['-c:v', 'libx264', '-c:a', 'aac'] },
  };

  const settings = formatSettings[options.format];
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.' + settings.ext;

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      ...settings.args,
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: settings.mime });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
      format: options.format,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface VideoToGifOptions {
  startTime?: number;
  duration?: number;
  fps?: number;
  width?: number;
}

export interface VideoToGifResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function videoToGif(
  file: File,
  options: VideoToGifOptions = {},
  onProgress?: ProgressCallback
): Promise<VideoToGifResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const { startTime = 0, duration = 5, fps = 10, width = 320 } = options;
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.gif';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const filterStr = `fps=${fps},scale=${width}:-1:flags=lanczos`;

    await ff.run(
      '-i', inputFileName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-vf', filterStr,
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'image/gif' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface RotateVideoOptions {
  rotation: 90 | 180 | 270;
}

export interface RotateVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function rotateVideo(
  file: File,
  options: RotateVideoOptions,
  onProgress?: ProgressCallback
): Promise<RotateVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const transposeValues: Record<number, string> = {
    90: 'transpose=1',
    180: 'transpose=1,transpose=1',
    270: 'transpose=2',
  };

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-vf', transposeValues[options.rotation],
      '-c:a', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface FlipVideoOptions {
  direction: 'horizontal' | 'vertical';
}

export interface FlipVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function flipVideo(
  file: File,
  options: FlipVideoOptions,
  onProgress?: ProgressCallback
): Promise<FlipVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const filterValue = options.direction === 'horizontal' ? 'hflip' : 'vflip';
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-vf', filterValue,
      '-c:a', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface AddWatermarkOptions {
  text: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  fontSize?: number;
  color?: string;
}

export interface AddWatermarkResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function addWatermark(
  file: File,
  options: AddWatermarkOptions,
  onProgress?: ProgressCallback
): Promise<AddWatermarkResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const { text, position = 'bottom-right', fontSize = 24, color = 'white' } = options;

  const positionCoords: Record<string, { x: string; y: string }> = {
    'top-left': { x: '10', y: '10' },
    'top-right': { x: '(w-text_w-10)', y: '10' },
    'bottom-left': { x: '10', y: '(h-text_h-10)' },
    'bottom-right': { x: '(w-text_w-10)', y: '(h-text_h-10)' },
    'center': { x: '(w-text_w)/2', y: '(h-text_h)/2' },
  };

  const pos = positionCoords[position];
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const filterStr = `drawtext=text='${text}':x=${pos.x}:y=${pos.y}:fontsize=${fontSize}:fontcolor=${color}`;

    await ff.run(
      '-i', inputFileName,
      '-vf', filterStr,
      '-c:a', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ResizeVideoOptions {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

export interface ResizeVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function resizeVideo(
  file: File,
  options: ResizeVideoOptions,
  onProgress?: ProgressCallback
): Promise<ResizeVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const { width, height, maintainAspectRatio = true } = options;
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const scaleFilter = maintainAspectRatio 
      ? `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
      : `scale=${width}:${height}`;

    await ff.run(
      '-i', inputFileName,
      '-vf', scaleFilter,
      '-c:a', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ChangeSpeedOptions {
  speed: number;
}

export interface ChangeSpeedResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function changeSpeed(
  file: File,
  options: ChangeSpeedOptions,
  onProgress?: ProgressCallback
): Promise<ChangeSpeedResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const { speed } = options;
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const pts = 1 / speed;
    const atempo = speed > 2 ? '2.0,atempo=' + (speed / 2) : speed < 0.5 ? '0.5,atempo=' + (speed * 2) : speed.toString();

    await ff.run(
      '-i', inputFileName,
      '-filter:v', `setpts=${pts}*PTS`,
      '-filter:a', `atempo=${atempo}`,
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ConvertAudioOptions {
  format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac';
  bitrate?: string;
}

export interface ConvertAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
  format: string;
}

export async function convertAudio(
  file: File,
  options: ConvertAudioOptions,
  onProgress?: ProgressCallback
): Promise<ConvertAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const formatSettings: Record<string, { ext: string; mime: string; codec: string }> = {
    mp3: { ext: 'mp3', mime: 'audio/mp3', codec: 'libmp3lame' },
    wav: { ext: 'wav', mime: 'audio/wav', codec: 'pcm_s16le' },
    ogg: { ext: 'ogg', mime: 'audio/ogg', codec: 'libvorbis' },
    aac: { ext: 'aac', mime: 'audio/aac', codec: 'aac' },
    flac: { ext: 'flac', mime: 'audio/flac', codec: 'flac' },
  };

  const settings = formatSettings[options.format];
  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.' + settings.ext;

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const args = ['-i', inputFileName, '-acodec', settings.codec];
    if (options.bitrate) {
      args.push('-b:a', options.bitrate);
    }
    args.push(outputFileName);

    await ff.run(...args);

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: settings.mime });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
      format: options.format,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface TrimAudioOptions {
  startTime: number;
  endTime: number;
}

export interface TrimAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function trimAudio(
  file: File,
  options: TrimAudioOptions,
  onProgress?: ProgressCallback
): Promise<TrimAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { startTime, endTime } = options;
  const duration = endTime - startTime;

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const ext = getFileExtension(file.name);
  const inputFileName = 'input' + ext;
  const outputFileName = 'output' + ext;

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: file.type });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface MergeAudioOptions {
  files: File[];
}

export interface MergeAudioResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function mergeAudio(
  files: File[],
  onProgress?: ProgressCallback
): Promise<MergeAudioResult> {
  if (!files || files.length < 2) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const ext = getFileExtension(files[0].name);
  const outputFileName = 'output' + ext;

  try {
    let concatList = '';
    for (let i = 0; i < files.length; i++) {
      const inputName = `input${i}${getFileExtension(files[i].name)}`;
      ff.FS('writeFile', inputName, await fetchFile(files[i]));
      concatList += `file '${inputName}'\n`;
    }
    
    ff.FS('writeFile', 'concat.txt', new TextEncoder().encode(concatList));

    await ff.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: files[0].type });

    for (let i = 0; i < files.length; i++) {
      const inputName = `input${i}${getFileExtension(files[i].name)}`;
      try { ff.FS('unlink', inputName); } catch {}
    }
    try { ff.FS('unlink', 'concat.txt'); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface AdjustVolumeOptions {
  volume: number;
}

export interface AdjustVolumeResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function adjustVolume(
  file: File,
  options: AdjustVolumeOptions,
  onProgress?: ProgressCallback
): Promise<AdjustVolumeResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const { volume } = options;
  const ext = getFileExtension(file.name);
  const inputFileName = 'input' + ext;
  const outputFileName = 'output' + ext;

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-af', `volume=${volume}`,
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: file.type });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface MergeVideoOptions {
  files: File[];
}

export interface MergeVideoResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function mergeVideo(
  files: File[],
  onProgress?: ProgressCallback
): Promise<MergeVideoResult> {
  if (!files || files.length < 2) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const outputFileName = 'output.mp4';

  try {
    let concatList = '';
    for (let i = 0; i < files.length; i++) {
      const inputName = `input${i}${getFileExtension(files[i].name)}`;
      ff.FS('writeFile', inputName, await fetchFile(files[i]));
      concatList += `file '${inputName}'\n`;
    }
    
    ff.FS('writeFile', 'concat.txt', new TextEncoder().encode(concatList));

    await ff.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    for (let i = 0; i < files.length; i++) {
      const inputName = `input${i}${getFileExtension(files[i].name)}`;
      try { ff.FS('unlink', inputName); } catch {}
    }
    try { ff.FS('unlink', 'concat.txt'); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface AddAudioToVideoOptions {
  video: File;
  audio: File;
  replaceOriginalAudio?: boolean;
}

export interface AddAudioToVideoResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function addAudioToVideo(
  options: AddAudioToVideoOptions,
  onProgress?: ProgressCallback
): Promise<AddAudioToVideoResult> {
  const { video, audio, replaceOriginalAudio = true } = options;
  
  if (!video || !audio) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const videoFileName = 'video' + getFileExtension(video.name);
  const audioFileName = 'audio' + getFileExtension(audio.name);
  const outputFileName = 'output.mp4';

  try {
    ff.FS('writeFile', videoFileName, await fetchFile(video));
    ff.FS('writeFile', audioFileName, await fetchFile(audio));

    if (replaceOriginalAudio) {
      await ff.run(
        '-i', videoFileName,
        '-i', audioFileName,
        '-c:v', 'copy',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        outputFileName
      );
    } else {
      await ff.run(
        '-i', videoFileName,
        '-i', audioFileName,
        '-filter_complex', '[0:a][1:a]amerge=inputs=2[a]',
        '-map', '0:v',
        '-map', '[a]',
        '-c:v', 'copy',
        '-ac', '2',
        '-shortest',
        outputFileName
      );
    }

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

    try { ff.FS('unlink', videoFileName); } catch {}
    try { ff.FS('unlink', audioFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface BoostAudioOptions {
  file: File;
  boostLevel: number;
}

export interface BoostAudioResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function boostAudio(
  options: BoostAudioOptions,
  onProgress?: ProgressCallback
): Promise<BoostAudioResult> {
  const { file, boostLevel } = options;
  
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    const volumeMultiplier = boostLevel / 100;
    await ff.run(
      '-i', inputFileName,
      '-filter:a', `volume=${volumeMultiplier}`,
      '-y',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'audio/mpeg' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface ReverseAudioOptions {
  file: File;
}

export interface ReverseAudioResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function reverseAudio(
  options: ReverseAudioOptions,
  onProgress?: ProgressCallback
): Promise<ReverseAudioResult> {
  const { file } = options;
  
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-filter:a', 'areverse',
      '-y',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'audio/mpeg' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface AudioBitrateOptions {
  file: File;
  bitrate: string;
}

export interface AudioBitrateResult {
  outputBlob: Blob;
  outputSize: number;
}

export async function changeAudioBitrate(
  options: AudioBitrateOptions,
  onProgress?: ProgressCallback
): Promise<AudioBitrateResult> {
  const { file, bitrate } = options;
  
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpegInstance;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.setProgress(({ ratio }) => {
      onProgress(Math.round(ratio * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    ff.FS('writeFile', inputFileName, await fetchFile(file));

    await ff.run(
      '-i', inputFileName,
      '-b:a', bitrate,
      '-y',
      outputFileName
    );

    const data = ff.FS('readFile', outputFileName);
    const outputBlob = new Blob([data.buffer], { type: 'audio/mpeg' });

    try { ff.FS('unlink', inputFileName); } catch {}
    try { ff.FS('unlink', outputFileName); } catch {}
    try { ff.exit(); } catch {}

    return {
      outputBlob,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    try { ff.exit(); } catch {}
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}
