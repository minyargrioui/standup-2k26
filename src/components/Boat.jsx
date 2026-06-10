import { useState, useEffect, useRef, useCallback } from 'react';

export default function Boat() {
  const [boatPosition, setBoatPosition] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [maxTop, setMaxTop] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  
  // Refs for animation and particles
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastPositionRef = useRef(50);
  const lastTimestampRef = useRef(Date.now());
  const boatRef = useRef(null);
  const boatPositionRef = useRef(50);
  const speedRef = useRef(0);
  const isMovingRef = useRef(false);
  const lastScrollYRef = useRef(0);

  // Update window dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const newMaxTop = window.innerHeight - 120;
      setMaxTop(newMaxTop);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle scroll and calculate speed - OPTIMIZED
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      const newTop = 50 + scrollProgress * (maxTop - 50);
      
      // Calculate speed based on position change
      const positionDelta = Math.abs(newTop - lastPositionRef.current);
      const timeDelta = Math.min(Date.now() - lastTimestampRef.current, 100);
      const newSpeed = positionDelta / (timeDelta / 16.67);
      
      const currentSpeed = Math.min(newSpeed, 6);
      const moving = positionDelta > 0.05;

      // Determine scroll direction
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollYRef.current;
      setIsScrollingUp(scrollingUp);
      lastScrollYRef.current = currentScrollY;
      
      // Update refs immediately (no re-render)
      speedRef.current = currentSpeed;
      isMovingRef.current = moving;
      lastPositionRef.current = newTop;
      lastTimestampRef.current = Date.now();
      boatPositionRef.current = newTop;
      
      // Update state less frequently (only when needed for UI)
      setSpeed(currentSpeed);
      setIsMoving(moving);
      setBoatPosition(newTop);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
        speedRef.current = 0;
        setIsMoving(false);
        setSpeed(0);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [maxTop]);

  // Particle class for wake effect (unchanged)
  class WakeParticle {
    constructor(x, y, speed, angle) {
      this.x = x;
      this.y = y;
      this.life = 1;
      this.speed = speed;
      this.angle = angle;
      this.size = 2 + Math.random() * 4 * (0.5 + speed / 5);
      this.decay = 0.012 + Math.random() * 0.015;
      this.vx = -Math.cos(angle) * (0.8 + speed * 0.4);
      this.vy = Math.sin(angle) * (0.5 + speed * 0.3);
      this.opacity = 0.5 + Math.random() * 0.4;
      this.isDroplet = speed > 2 && Math.random() > 0.75;
      
      if (this.isDroplet) {
        this.size *= 0.7;
        this.vy -= 1.5;
        this.decay *= 1.3;
      }
    }
    
    update() {
      this.life -= this.decay;
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.isDroplet) {
        this.vy += 0.2;
      }
      
      return this.life > 0;
    }
    
    draw(ctx) {
      ctx.save();
      
      if (this.isDroplet) {
        ctx.globalAlpha = this.life * 0.5;
        ctx.fillStyle = `rgba(220, 240, 255, ${this.life * 0.6})`;
        ctx.shadowBlur = 2;
      } else {
        const intensity = Math.min(this.speed / 5, 0.8);
        const whiteIntensity = 0.5 + intensity * 0.4;
        ctx.globalAlpha = this.life * 0.7 * this.opacity;
        ctx.fillStyle = `rgba(255, 255, 255, ${whiteIntensity * this.life})`;
        ctx.shadowBlur = 3 + this.speed * 0.8;
      }
      
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      
      if (this.isDroplet) {
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      } else {
        ctx.ellipse(
          this.x, 
          this.y, 
          this.size * this.life * 1.5, 
          this.size * this.life * 0.8, 
          0, 
          0, 
          Math.PI * 2
        );
      }
      
      ctx.fill();
      ctx.restore();
    }
  }

  // Get boat center position - OPTIMIZED with refs
  const getBoatCenter = useCallback(() => {
    if (boatRef.current) {
      const rect = boatRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    // Fallback positioning using ref for smooth updates
    return {
      x: 28 + 60,
      y: boatPositionRef.current + 60
    };
  }, []);

  // Wake effect animation - OPTIMIZED with refs
  const animateWake = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use refs for real-time values without re-renders
    const currentIsMoving = isMovingRef.current;
    const currentSpeed = speedRef.current;
    
    // Only generate particles if moving AND speed is above threshold
    if (currentIsMoving && currentSpeed > 0.2) {
      const intensity = Math.min(currentSpeed / 5, 0.7);
      const particlesToAdd = Math.floor(2 + currentSpeed * 1.8 * intensity);
      
      const boatCenter = getBoatCenter();
      
      for (let i = 0; i < particlesToAdd; i++) {
        // V-shaped wake pattern
        const side = Math.random() > 0.5 ? 1 : -1;
        const spreadAngle = (Math.random() * Math.PI / 3) * side;
        const baseAngle = Math.PI / 1.6;
        
        const speedFactor = Math.min(currentSpeed / 6, 0.8);
        const angleVariation = (Math.random() - 0.5) * 0.4 * speedFactor;
        const angle = baseAngle + spreadAngle * (0.7 + speedFactor * 0.4) + angleVariation;
        
        // Position control - KEPT EXACTLY THE SAME
        const offsetX = -5 - Math.random() * 10;
        const offsetY = (Math.random() - 1) * 20 * (0.5 + currentSpeed / 4);
        
        const particle = new WakeParticle(
          boatCenter.x + offsetX,
          boatCenter.y + offsetY,
          currentSpeed,
          angle
        );
        
        particlesRef.current.push(particle);
      }
    }
    
    // Update and draw all particles (they will continue to fade out)
    particlesRef.current = particlesRef.current.filter(particle => {
      const isAlive = particle.update();
      if (isAlive) {
        particle.draw(ctx);
      }
      return isAlive;
    });
    
    // Limit particle count
    if (particlesRef.current.length > 600) {
      particlesRef.current = particlesRef.current.slice(-500);
    }
    
    animationRef.current = requestAnimationFrame(animateWake);
  }, [getBoatCenter]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    animateWake();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateWake]);
  
  // Calculate dynamic rotation based on scroll direction
  // When scrolling down: 90deg (original), when scrolling up: -90deg (180° turn)
  const boatRotation = isScrollingUp ? -90 : 90;

  return (
    <>
      {/* Wake Effect Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      
      {/* Ship Component - OPTIMIZED with will-change and GPU acceleration */}
      <div
        ref={boatRef}
        style={{
          position: "fixed",
          top: boatPosition,
          left: 28,
          zIndex: 5,
          transform: 'translateZ(0)', // Force GPU acceleration
          willChange: 'top', // Hint to browser for optimization
          transition: "top 0.016s linear", // Matches 60fps for smoother movement
        }}
      >
        <img
          src="/assets/boat.png"
          alt="Boat"
          style={{
            transform: `rotate(${boatRotation}deg) translateZ(0)`, // FIXED: Dynamic rotation
            width: 120,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))",
            willChange: 'transform', // Optimize transform animations
            transition: "transform 0.3s ease-out" // Smooth rotation transition
          }}
        />
      </div>
    </>
  );
}