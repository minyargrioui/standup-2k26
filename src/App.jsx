import { useState, useEffect, lazy, Suspense } from 'react';
import OceanBackground from "./components/OceanBackground";
import Logo from "./components/Logo";
import Boat from "./components/Boat";
import TypewriterText from './components/TypewriterText';
import useIntersectionObserver from './hooks/useIntersectionObserver';

// Lazy load heavy components
const WantedPosterSlideshow = lazy(() => import('./components/WantedPosterSlideshow'));
const Sponsors = lazy(() => import('./components/Sponsors'));
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));

export default function App() {
  const [section2Ref, isSection2Visible] = useIntersectionObserver({ threshold: 0.3 });
  const [showImage, setShowImage] = useState(false);
  const [showAdditionalText, setShowAdditionalText] = useState(false);

  // Controls the full-screen dark overlay
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayDone, setOverlayDone] = useState(false);

  // Controls when section 1 content starts its entrance
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    // Start fading the overlay almost immediately
    const fadeTimer = setTimeout(() => setOverlayVisible(false), 200);

    // After overlay fade (1.5s transition), let content drift in
    const readyTimer = setTimeout(() => {
      setOverlayDone(true);
      setTimeout(() => setIntroReady(true), 100);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  // Background soundtrack - works on both mobile and desktop
  useEffect(() => {
    let audio = null;
    
    const initializeAudio = () => {
      try {
        audio = new Audio('/assets/pirate.m4a');
        audio.loop = true;
        audio.volume = 0.10;
        audio.preload = 'auto';
        
        // Audio event listeners
        const handleError = (error) => {
          console.log('Audio failed to load:', error);
        };
        
        audio.addEventListener('error', handleError);
        
        return audio;
      } catch (error) {
        console.log('Audio initialization failed:', error);
        return null;
      }
    };
    
    // Initialize audio
    audio = initializeAudio();
    
    // Handle user interaction to start audio
    const handleUserInteraction = async () => {
      if (!audio) return;
      
      try {
        // Create audio context if needed (for iOS Safari)
        if (window.AudioContext || window.webkitAudioContext) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!window.audioContext) {
            window.audioContext = new AudioContextClass();
          }
          if (window.audioContext.state === 'suspended') {
            await window.audioContext.resume();
          }
        }
        
        // Try to play immediately, don't wait for canplaythrough
        await audio.play();
        console.log('Audio started playing');
      } catch (err) {
        console.log('Audio play failed, retrying:', err.message);
        // If it fails, try again in a moment (file might still be loading)
        setTimeout(() => {
          audio.play().catch(() => console.log('Audio retry failed'));
        }, 500);
      }
    };
    
    // Listen for any user interaction
    const events = ['click', 'touchstart', 'touchend', 'keydown'];
    events.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { once: true });
    });

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio = null;
      }
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction);
      });
    };
  }, []);

  return (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── Dark overlay ── */}
      {!overlayDone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 9999,
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: overlayVisible ? 'all' : 'none',
          }}
        />
      )}

      <OceanBackground />
      <Logo />
      <Boat />

      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Section 1 ── */}
        <section
          id="1"
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem, 5vw, 2rem)',
          }}
        >
          <h1
            style={{
              color: 'rgba(255, 240, 210, 0.82)',
              fontSize: 'clamp(1.8rem, 6vw, 4rem)',
              textShadow: '0 2px 18px rgba(0,0,0,0.45), 0 0 60px rgba(0,0,0,0.25)',
              textAlign: 'center',
              fontWeight: '500',
              letterSpacing: '0.01em',
              display: 'inline-block',
              opacity: introReady ? 1 : 0,
              transform: introReady ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              maxWidth: '90vw',
              lineHeight: '1.4',
            }}
          >
            {introReady && (
              <TypewriterText
                lines={[
                  "The sea remembers every sailor who dares to cross it.",
                  "Now it's your turn to be remembered.",
                ]}
                speed={55}
                delayBetweenLines={400}
              />
            )}
          </h1>
        </section>

        {/* ── Section 2 ── */}
        <section
          id="2"
          ref={section2Ref}
          style={{
            height: '100vh',
            color: 'white',
            padding: 'clamp(1rem, 5vw, 2rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.5rem, 3vw, 1rem)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontFamily: "'Pieces of Eight', serif",
              fontWeight: 'normal',
              textAlign: 'center',
              color: 'var(--sand-light)',
              letterSpacing: 'clamp(1px, 2vw, 3px)',
              textTransform: 'uppercase',
            }}
          >
            <TypewriterText
              lines={['Welcome to']}
              speed={60}
              trigger={isSection2Visible}
              onComplete={() => {
                setTimeout(() => setShowImage(true), 600);
              }}
            />
          </h2>

          {showImage && (
            <div
              style={{
                animation: 'fadeInUp 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
                textAlign: 'center',
              }}
            >
              <img
                src="/assets/logo.png"
                alt="Event logo"
                style={{
                  width: 'clamp(300px, 80vw, 600px)',
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '0.01rem',
                }}
              />

              <div style={{ marginTop: '0rem' }}>
                <div
                  style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontFamily: "'Pieces of Eight', serif",
                    fontWeight: 'normal',
                    textAlign: 'center',
                    color: 'var(--sand-light)',
                    letterSpacing: 'clamp(1px, 2vw, 3px)',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                  }}
                >
                  <TypewriterText
                    lines={['26-27-28 JUNE', 'The sea is calling you.']}
                    speed={60}
                    trigger={showImage}
                    onComplete={() => setTimeout(() => setShowAdditionalText(true), 400)}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3 ── */}
        <section
          id="3"
          style={{
            minHeight: '100vh',
            color: 'white',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: "'Pieces of Eight', serif",
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                color: 'var(--sand-light)',
                opacity: 0.8,
              }}
            >
              The most wanted organizers of the seven seas
            </h2>
          </div>
          <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading posters...</div>}>
            <WantedPosterSlideshow />
          </Suspense>
        </section>

        {/* ── Section 3.5 - Sponsors ── */}
        <section
          id="3.5"
          style={{
            minHeight: '100vh',
            color: 'white',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: "'Pieces of Eight', serif",
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                color: 'var(--sand-light)',
                opacity: 0.8,
              }}
            >
              Those who fuel the voyage
            </h2>
          </div>
          <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading sponsors...</div>}>
            <Sponsors />
          </Suspense>
        </section>

        <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading registration...</div>}>
          <RegistrationForm />
        </Suspense>

      </div>
    </>
  );
}
