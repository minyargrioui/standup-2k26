import { useState, useEffect } from 'react';

const OceanBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use lighter video or fallback on mobile for better performance
  return (
    <video
      autoPlay={!isMobile} // Disable autoplay on mobile to save bandwidth
      muted
      loop
      playsInline
      preload={isMobile ? "none" : "metadata"} // Don't preload on mobile
      poster="/assets/ocean-poster.jpg" // Poster image while loading
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
        filter: "brightness(0.65) saturate(1.3) hue-rotate(-10deg)",
        // Fallback gradient if video fails to load
        background: "linear-gradient(180deg, #1a4d5c 0%, #0f2a35 50%, #061419 100%)",
      }}
    >
      <source src={isMobile ? "/assets/ocean.mp4" : "/assets/ocean.mp4"} type="video/mp4" />
      {/* Fallback background */}
    </video>
  );
};

export default OceanBackground;