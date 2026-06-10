import { useState, useEffect } from 'react';

export default function Logo() {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Get all sections with numeric IDs
      const sections = document.querySelectorAll('[id]');
      const scrollPosition = window.scrollY + window.innerHeight / 2; // Middle of viewport
      
      let currentSectionId = 0;
      
      // Find which section we're currently viewing
      for (const section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = parseInt(section.id);
        
        // Check if section has a numeric ID and we're currently in it
        if (!isNaN(sectionId) && scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
          currentSectionId = sectionId;
          break;
        }
      }
      
      // Show logo if current section ID is 3 or higher
      setShowLogo(currentSectionId >= 3);
    };

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoStyle = {
    position: "fixed",
    top: 28,
    right: 28,
    zIndex: 100,
    transition: "opacity 0.4s ease-in-out",
    opacity: showLogo ? 1 : 0,
    pointerEvents: showLogo ? "auto" : "none", // Prevent clicking when hidden
  };

  return (
    <div style={logoStyle}>
      <img
        src="/assets/logo.png"
        alt="Stand Up 2K26"
        style={{
          width: 120,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))",
        }}
      />
    </div>
  );
}