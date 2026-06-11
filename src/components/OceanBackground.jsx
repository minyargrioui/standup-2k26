import { useState, useEffect, useRef } from 'react';

const OceanBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Try to play video on mobile after user interaction
    const playVideo = () => {
      if (videoRef.current && isMobile) {
        videoRef.current.play().catch(err => {
          console.log('Video autoplay failed on mobile:', err);
        });
      }
    };

    // Add event listeners for user interaction on mobile
    if (isMobile) {
      document.addEventListener('touchstart', playVideo, { once: true });
      document.addEventListener('click', playVideo, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', playVideo);
        document.removeEventListener('click', playVideo);
      };
    }
  }, [isMobile]);

  return (
    <video
      ref={videoRef}
      autoPlay={!isMobile} // Disable autoplay on mobile initially
      muted
      loop
      playsInline
      preload={isMobile ? "auto" : "metadata"} // Load video on mobile
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