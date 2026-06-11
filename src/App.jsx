import { useState, useEffect, lazy, Suspense } from 'react';
import OceanBackground from "./components/OceanBackground";
import Logo from "./components/Logo";
import Boat from "./components/Boat";
import TypewriterText from './components/TypewriterText';
import useIntersectionObserver from './hooks/useIntersectionObserver';

const WantedPosterSlideshow = lazy(() => import('./components/WantedPosterSlideshow'));
const Sponsors = lazy(() => import('./components/Sponsors'));
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));

export default function App() {
  const [section2Ref, isSection2Visible] = useIntersectionObserver({ threshold: 0.3 });
  const [showImage, setShowImage] = useState(false);
  const [showAdditionalText, setShowAdditionalText] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(null);

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayDone, setOverlayDone] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);

  // Fade overlay in, then reveal audio prompt
  useEffect(() => {
    const fadeTimer = setTimeout(() => setOverlayVisible(false), 200);
    const promptTimer = setTimeout(() => setPromptVisible(true), 1400);
    return () => { clearTimeout(fadeTimer); clearTimeout(promptTimer); };
  }, []);

  // Once audio decision made, finish overlay and start intro
  useEffect(() => {
    if (audioEnabled === null) return;
    const readyTimer = setTimeout(() => {
      setOverlayDone(true);
      setTimeout(() => setIntroReady(true), 100);
    }, 600);
    return () => clearTimeout(readyTimer);
  }, [audioEnabled]);

  // Audio engine
  useEffect(() => {
    if (audioEnabled === null) return;
    let audio = null;
    let tried = false;

    const init = async () => {
      if (!audioEnabled) return;
      try {
        audio = new Audio('/assets/pirate.m4a');
        audio.loop = true;
        audio.volume = 0.10;
        audio.preload = 'auto';
        try { await audio.play(); tried = true; return; } catch (_) {}

        const tryPlay = async () => {
          if (tried || !audioEnabled) return;
          tried = true;
          try { await audio.play(); } catch (e) { console.log('Audio failed:', e.message); }
        };
        ['click','touchstart'].forEach(ev => document.addEventListener(ev, tryPlay, { once: true }));
      } catch (e) { console.log('Audio init failed:', e); }
    };

    init();

    const stop = () => { if (audio) { audio.pause(); audio.src = ''; audio = null; } };
    const onHide = () => { if (document.hidden && audio) audio.pause(); };

    ['beforeunload','unload','pagehide'].forEach(ev => window.addEventListener(ev, stop));
    document.addEventListener('visibilitychange', onHide);

    return () => {
      stop();
      ['beforeunload','unload','pagehide'].forEach(ev => window.removeEventListener(ev, stop));
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [audioEnabled]);

  const decide = (val) => {
    setPromptVisible(false);
    setTimeout(() => setAudioEnabled(val), 400);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes promptIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .audio-btn {
          background: none;
          border: none;
          color: rgba(255, 240, 210, 0.55);
          font-family: inherit;
          font-size: clamp(0.75rem, 2vw, 0.9rem);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.3rem 0.1rem;
          transition: color 0.3s ease, opacity 0.3s ease;
          position: relative;
        }
        .audio-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: rgba(255, 240, 210, 0.5);
          transition: width 0.35s ease;
        }
        .audio-btn:hover { color: rgba(255, 240, 210, 0.9); }
        .audio-btn:hover::after { width: 100%; }
      `}</style>

      {/* Dark overlay */}
      {!overlayDone && (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#000', zIndex: 9999,
          opacity: overlayVisible ? 1 : 0,
          transition: 'opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: overlayVisible ? 'all' : 'none',
        }} />
      )}

      {/* Audio prompt — minimal, floats over the ocean */}
      {audioEnabled === null && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(2.5rem, 8vh, 5rem)',
          pointerEvents: promptVisible ? 'all' : 'none',
        }}>
          <div style={{
            opacity: promptVisible ? 1 : 0,
            animation: promptVisible ? 'promptIn 1s ease both' : 'none',
            textAlign: 'center',
          }}>
            {/* Small icon */}
            <div style={{
              fontSize: '1.4rem',
              marginBottom: '0.9rem',
              opacity: 0.5,
            }}>♪</div>

            <p style={{
              color: 'rgba(255, 240, 210, 0.45)',
              fontSize: 'clamp(0.65rem, 1.8vw, 0.78rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem',
              fontWeight: '400',
            }}>
              Sail with music?
            </p>

            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <button className="audio-btn" onClick={() => decide(true)}>Aye</button>
              <span style={{ color: 'rgba(255,240,210,0.2)', fontSize: '0.6rem' }}>·</span>
              <button className="audio-btn" onClick={() => decide(false)}>Nay</button>
            </div>
          </div>
        </div>
      )}

      <OceanBackground />
      <Logo />
      <Boat />

      {/* Floating mute toggle */}
      {audioEnabled !== null && (
        <button
          onClick={() => setAudioEnabled(v => !v)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,240,210,0.2)',
            borderRadius: '50%',
            width: '44px', height: '44px',
            color: 'rgba(255,240,210,0.7)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '♪' : '♩'}
        </button>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {audioEnabled !== null && (
          <>
            {/* Section 1 */}
            <section id="1" style={{
              height: '100vh', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(1rem, 5vw, 2rem)',
            }}>
              <h1 style={{
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
              }}>
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

            {/* Section 2 */}
            <section id="2" ref={section2Ref} style={{
              height: '100vh', color: 'white',
              padding: 'clamp(1rem, 5vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(0.5rem, 3vw, 1rem)',
            }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontFamily: "'Pieces of Eight', serif",
                fontWeight: 'normal',
                textAlign: 'center',
                color: 'var(--sand-light)',
                letterSpacing: 'clamp(1px, 2vw, 3px)',
                textTransform: 'uppercase',
              }}>
                <TypewriterText
                  lines={['Welcome to']}
                  speed={60}
                  trigger={isSection2Visible}
                  onComplete={() => setTimeout(() => setShowImage(true), 600)}
                />
              </h2>

              {showImage && (
                <div style={{
                  animation: 'fadeInUp 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
                  textAlign: 'center',
                }}>
                  <img src="/assets/logo.png" alt="Event logo" style={{
                    width: 'clamp(300px, 80vw, 600px)',
                    height: 'auto', borderRadius: '8px',
                  }} />
                  <div style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontFamily: "'Pieces of Eight', serif",
                    fontWeight: 'normal', textAlign: 'center',
                    color: 'var(--sand-light)',
                    letterSpacing: 'clamp(1px, 2vw, 3px)',
                    textTransform: 'uppercase', opacity: 0.7,
                    marginTop: '0.5rem',
                  }}>
                    <TypewriterText
                      lines={['26-27-28 JUNE', 'The sea is calling you.']}
                      speed={60}
                      trigger={showImage}
                      onComplete={() => setTimeout(() => setShowAdditionalText(true), 400)}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Section 3 — Posters */}
            <section id="3" style={{
              minHeight: '100vh', color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Pieces of Eight', serif",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: 'var(--sand-light)', opacity: 0.8,
                }}>
                  The most wanted organizers of the seven seas
                </h2>
              </div>
              <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading posters...</div>}>
                <WantedPosterSlideshow />
              </Suspense>
            </section>

            {/* Section 3.5 — Sponsors */}
            <section id="3.5" style={{
              minHeight: '100vh', color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Pieces of Eight', serif",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: 'var(--sand-light)', opacity: 0.8,
                }}>
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
          </>
        )}
      </div>
    </>
  );
}