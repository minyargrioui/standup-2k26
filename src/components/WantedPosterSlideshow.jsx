import { useState, useEffect, useRef, useCallback } from 'react';

export default function WantedPosterSlideshow() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const scrollPositionRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const [speed, setSpeed] = useState(20);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const posters = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    image: `/assets/wanted${i + 1}.png`
  }));

  const infinitePosters = [...posters, ...posters, ...posters];

  const scroll = useCallback((timestamp) => {
    if (!animationRef.current) return;

    if (lastTimestampRef.current === 0) {
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(scroll);
      return;
    }

    const deltaTime = timestamp - lastTimestampRef.current;

    if (scrollContainerRef.current && isPlaying && !isDragging && !isMobile) {
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const pixelsToMove = (speed * deltaTime) / 1000;
      scrollPositionRef.current += pixelsToMove;
      container.scrollLeft = scrollPositionRef.current;

      if (scrollPositionRef.current >= maxScroll - 200) {
        scrollPositionRef.current = 100;
        container.scrollLeft = scrollPositionRef.current;
      }
    }

    lastTimestampRef.current = timestamp;
    animationRef.current = requestAnimationFrame(scroll);
  }, [isPlaying, speed, isDragging, isMobile]);

  useEffect(() => {
    lastTimestampRef.current = 0;
    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [scroll]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  }, []);

  const handleWheel = (e) => {
    if (scrollContainerRef.current && !isMobile) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative', paddingInline: isMobile ? 'clamp(5px, 1vw, 10px)' : 'clamp(10px, 2vw, 30px)' }}>
      <div
        onClick={() => !isMobile && setIsPlaying(p => !p)} // Only allow play/pause on desktop
        style={{
          backgroundImage: `url('/assets/wantedbg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '15px',
          padding: 'clamp(5px, 1.5vw, 12px)',
          minHeight: 'clamp(100px, 25vh, 200px)',
          position: 'relative',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
          cursor: isMobile ? 'default' : 'pointer',
          width: '100%',
        }}
      >
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: 'clamp(6px, 2vw, 12px)',
            padding: 'clamp(5px, 1vw, 10px)',
            scrollBehavior: isMobile ? 'smooth' : 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on iOS
            position: 'relative',
            zIndex: 2,
            alignItems: 'center',
            // Better touch scrolling for mobile
            ...(isMobile && {
              scrollSnapType: 'x mandatory',
              paddingBottom: '10px', // Space for scroll indicator
            }),
          }}
        >
          {infinitePosters.map((poster, index) => (
            <div
              key={`${poster.id}-${index}`}
              style={{
                flex: '0 0 auto',
                width: isMobile ? 'clamp(180px, 35vw, 280px)' : 'clamp(200px, 40vw, 320px)',
                transition: 'transform 0.3s ease',
                ...(isMobile && {
                  scrollSnapAlign: 'start',
                }),
              }}
              onMouseEnter={(e) => {
                if (isPlaying && !isMobile) e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if (!isMobile) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={poster.image}
                alt={`Wanted Poster ${poster.id}`}
                loading="lazy" // Lazy loading for performance
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px',
                  userSelect: 'none', // Prevent image selection on mobile
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none', // Prevent callout on iOS
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Mobile scroll indicator */}
        {isMobile && (
          <div style={{
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            ← Swipe to browse →
          </div>
        )}
      </div>
    </div>
  );
}