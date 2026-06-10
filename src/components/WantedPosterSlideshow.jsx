import { useState, useEffect, useRef, useCallback } from 'react';

export default function WantedPosterSlideshow() {
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const scrollPositionRef = useRef(0);
  
  // Speed in pixels per second
  const [speed, setSpeed] = useState(50);
  
  // Array of your 14 wanted poster images
  const posters = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    image: `/assets/wanted${i + 1}.png`
  }));

  // Duplicate posters for seamless infinite scroll
  const infinitePosters = [...posters, ...posters, ...posters];

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
      
      // Calculate pixels to move based on time elapsed
      const pixelsToMove = (speed * deltaTime) / 1000;
      scrollPositionRef.current += pixelsToMove;
      
      container.scrollLeft = scrollPositionRef.current;
      
      // Reset to beginning when reaching the end
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

  // Speed control functions
  const increaseSpeed = () => {
    setSpeed(prev => Math.min(prev + 10, 200));
  };

  const decreaseSpeed = () => {
    setSpeed(prev => Math.max(prev - 10, 10));
  };

  const resetSpeed = () => {
    setSpeed(50);
  };

  // Start/stop auto-scroll
  useEffect(() => {
    lastTimestampRef.current = 0;
    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scroll]);

  // Update scroll position reference when container changes
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

  // Convert speed to multiplier for display
  const speedMultiplier = (speed / 50).toFixed(1);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}
    >

      {/* Background Container with wantedbg.jpg */}
      <div
        onClick={togglePlayPause}
        style={{
          backgroundImage: `url('/assets/wantedbg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '15px',
          padding: '30px 20px',
          minHeight: '500px',
          position: 'relative',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
      >
        {/* Dark overlay for better contrast - OPTIONAL */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '15px',
            pointerEvents: 'none',
          }}
        />

    {/*
        
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 105, 20, 0.08) 2px,
              rgba(139, 105, 20, 0.08) 4px
            )`,
            pointerEvents: 'none',
            borderRadius: '15px',
          }}
        />
    */}

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: '20px',
            padding: '10px 20px',
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            position: 'relative',
            zIndex: 2,
          }}
          className="hide-scrollbar"
        >
          {infinitePosters.map((poster, index) => (
            <div
              key={`${poster.id}-${index}`}
              style={{
                flex: '0 0 auto',
                width: '900px',

                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (isPlaying) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={poster.image}
                alt={`Wanted Poster ${poster.id}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}