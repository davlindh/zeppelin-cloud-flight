import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type { MediaContextValue, MediaPlayerState, MediaItem } from '@/types/media';
import { generateMediaId } from '@/utils/mediaHelpers';

type MediaAction =
  | { type: 'PLAY_MEDIA'; payload: MediaItem }
  | { type: 'PAUSE_MEDIA' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'STOP_MEDIA' }
  | { type: 'SEEK_TO'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'ADD_TO_QUEUE'; payload: MediaItem | MediaItem[] }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'NEXT_MEDIA' }
  | { type: 'PREVIOUS_MEDIA' }
  | { type: 'SHUFFLE_QUEUE' }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'CLOSE_PLAYER' };

const initialState: MediaPlayerState = {
  currentMedia: null,
  queue: [],
  isPlaying: false,
  isPaused: false,
  progress: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  isMinimized: true,
  playbackRate: 1,
};

const mediaReducer = (state: MediaPlayerState, action: MediaAction): MediaPlayerState => {
  switch (action.type) {
    case 'PLAY_MEDIA':
      return {
        ...state,
        currentMedia: action.payload,
        isPlaying: true,
        isPaused: false,
        progress: 0,
        isMinimized: false,
      };
    
    case 'PAUSE_MEDIA':
      return {
        ...state,
        isPlaying: false,
        isPaused: true,
      };
    
    case 'TOGGLE_PLAY':
      return {
        ...state,
        isPlaying: !state.isPlaying,
        isPaused: state.isPlaying,
      };
    
    case 'STOP_MEDIA':
      return {
        ...state,
        currentMedia: null,
        isPlaying: false,
        isPaused: false,
        progress: 0,
      };
    
    case 'SEEK_TO':
      return {
        ...state,
        progress: Math.max(0, Math.min(100, action.payload)),
      };
    
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: Math.max(0, Math.min(100, action.payload)),
        isMuted: action.payload === 0,
      };
    
    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
      };
    
    case 'SET_PLAYBACK_RATE':
      return {
        ...state,
        playbackRate: action.payload,
      };
    
    case 'ADD_TO_QUEUE': {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      const newQueue = [...state.queue];
      
      items.forEach(item => {
        const id = generateMediaId(item);
        if (!newQueue.find(queueItem => generateMediaId(queueItem) === id)) {
          newQueue.push(item);
        }
      });
      
      return {
        ...state,
        queue: newQueue,
      };
    }
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(item => generateMediaId(item) !== action.payload),
      };
    
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
      };
    
    case 'NEXT_MEDIA': {
      if (state.queue.length === 0) return state;
      
      const currentId = state.currentMedia ? generateMediaId(state.currentMedia) : null;
      const currentIndex = currentId 
        ? state.queue.findIndex(item => generateMediaId(item) === currentId)
        : -1;
      
      const nextIndex = currentIndex < state.queue.length - 1 ? currentIndex + 1 : 0;
      const nextMedia = state.queue[nextIndex];
      
      return {
        ...state,
        currentMedia: nextMedia,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      };
    }
    
    case 'PREVIOUS_MEDIA': {
      if (state.queue.length === 0) return state;
      
      const currentId = state.currentMedia ? generateMediaId(state.currentMedia) : null;
      const currentIndex = currentId 
        ? state.queue.findIndex(item => generateMediaId(item) === currentId)
        : -1;
      
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : state.queue.length - 1;
      const prevMedia = state.queue[prevIndex];
      
      return {
        ...state,
        currentMedia: prevMedia,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      };
    }
    
    case 'SHUFFLE_QUEUE': {
      const shuffled = [...state.queue].sort(() => Math.random() - 0.5);
      return {
        ...state,
        queue: shuffled,
      };
    }
    
    case 'TOGGLE_MINIMIZE':
      return {
        ...state,
        isMinimized: !state.isMinimized,
      };
    
    case 'CLOSE_PLAYER':
      return {
        ...initialState,
      };
    
    default:
      return state;
  }
};

const MediaContext = createContext<MediaContextValue | null>(null);

interface MediaProviderProps {
  children: React.ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(mediaReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const playMedia = useCallback((media: MediaItem) => {
    dispatch({ type: 'PLAY_MEDIA', payload: media });
  }, []);
  
  const pauseMedia = useCallback(() => {
    dispatch({ type: 'PAUSE_MEDIA' });
  }, []);
  
  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);
  
  const stopMedia = useCallback(() => {
    dispatch({ type: 'STOP_MEDIA' });
  }, []);
  
  const seekTo = useCallback((position: number) => {
    dispatch({ type: 'SEEK_TO', payload: position });
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);
  
  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);
  
  const setPlaybackRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
  }, []);
  
  const addToQueue = useCallback((media: MediaItem | MediaItem[]) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: media });
  }, []);
  
  const removeFromQueue = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id });
  }, []);
  
  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);
  
  const nextMedia = useCallback(() => {
    dispatch({ type: 'NEXT_MEDIA' });
  }, []);
  
  const previousMedia = useCallback(() => {
    dispatch({ type: 'PREVIOUS_MEDIA' });
  }, []);
  
  const shuffleQueue = useCallback(() => {
    dispatch({ type: 'SHUFFLE_QUEUE' });
  }, []);
  
  const toggleMinimize = useCallback(() => {
    dispatch({ type: 'TOGGLE_MINIMIZE' });
  }, []);
  
  const closePlayer = useCallback(() => {
    dispatch({ type: 'CLOSE_PLAYER' });
  }, []);

  const value: MediaContextValue = {
    ...state,
    playMedia,
    pauseMedia,
    togglePlay,
    stopMedia,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    addToQueue,
    removeFromQueue,
    clearQueue,
    nextMedia,
    previousMedia,
    shuffleQueue,
    toggleMinimize,
    closePlayer,
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
      {/* Hidden audio/video elements for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      <video ref={videoRef} style={{ display: 'none' }} />
    </MediaContext.Provider>
  );
};

export const useMediaPlayer = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaProvider');
  }
  return context;
};