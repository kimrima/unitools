import { useState, useCallback, useRef } from 'react';

export type ProcessingStage = 'idle' | 'queued' | 'analyzing' | 'processing' | 'optimizing' | 'complete' | 'error';

export interface StagedProcessingState {
  stage: ProcessingStage;
  progress: number;
  stageProgress: number;
  message: string;
  error: string | null;
}

export interface StagedProcessingConfig {
  minDuration?: number;
  stages?: { name: ProcessingStage; duration: number; message: string }[];
}

const defaultStages = [
  { name: 'analyzing' as const, duration: 1200, message: 'Analyzing file...' },
  { name: 'processing' as const, duration: 2000, message: 'Processing...' },
  { name: 'optimizing' as const, duration: 1300, message: 'Optimizing output...' },
];

export function useStagedProcessing(config: StagedProcessingConfig = {}) {
  const { minDuration = 4500, stages = defaultStages } = config;
  
  const [state, setState] = useState<StagedProcessingState>({
    stage: 'idle',
    progress: 0,
    stageProgress: 0,
    message: '',
    error: null,
  });
  
  const abortRef = useRef(false);
  const resultRef = useRef<unknown>(null);
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const animateProgress = useCallback(async (
    fromProgress: number,
    toProgress: number,
    duration: number,
    stageName: ProcessingStage,
    message: string
  ) => {
    const steps = Math.ceil(duration / 50);
    const increment = (toProgress - fromProgress) / steps;
    
    setState(prev => ({ ...prev, stage: stageName, message }));
    
    for (let i = 0; i <= steps && !abortRef.current; i++) {
      const currentProgress = Math.min(fromProgress + increment * i, toProgress);
      const stageProgress = (i / steps) * 100;
      setState(prev => ({ ...prev, progress: currentProgress, stageProgress }));
      await delay(50);
    }
  }, []);
  
  const runStagedProcessing = useCallback(async <T>(
    actualProcessing: () => Promise<T>,
    onComplete?: (result: T) => void
  ): Promise<T | null> => {
    abortRef.current = false;
    resultRef.current = null;
    
    setState({
      stage: 'queued',
      progress: 0,
      stageProgress: 0,
      message: 'Preparing...',
      error: null,
    });
    
    const startTime = Date.now();
    let processingResult: T | null = null;
    let processingError: Error | null = null;
    
    const processingPromise = actualProcessing()
      .then(result => { processingResult = result; })
      .catch(err => { processingError = err; });
    
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    let currentProgress = 0;
    
    for (const stageConfig of stages) {
      if (abortRef.current) break;
      
      const progressIncrement = (stageConfig.duration / totalDuration) * 95;
      await animateProgress(
        currentProgress,
        currentProgress + progressIncrement,
        stageConfig.duration,
        stageConfig.name,
        stageConfig.message
      );
      currentProgress += progressIncrement;
    }
    
    await processingPromise;
    
    const elapsed = Date.now() - startTime;
    if (elapsed < minDuration && !abortRef.current) {
      await delay(minDuration - elapsed);
    }
    
    if (processingError) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        progress: 0,
        error: processingError?.message || 'Processing failed',
      }));
      throw processingError;
    }
    
    setState(prev => ({
      ...prev,
      stage: 'complete',
      progress: 100,
      stageProgress: 100,
      message: 'Complete!',
    }));
    
    if (onComplete && processingResult !== null) {
      onComplete(processingResult);
    }
    
    resultRef.current = processingResult;
    return processingResult;
  }, [stages, minDuration, animateProgress]);
  
  const reset = useCallback(() => {
    abortRef.current = true;
    setState({
      stage: 'idle',
      progress: 0,
      stageProgress: 0,
      message: '',
      error: null,
    });
    resultRef.current = null;
  }, []);
  
  const abort = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      stage: 'idle',
      progress: 0,
      message: 'Cancelled',
    }));
  }, []);
  
  return {
    ...state,
    isProcessing: state.stage !== 'idle' && state.stage !== 'complete' && state.stage !== 'error',
    isComplete: state.stage === 'complete',
    isError: state.stage === 'error',
    runStagedProcessing,
    reset,
    abort,
    result: resultRef.current,
  };
}
