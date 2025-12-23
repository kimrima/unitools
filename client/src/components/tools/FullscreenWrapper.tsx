import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface FullscreenContextType {
  isFullscreen: boolean;
  isTransparent: boolean;
  scale: number;
}

const FullscreenContext = createContext<FullscreenContextType>({
  isFullscreen: false,
  isTransparent: false,
  scale: 1
});

export function useFullscreenContext() {
  return useContext(FullscreenContext);
}

interface FullscreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
  enableTransparent?: boolean;
  baseWidth?: number;
  baseHeight?: number;
}

export function FullscreenWrapper({ 
  children, 
  className = '',
  showControls = true,
  enableTransparent = true,
  baseWidth = 800,
  baseHeight = 600
}: FullscreenWrapperProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!isFullscreen || !containerRef.current) {
      setScale(1);
      return;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 100;
    
    const availableWidth = screenWidth - padding;
    const availableHeight = screenHeight - padding;
    
    const scaleX = availableWidth / baseWidth;
    const scaleY = availableHeight / baseHeight;
    
    const newScale = Math.min(scaleX, scaleY, 2.5);
    setScale(Math.max(newScale, 1));
  }, [isFullscreen, baseWidth, baseHeight]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const toggleTransparent = useCallback(() => {
    setIsTransparent(prev => !prev);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        setScale(1);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    calculateScale();
    
    const handleResize = () => {
      if (isFullscreen) {
        calculateScale();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, calculateScale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === 't' && (e.ctrlKey || e.metaKey) && enableTransparent) {
        e.preventDefault();
        toggleTransparent();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen, toggleTransparent, enableTransparent]);

  const contextValue: FullscreenContextType = {
    isFullscreen,
    isTransparent,
    scale
  };

  return (
    <FullscreenContext.Provider value={contextValue}>
      <div 
        ref={containerRef}
        className={`relative ${className}`}
        style={{
          backgroundColor: isTransparent ? 'transparent' : undefined,
          ...(isFullscreen && isTransparent ? { background: 'transparent' } : {})
        }}
      >
        {showControls && (
          <div className={`${isFullscreen ? 'absolute top-4 right-4 z-50' : 'mb-4 flex justify-end gap-2'}`}>
            {enableTransparent && (
              <Button
                variant={isTransparent ? "default" : "outline"}
                size="sm"
                onClick={toggleTransparent}
                className="gap-2"
                data-testid="button-transparent-toggle"
                title={t('Common.actions.obsMode', 'OBS Mode (Ctrl+T)')}
              >
                {isTransparent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">OBS</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
              data-testid="button-fullscreen-toggle"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('Common.actions.exitFullscreen', 'Exit')}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('Common.actions.fullscreen', 'Fullscreen')}</span>
                </>
              )}
            </Button>
          </div>
        )}
        
        <div 
          ref={contentRef}
          className={`
            ${isFullscreen ? 'h-screen w-screen flex items-center justify-center' : ''}
            ${isTransparent ? 'bg-transparent' : isFullscreen ? 'bg-background' : ''}
          `}
          style={{
            ...(isFullscreen && isTransparent ? { background: 'transparent' } : {})
          }}
        >
          <div 
            style={{
              transform: isFullscreen ? `scale(${scale})` : 'none',
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </FullscreenContext.Provider>
  );
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current) return;
    try {
      await elementRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return {
    elementRef,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}

export default FullscreenWrapper;
