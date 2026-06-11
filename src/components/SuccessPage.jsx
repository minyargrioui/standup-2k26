import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const [textReady, setTextReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setTextReady(true), 500);
    // Disable page scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/assets/ocean2.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white',
          padding: '2rem',
          maxWidth: '800px',
          opacity: textReady ? 1 : 0,
          transform: textReady ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Pieces of Eight', serif",
            fontSize: 'clamp(1rem, 6vw, 4rem)',
            color: 'rgba(255, 240, 210, 0.9)',
            textShadow: '0 2px 18px rgba(0,0,0,0.45), 0 0 60px rgba(0,0,0,0.25)',
            marginBottom: '2rem',
            letterSpacing: '2px',
            lineHeight: 1.4,
          }}
        >
          The bottle has left the shore.
        </h1>
        <p
          style={{
            fontFamily: "'Pieces of Eight', serif",
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            color: 'rgba(255, 240, 210, 0.75)',
            textShadow: '0 2px 10px rgba(0,0,0,0.35)',
            letterSpacing: '1px',
            lineHeight: 1.6,
          }}
        >
          If the winds are favorable, it will reach the crew of Stand Up.
        </p>
      </div>

      {/* Logo in top right corner */}
      <img
        src="/assets/logo.png"
        alt="Stand Up 2K26"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 3,
          height: 'clamp(60px, 10vw, 100px)',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
