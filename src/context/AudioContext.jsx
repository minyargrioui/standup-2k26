// src/context/AudioContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [audioEnabled, setAudioEnabled] = useState(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRef = useRef(null);
  const triedRef = useRef(false);

  useEffect(() => {
    if (audioEnabled === null) return;
    
    let audio = null;
    let tried = false;

    const init = async () => {
      if (!audioEnabled) return;
      try {
        audio = new Audio('/assets/pirate.m4a');
        audio.loop = true;
        audio.volume = 0.4;
        audio.preload = 'auto';
        audioRef.current = audio;
        try { 
          await audio.play(); 
          tried = true;
          triedRef.current = true;
          setIsAudioReady(true);
          return; 
        } catch (_) {}

        const tryPlay = async () => {
          if (tried || !audioEnabled || !audioRef.current) return;
          tried = true;
          triedRef.current = true;
          try { 
            await audioRef.current.play(); 
            setIsAudioReady(true);
          } catch (e) { 
            console.log('Audio failed:', e.message); 
          }
        };
        ['click','touchstart'].forEach(ev => document.addEventListener(ev, tryPlay, { once: true }));
      } catch (e) { 
        console.log('Audio init failed:', e); 
      }
    };

    init();

    const stop = () => { 
      if (audioRef.current) { 
        audioRef.current.pause(); 
        audioRef.current.src = ''; 
        audioRef.current = null;
        setIsAudioReady(false);
      } 
    };
    
    const onHide = () => { 
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        setIsAudioReady(false);
      }
    };

    // Listen for registration submission to stop audio
    const stopAudioOnSubmit = () => {
      stop();
      setAudioEnabled(false);
    };
    window.addEventListener('registration-submitted', stopAudioOnSubmit);

    ['beforeunload','unload','pagehide'].forEach(ev => window.addEventListener(ev, stop));
    document.addEventListener('visibilitychange', onHide);

    return () => {
      stop();
      window.removeEventListener('registration-submitted', stopAudioOnSubmit);
      ['beforeunload','unload','pagehide'].forEach(ev => window.removeEventListener(ev, stop));
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [audioEnabled]);

  const toggleAudio = () => {
    if (audioEnabled === null) return;
    
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    
    if (newState && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Play failed:', e));
      setIsAudioReady(true);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioReady(false);
    }
  };

  return (
    <AudioContext.Provider value={{ 
      audioEnabled, 
      setAudioEnabled, 
      toggleAudio,
      isAudioReady,
      setIsAudioReady,
      audioRef
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}