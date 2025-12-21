import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

export interface GifOptions {
  fps?: number;
  width?: number;
  startTime?: number;
  duration?: number;
}

export interface GifResult {
  originalFile: File;
  gifBlob: Blob;
  originalSize: number;
  gifSize: number;
}

export type GifProgressCallback = (progress: number) => void;

export type VideoToGifErrorCode = 
  | 'NO_FILE_PROVIDED'
  | 'FFMPEG_LOAD_FAILED'
  | 'CONVERSION_FAILED'
  | 'INVALID_VIDEO';

export class VideoToGifError extends Error {
  code: VideoToGifErrorCode;
  fileName?: string;

  constructor(code: VideoToGifErrorCode, fileName?: string) {
    super(code);
    this.code = code;
    this.fileName = fileName;
    this.name = 'VideoToGifError';
  }
}

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;

  loadPromise = (async () => {
    const instance = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    try {
      await instance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpeg = instance;
      isLoading = false;
      return instance;
    } catch {
      isLoading = false;
      loadPromise = null;
      throw new VideoToGifError('FFMPEG_LOAD_FAILED');
    }
  })();

  return loadPromise;
}

export async function convertVideoToGif(
  file: File,
  options: GifOptions = {},
  onProgress?: GifProgressCallback
): Promise<GifResult> {
  if (!file) {
    throw new VideoToGifError('NO_FILE_PROVIDED');
  }

  const { fps = 10, width = 480, startTime = 0, duration } = options;

  let ff: FFmpeg;
  try {
    ff = await loadFFmpeg();
  } catch (e) {
    if (e instanceof VideoToGifError) throw e;
    throw new VideoToGifError('FFMPEG_LOAD_FAILED');
  }

  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputFileName = 'input' + getFileExtension(file.name);
  const outputFileName = 'output.gif';

  try {
    await ff.writeFile(inputFileName, await fetchFile(file));

    const filterComplex = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer`;

    const args = ['-i', inputFileName];
    
    if (startTime > 0) {
      args.push('-ss', startTime.toString());
    }
    
    if (duration && duration > 0) {
      args.push('-t', duration.toString());
    }

    args.push(
      '-vf', filterComplex,
      '-loop', '0',
      outputFileName
    );

    await ff.exec(args);

    const data = await ff.readFile(outputFileName);
    const gifBlob = new Blob([data], { type: 'image/gif' });

    await ff.deleteFile(inputFileName);
    await ff.deleteFile(outputFileName);

    return {
      originalFile: file,
      gifBlob,
      originalSize: file.size,
      gifSize: gifBlob.size,
    };
  } catch (e) {
    if (e instanceof VideoToGifError) throw e;
    throw new VideoToGifError('CONVERSION_FAILED', file.name);
  }
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '.mp4';
}

export function isFFmpegSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}
