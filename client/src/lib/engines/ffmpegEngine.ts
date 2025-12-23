let FFmpegModule: typeof import('@ffmpeg/ffmpeg') | null = null;
let FFmpegUtilModule: typeof import('@ffmpeg/util') | null = null;
let ffmpeg: InstanceType<typeof import('@ffmpeg/ffmpeg').FFmpeg> | null = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;
let loadFailed = false;
let failReason = '';

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

async function loadModules() {
  if (!FFmpegModule) {
    FFmpegModule = await import('@ffmpeg/ffmpeg');
  }
  if (!FFmpegUtilModule) {
    FFmpegUtilModule = await import('@ffmpeg/util');
  }
  return { FFmpegModule, FFmpegUtilModule };
}

async function loadFFmpeg(): Promise<any> {
  if (ffmpeg && (ffmpeg as any).loaded) {
    return ffmpeg;
  }

  if (loadFailed) {
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = (async () => {
    try {
      const { FFmpegModule, FFmpegUtilModule } = await loadModules();
      const { FFmpeg } = FFmpegModule;
      const { toBlobURL } = FFmpegUtilModule;
      
      const instance = new FFmpeg();
      
      const baseURL = '/ffmpeg';

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('FFmpeg load timeout (90s)')), 90000);
      });

      console.log('[FFmpeg] Fetching core files from local server...');
      
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

      console.log('[FFmpeg] Loading FFmpeg instance...');
      
      const loadPromiseInner = instance.load({
        coreURL,
        wasmURL,
      });

      await Promise.race([loadPromiseInner, timeoutPromise]);
      
      ffmpeg = instance;
      isLoading = false;
      console.log('[FFmpeg] Loaded successfully');
      return instance;
    } catch (e) {
      isLoading = false;
      loadFailed = true;
      failReason = e instanceof Error ? e.message : 'Unknown error loading FFmpeg';
      console.error('[FFmpeg] Load failed:', failReason);
      loadPromise = null;
      throw new FFmpegError('FFMPEG_LOAD_FAILED');
    }
  })();

  return loadPromise;
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

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
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

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-c:v', 'copy',
      '-an',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
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

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface VideoSpeedOptions {
  speed: number;
}

