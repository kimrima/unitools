import { Howl } from 'howler';

type SoundType = 'drumroll' | 'fanfare' | 'buzzer' | 'click' | 'pop' | 'whoosh' | 'tada' | 'tick' | 'ding' | 'explosion';

const soundCache: Map<SoundType, Howl> = new Map();

const BASE64_SOUNDS: Record<SoundType, string> = {
  drumroll: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  fanfare: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  buzzer: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  click: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  pop: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  whoosh: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  tada: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  tick: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  ding: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA=',
  explosion: 'data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA='
};

function createOscillatorSound(
  type: OscillatorType,
  frequency: number,
  duration: number,
  fadeOut: boolean = true
): Howl {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  }
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return new Howl({
    src: [BASE64_SOUNDS.click],
    volume: 0.3,
    onplay: () => {
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    }
  });
}

export function generateSound(type: SoundType): void {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  switch (type) {
    case 'drumroll': {
      const duration = 2;
      const interval = 0.05;
      for (let i = 0; i < duration / interval; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 + Math.random() * 100, now + i * interval);
        gain.gain.setValueAtTime(0.1 + (i / (duration / interval)) * 0.2, now + i * interval);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * interval + 0.04);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + i * interval);
        osc.stop(now + i * interval + 0.05);
      }
      break;
    }
    
    case 'fanfare':
    case 'tada': {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0.2, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.35);
      });
      break;
    }
    
    case 'buzzer': {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
    
    case 'click':
    case 'pop': {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }
    
    case 'whoosh': {
      const bufferSize = audioContext.sampleRate * 0.3;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      source.start(now);
      break;
    }
    
    case 'tick': {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
    
    case 'ding': {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
    }
    
    case 'explosion': {
      const bufferSize = audioContext.sampleRate * 0.5;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / audioContext.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 5);
      }
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.4, now);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      source.start(now);
      break;
    }
  }
}

export function playSound(type: SoundType): void {
  try {
    generateSound(type);
  } catch (err) {
    console.warn('Sound playback failed:', err);
  }
}

export function playDrumroll(): void {
  playSound('drumroll');
}

export function playFanfare(): void {
  playSound('fanfare');
}

export function playBuzzer(): void {
  playSound('buzzer');
}

export function playClick(): void {
  playSound('click');
}

export function playTada(): void {
  playSound('tada');
}

export function playTick(): void {
  playSound('tick');
}

export function playDing(): void {
  playSound('ding');
}

export function playExplosion(): void {
  playSound('explosion');
}

export { type SoundType };
