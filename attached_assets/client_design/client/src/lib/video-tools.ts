// Video Tools - Client-side processing with FFmpeg.wasm
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoToolResult {
  blob?: Blob;
  dataUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  message?: string;
  requiresServer?: boolean;
  filename?: string;
}

let ffmpeg: FFmpeg | null = null;
let ffmpegLoading = false;
let ffmpegLoaded = false;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for browser processing

// Content type mapping
const CONTENT_TYPES: Record<string, { type: string; ext: string }> = {
  'video-to-gif': { type: 'image/gif', ext: 'gif' },
  'gif-to-mp4': { type: 'video/mp4', ext: 'mp4' },
  'mov-to-mp4': { type: 'video/mp4', ext: 'mp4' },
  'webm-to-mp4': { type: 'video/mp4', ext: 'mp4' },
  'mkv-to-mp4': { type: 'video/mp4', ext: 'mp4' },
  'avi-to-mp4': { type: 'video/mp4', ext: 'mp4' },
  'mp4-to-mp3': { type: 'audio/mpeg', ext: 'mp3' },
  'trim-video': { type: 'video/mp4', ext: 'mp4' },
  'mute-video': { type: 'video/mp4', ext: 'mp4' },
  'speed-video': { type: 'video/mp4', ext: 'mp4' },
  'resize-video': { type: 'video/mp4', ext: 'mp4' },
  'compress-video': { type: 'video/mp4', ext: 'mp4' },
  'rotate-video': { type: 'video/mp4', ext: 'mp4' },
  'flip-video': { type: 'video/mp4', ext: 'mp4' },
  'mp4-to-webm': { type: 'video/webm', ext: 'webm' },
};

// All tools now support client-side processing
const CLIENT_SIDE_TOOLS = [
  'mute-video', 'mp4-to-mp3', 'video-to-gif', 'gif-to-mp4',
  'trim-video', 'speed-video', 'resize-video', 'compress-video',
  'rotate-video', 'flip-video', 'mov-to-mp4', 'webm-to-mp4',
  'mkv-to-mp4', 'avi-to-mp4', 'mp4-to-webm'
];

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoaded) return ffmpeg;
  if (ffmpegLoading) {
    while (ffmpegLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (ffmpeg && ffmpegLoaded) return ffmpeg;
  }
  
  ffmpegLoading = true;
  
  try {
    ffmpeg = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    ffmpegLoaded = true;
    return ffmpeg;
  } catch (error) {
    ffmpegLoading = false;
    throw new Error('Failed to load video processor. Please try again.');
  } finally {
    ffmpegLoading = false;
  }
}

// Parse time string to seconds (HH:MM:SS or MM:SS or SS)
function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

// Process video tool
export async function processVideoTool(toolId: string, file: File | null, options: any = {}): Promise<VideoToolResult> {
  if (!file) {
    throw new Error('No video file provided');
  }

  // Check file size limit
  if (file.size > MAX_FILE_SIZE) {
    return {
      requiresServer: true,
      message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 100MB limit for browser processing. For larger files, we recommend free desktop software like HandBrake or VLC Media Player.`
    };
  }

  const contentInfo = CONTENT_TYPES[toolId] || { type: 'video/mp4', ext: 'mp4' };
  
  try {
    const ff = await loadFFmpeg();
    const inputExt = getFileExtension(file.name);
    const inputName = 'input' + inputExt;
    const outputName = `output.${contentInfo.ext}`;
    
    // Write input file
    await ff.writeFile(inputName, await fetchFile(file));
    
    // Build command based on tool
    let command: string[];
    
    switch (toolId) {
      case 'mute-video':
        command = ['-i', inputName, '-c:v', 'copy', '-an', outputName];
        break;
        
      case 'mp4-to-mp3':
        command = ['-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName];
        break;
        
      case 'video-to-gif':
        const fps = options.fps || 10;
        const gifWidth = options.width || 480;
        command = ['-i', inputName, '-vf', `fps=${fps},scale=${gifWidth}:-1:flags=lanczos`, '-c:v', 'gif', outputName];
        break;
        
      case 'gif-to-mp4':
        command = ['-i', inputName, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', outputName];
        break;
        
      case 'trim-video':
        const startTime = String(options.startTime || '0').trim() || '0';
        const duration = String(options.duration || '10').trim() || '10';
        command = ['-i', inputName, '-ss', startTime, '-t', duration, '-c', 'copy', outputName];
        break;
        
      case 'speed-video':
        const speed = options.speed || 1.5;
        const videoSpeed = 1 / speed;
        const audioSpeed = speed;
        if (speed >= 0.5 && speed <= 2) {
          command = ['-i', inputName, '-filter_complex', `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]atempo=${audioSpeed}[a]`, '-map', '[v]', '-map', '[a]', outputName];
        } else {
          // For extreme speeds, drop audio
          command = ['-i', inputName, '-filter:v', `setpts=${videoSpeed}*PTS`, '-an', outputName];
        }
        break;
        
      case 'resize-video':
        const width = options.width || 1280;
        const height = options.height || 720;
        command = ['-i', inputName, '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`, '-c:a', 'copy', outputName];
        break;
        
      case 'compress-video':
        const quality = options.quality || 'medium';
        const crf = quality === 'high' ? '18' : quality === 'low' ? '35' : '28';
        command = ['-i', inputName, '-c:v', 'libx264', '-crf', crf, '-preset', 'fast', '-c:a', 'aac', '-b:a', '128k', outputName];
        break;
        
      case 'rotate-video':
        const rotation = options.rotation || 90;
        let rotateFilter: string;
        if (rotation === 90) {
          rotateFilter = 'transpose=1'; // 90° clockwise
        } else if (rotation === 180) {
          rotateFilter = 'transpose=1,transpose=1'; // 180°
        } else if (rotation === 270) {
          rotateFilter = 'transpose=2'; // 270° clockwise = 90° counter-clockwise
        } else {
          rotateFilter = 'transpose=1'; // default to 90°
        }
        command = ['-i', inputName, '-vf', rotateFilter, '-c:a', 'copy', outputName];
        break;
        
      case 'flip-video':
        const direction = options.direction || 'horizontal';
        const flipFilter = direction === 'vertical' ? 'vflip' : 'hflip';
        command = ['-i', inputName, '-vf', flipFilter, '-c:a', 'copy', outputName];
        break;
        
      case 'mov-to-mp4':
      case 'webm-to-mp4':
      case 'mkv-to-mp4':
      case 'avi-to-mp4':
        command = ['-i', inputName, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', 'faststart', outputName];
        break;
        
      case 'mp4-to-webm':
        command = ['-i', inputName, '-c:v', 'libvpx', '-crf', '30', '-b:v', '1M', '-c:a', 'libvorbis', outputName];
        break;
        
      default:
        throw new Error(`Tool ${toolId} is not supported`);
    }
    
    // Execute
    await ff.exec(command);
    
    // Read output
    const data = await ff.readFile(outputName);
    const blob = new Blob([data], { type: contentInfo.type });
    const dataUrl = URL.createObjectURL(blob);
    
    // Cleanup
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return {
      blob,
      dataUrl,
      filename: `${toolId}-output.${contentInfo.ext}`,
      message: 'Processing complete!'
    };
    
  } catch (error: any) {
    console.error('Video processing error:', error);
    throw new Error(error.message || 'Video processing failed. Try a smaller file or different format.');
  }
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '.mp4';
}
