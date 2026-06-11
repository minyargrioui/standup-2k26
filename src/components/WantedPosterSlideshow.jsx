import { useState, useEffect, useRef, useCallback } from 'react';

export default function WantedPosterSlideshow() {
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const scrollPositionRef = useRef(0);

  const [speed, setSpeed] = useState(20);

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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      scrollPositionRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative', paddingInline: 'clamp(10px, 2vw, 30px)' }}>
      <div
        onClick={() => setIsPlaying(p => !p)}
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
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: 'clamp(6px, 2vw, 12px)',
            padding: 'clamp(5px, 1vw, 10px)',
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            position: 'relative',
            zIndex: 2,
            alignItems: 'center',
          }}
        >
          {infinitePosters.map((poster, index) => (
            <div
              key={`${poster.id}-${index}`}
              style={{
                flex: '0 0 auto',
                width: 'clamp(200px, 40vw, 320px)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (isPlaying) e.currentTarget.style.transform = 'scale(1.05)';
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