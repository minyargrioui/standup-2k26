// src/components/AudioPrompt.jsx
import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';

export default function AudioPrompt({ onComplete }) {
  const { setAudioEnabled } = useAudio();
  const [promptVisible, setPromptVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setOverlayVisible(false), 200);
    const promptTimer = setTimeout(() => setPromptVisible(true), 1400);
    return () => { clearTimeout(fadeTimer); clearTimeout(promptTimer); };
  }, []);

  const decide = (val) => {
    setPromptVisible(false);
    setTimeout(() => {
      setAudioEnabled(val);
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <>
      {/* Dark overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: '#000', zIndex: 9999,
        opacity: overlayVisible ? 1 : 0,
        transition: 'opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: overlayVisible ? 'all' : 'none',
      }} />

      {/* Audio prompt */}
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 'clamp(2.5rem, 8vh, 5rem)',
        pointerEvents: promptVisible ? 'all' : 'none',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          opacity: promptVisible ? 1 : 0,
          animation: promptVisible ? 'promptIn 1s ease both' : 'none',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '1.4rem',
            marginBottom: '0.9rem',
            opacity: 0.5,
          }}>♪</div>

          <p style={{
            color: 'rgba(255, 240, 210, 0.95)',
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
            fontWeight: '400',
            textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)',
          }}>
            Ahoy there, brave soul! The winds carry tales of adventure,<br />
            and every voyage needs its rhythm.<br /><br />
            Shall the ship's songs accompany your journey
            with the ancient songs of the seven seas?
          </p>

          <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <button className="audio-btn" onClick={() => decide(true)}>Aye</button>
            <span style={{ color: 'rgba(255,240,210,0.2)', fontSize: '0.6rem' }}>·</span>
            <button className="audio-btn" onClick={() => decide(false)}>Nay</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes promptIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .audio-btn {
          background: none;
          border: none;
          color: rgba(255, 240, 210, 0.85);
          font-family: inherit;
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.5rem 1rem;
          transition: color 0.3s ease, opacity 0.3s ease;
          position: relative;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
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
    </>
  );
}