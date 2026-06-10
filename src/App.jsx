import { useState } from 'react';
import OceanBackground from "./components/OceanBackground";
import Logo from "./components/Logo"
import Boat from "./components/Boat"
import TypewriterText from './components/TypewriterText';
import useIntersectionObserver from './hooks/useIntersectionObserver';
import WantedPosterSlideshow from './components/WantedPosterSlideshow';

export default function App() {
  const [section2Ref, isSection2Visible] = useIntersectionObserver({ threshold: 0.3 });
  const [showImage, setShowImage] = useState(false);
  const [showAdditionalText, setShowAdditionalText] = useState(false);
  
  return (
    <>
      <OceanBackground />
      <Logo />
      <Boat />

      <div style={{ position: "relative", zIndex: 10 }}>
        
        {/* Section 1 */}
        <section
          id="1"
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: '60px',
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              textAlign: 'center',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            <TypewriterText 
              lines={[
                "The sea remembers every sailor who dares to cross it.",
                "Now it's your turn to be remembered."
              ]} 
              speed={60}
              delayBetweenLines={300}
            />
          </h1>
        </section>

        {/* Section 2 */}
        <section 
          id="2" 
          ref={section2Ref}
          style={{ 
            height: "100vh", 
            color: "white", 
            padding: "2rem", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            gap: "1rem"
          }}
        >
          <h2 style={{ 
            fontSize: "60px", 
            fontWeight: 'bold', 
            textAlign: "center", 
            color: 'var(--sand-light)' 
          }}>
            <TypewriterText 
              lines={["Welcome to"]} 
              speed={60}
              trigger={isSection2Visible}
              onComplete={() => {
                setTimeout(() => {
                  setShowImage(true);
                }, 800);
              }}
            />
          </h2>
          
          {showImage && (
            <div style={{ 
              animation: 'fadeInUp 1.2s ease-out',
              textAlign: 'center'
            }}>
              <img 
                src="/assets/logo.png" 
                alt="Description"
                style={{ 
                  width: '600px', 
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '0.01rem'
                }}
              />
              
              <div style={{ marginTop: '0rem' }}>
                <TypewriterText 
                  lines={["26-27-28 Juin"]}
                  speed={50}
                  trigger={showImage}
                  onComplete={() => setShowAdditionalText(true)}
                />
              </div>
            </div>
          )}
          
          {showAdditionalText && (
            <div style={{ 
              animation: 'fadeInUp 0.8s ease-out',
              fontSize: '1.5rem',
              marginTop: '1rem',
              color: 'var(--sand-dark)'
            }}>
              <TypewriterText 
                lines={["The sea is calling you."]}
                speed={50}
                trigger={showAdditionalText}
              />
            </div>
          )}
        </section>
        
        {/* Section 3 */}
        <section 
          id="3" 
          style={{ 
            minHeight: "100vh", 
            color: "white", 
            padding: "4rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '100px',
                height: '2px',
                background: 'var(--sand-light)',
                margin: '20px auto',
              }}
            />
            
            <h2
              style={{
                fontFamily: "'Pieces of Eight', serif",
                fontSize: '1.5rem',
                color: 'var(--sand-light)',
                opacity: 0.8,
              }}
            >
              The most wanted organizers of the seven seas
            </h2>
          </div>

          <WantedPosterSlideshow />
        </section>
        
        {/* Section 4 */}
        <section id="4" style={{ 
          height: "100vh", 
          color: "white", 
          padding: "2rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <h2 style={{ fontSize: "3rem", color: 'var(--sand-light)' }}>🎟️ TICKETS</h2>
        </section>
        
        {/* Section 5 */}
        <section id="5" style={{ 
          height: "100vh", 
          color: "white", 
          padding: "2rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <h2 style={{ fontSize: "3rem", color: 'var(--sand-light)' }}>📍 LOCATION</h2>
        </section>
      </div>
    </>
  );
}
