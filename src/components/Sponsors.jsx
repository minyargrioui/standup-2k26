import { useState, useEffect, useRef, useCallback } from 'react';

export default function Sponsors() {
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const scrollPositionRef = useRef(0);
  
  const [speed, setSpeed] = useState(50);
  
  // Array of 9 sponsor logos
  const sponsors = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    image: `/assets/logo${1}.png`
  }));

  // Duplicate sponsors for seamless infinite scroll
  const infiniteSponsors = [...sponsors, ...sponsors, ...sponsors];

  const scroll = useCallback((timestamp) => {
    if (!animationRef.current) return;
    
    if (lastTimestampRef.current === 0) {
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(scroll);
      return;
    }
    
    const deltaTime = timestamp - lastTimestampRef.current;
    
    if (scrollContainerRef.current && isPlaying) {
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
  }, [isPlaying, speed]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    lastTimestampRef.current = 0;
    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scroll]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  }, []);

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  return (
    <div
      onClick={togglePlayPause}
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Horizontal Scroll Container - No visible container */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: 'clamp(20px, 4vw, 40px)',
          padding: 'clamp(10px, 3vw, 20px) clamp(20px, 5vw, 40px)',
          scrollBehavior: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          zIndex: 2,
          alignItems: 'center',
        }}
        className="hide-scrollbar"
      >
        {infiniteSponsors.map((sponsor, index) => (
          <div
            key={`${sponsor.id}-${index}`}
            style={{
              flex: '0 0 auto',
              width: 'clamp(200px, 30vw, 350px)',
              height: 'clamp(200px, 30vw, 350px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (isPlaying) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={sponsor.image}
              alt={`Sponsor Logo ${sponsor.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
