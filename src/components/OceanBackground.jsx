import { useState, useEffect, useRef } from 'react';

const OceanBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      if (isMobile) {
        // Try to play video on mobile after it can play
        video.play().catch(() => {
          console.log('Mobile video autoplay failed, using fallback');
          setShowFallback(true);
        });
      }
    };

    const handleError = () => {
      console.log('Video failed to load, using fallback');
      setShowFallback(true);
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Try to play on user interaction for mobile
    const playOnInteraction = () => {
      if (isMobile && video) {
        video.play().catch(() => {
          setShowFallback(true);
        });
      }
    };

    if (isMobile) {
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      document.addEventListener('click', playOnInteraction, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('click', playOnInteraction);
    };
  }, [isMobile]);

  const fallbackStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    background: "linear-gradient(180deg, #1a4d5c 0%, #0f2a35 50%, #061419 100%)",
    filter: "brightness(0.65) saturate(1.3) hue-rotate(-10deg)",
  };

  // Show fallback immediately on mobile if video fails or for very slow connections
  if (isMobile && showFallback) {
    return <div style={fallbackStyle} />;
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={!isMobile}
        muted
        loop
        playsInline
        preload={isMobile ? "metadata" : "auto"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "brightness(0.65) saturate(1.3) hue-rotate(-10deg)",
          background: "linear-gradient(180deg, #1a4d5c 0%, #0f2a35 50%, #061419 100%)",
        }}
      >
        <source src="/assets/ocean.mp4" type="video/mp4" />
      </video>
      
      {/* Always show fallback background behind video in case it doesn't load */}
      <div style={{
        ...fallbackStyle,
        zIndex: -1,
      }} />
    </>
  );
};

export default OceanBackground;