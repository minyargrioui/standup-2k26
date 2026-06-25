import { useEffect, useState } from 'react';

export default function SuccessPage({ fullName = "Brave Soul", registrationCode = '' }) {
  const [textReady, setTextReady] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setTextReady(true), 800);
    // Disable page scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
      
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
          background: 'linear-gradient(180deg, #1a4d5c 0%, #0f2a35 50%, #061419 100%)',
        }}
      >
      {/* Loading overlay - shows until video loads */}
      {!videoLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #1a4d5c 0%, #0f2a35 50%, #061419 100%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              color: 'rgba(255, 240, 210, 0.7)',
              fontFamily: "'Pieces of Eight', serif",
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              textAlign: 'center',
              animation: 'fadeIn 1s ease-in-out infinite alternate',
            }}
          >
            Preparing your voyage...
          </div>
        </div>
      )}

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        onCanPlay={() => setVideoLoaded(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
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
          maxWidth: '900px',
          opacity: textReady && videoLoaded ? 1 : 0,
          transform: textReady && videoLoaded ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 1.5s ease, transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Pieces of Eight', serif",
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            color: 'rgba(255, 240, 210, 0.95)',
            textShadow: '0 3px 24px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4)',
            marginBottom: '2.5rem',
            letterSpacing: '3px',
            lineHeight: 1.3,
          }}
        >
          Farewell, {fullName}!
        </h1>
        <p
          style={{
            fontFamily: "'Pieces of Eight', serif",
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            color: 'rgba(255, 240, 210, 0.85)',
            textShadow: '0 2px 15px rgba(0,0,0,0.6)',
            letterSpacing: '2px',
            lineHeight: 1.6,
          }}
        >
          Your bottle has left the shore.<br />
          If the winds are favorable, it will reach<br />
          the crew of Stand Up.
        </p>
        {registrationCode && (
          <p
            style={{
              marginTop: '2rem',
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              color: 'rgba(255, 215, 0, 0.95)',
              letterSpacing: '1px',
              lineHeight: 1.5,
            }}
          >
            Save your room access code:<br />
            <strong style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>{registrationCode}</strong>
          </p>
        )}
      </div>

    </div>
    </>
  );
}