export interface VideoSpeedResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function changeVideoSpeed(
  file: File,
  options: VideoSpeedOptions,
  onProgress?: ProgressCallback
): Promise<VideoSpeedResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { speed } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    const videoFilter = `setpts=${(1/speed).toFixed(2)}*PTS`;
    const audioFilter = `atempo=${speed}`;

    await ff.exec([
      '-i', inputFileName,
      '-filter:v', videoFilter,
      '-filter:a', audioFilter,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface CompressVideoOptions {
  quality: 'low' | 'medium' | 'high';
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

  const { quality } = options;
  const crfMap = { low: 35, medium: 28, high: 23 };
  const crf = crfMap[quality];

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-crf', crf.toString(),
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
      compressionRatio: Math.round((1 - outputBlob.size / file.size) * 100),
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface FlipVideoOptions {
  horizontal: boolean;
  vertical: boolean;
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

  const { horizontal, vertical } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    let filter = '';
    if (horizontal && vertical) {
      filter = 'hflip,vflip';
    } else if (horizontal) {
      filter = 'hflip';
    } else if (vertical) {
      filter = 'vflip';
    } else {
      filter = 'null';
    }

    await ff.exec([
      '-i', inputFileName,
      '-vf', filter,
      '-c:a', 'copy',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ResizeVideoOptions {
  width: number;
  height: number;
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

  const { width, height } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp4';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-vf', `scale=${width}:${height}`,
      '-c:a', 'copy',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'video/mp4' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ConvertVideoOptions {
  outputFormat: 'mp4' | 'webm';
}

export interface ConvertVideoResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function convertVideo(
  file: File,
  options: ConvertVideoOptions,
  onProgress?: ProgressCallback
): Promise<ConvertVideoResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { outputFormat } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = `output.${outputFormat}`;
  const mimeType = outputFormat === 'mp4' ? 'video/mp4' : 'video/webm';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    const args = ['-i', inputFileName];
    
    if (outputFormat === 'webm') {
      args.push('-c:v', 'libvpx', '-c:a', 'libvorbis');
    } else {
      args.push('-c:v', 'libx264', '-c:a', 'aac');
    }
    
    args.push(outputFileName);

    await ff.exec(args);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: mimeType });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
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

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface JoinAudioResult {
  outputBlob: Blob;
  totalSize: number;
}

export async function joinAudio(
  files: File[],
  onProgress?: ProgressCallback
): Promise<JoinAudioResult> {
  if (!files || files.length === 0) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const outputFileName = 'output.mp3';

  try {
    let concatList = '';
    for (let i = 0; i < files.length; i++) {
      const inputFileName = `input${i}${getFileExtension(files[i].name)}`;
      await ff.writeFile(inputFileName, await fetchFile(files[i]));
      concatList += `file '${inputFileName}'\n`;
    }

    await ff.writeFile('concat.txt', concatList);

    await ff.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    for (let i = 0; i < files.length; i++) {
      const inputFileName = `input${i}${getFileExtension(files[i].name)}`;
      await ff.deleteFile(inputFileName);
    }
    await ff.deleteFile('concat.txt');
    await ff.deleteFile(outputFileName);

    return {
      outputBlob,
      totalSize: files.reduce((acc, f) => acc + f.size, 0),
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED');
  }
}

export interface ConvertAudioOptions {
  outputFormat: 'mp3' | 'wav' | 'ogg';
}

export interface ConvertAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function convertAudio(
  file: File,
  options: ConvertAudioOptions,
  onProgress?: ProgressCallback
): Promise<ConvertAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { outputFormat } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = `output.${outputFormat}`;
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg'
  };

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    const args = ['-i', inputFileName];
    
    if (outputFormat === 'mp3') {
      args.push('-acodec', 'libmp3lame', '-q:a', '2');
    } else if (outputFormat === 'ogg') {
      args.push('-acodec', 'libvorbis', '-q:a', '4');
    }
    
    args.push(outputFileName);

    await ff.exec(args);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: mimeTypes[outputFormat] });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface BoostAudioOptions {
  volume: number;
}

export interface BoostAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function boostAudio(
  file: File,
  options: BoostAudioOptions,
  onProgress?: ProgressCallback
): Promise<BoostAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { volume } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-af', `volume=${volume}`,
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface ReverseAudioResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function reverseAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<ReverseAudioResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-af', 'areverse',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface AudioBitrateOptions {
  bitrate: '64k' | '128k' | '192k' | '256k' | '320k';
}

export interface AudioBitrateResult {
  originalFile: File;
  outputBlob: Blob;
  originalSize: number;
  outputSize: number;
}

export async function changeAudioBitrate(
  file: File,
  options: AudioBitrateOptions,
  onProgress?: ProgressCallback
): Promise<AudioBitrateResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { bitrate } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.mp3';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-acodec', 'libmp3lame',
      '-b:a', bitrate,
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: 'audio/mpeg' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
      originalSize: file.size,
      outputSize: outputBlob.size,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export interface VideoCaptureOptions {
  timestamp: number;
  format: 'jpg' | 'png';
}

export interface VideoCaptureResult {
  originalFile: File;
  outputBlob: Blob;
}

export async function captureVideoFrame(
  file: File,
  options: VideoCaptureOptions,
  onProgress?: ProgressCallback
): Promise<VideoCaptureResult> {
  if (!file) {
    throw new FFmpegError('NO_FILE_PROVIDED');
  }

  const { timestamp, format } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = `output.${format}`;
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    await ff.exec([
      '-i', inputFileName,
      '-ss', timestamp.toString(),
      '-vframes', '1',
      outputFileName
    ]);

    const data = await ff.readFile(outputFileName);
    const outputBlob = new Blob([data], { type: mimeType });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      outputBlob,
    };
  } catch (e) {
    if (e instanceof FFmpegError) throw e;
    throw new FFmpegError('PROCESSING_FAILED', file.name);
  }
}

export { getBaseName, getFileExtension };
