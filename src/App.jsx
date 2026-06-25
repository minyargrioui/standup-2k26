// src/App.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAudio } from './context/AudioContext';

import OceanBackground from "./components/OceanBackground";
import Logo from "./components/Logo";
import Boat from "./components/Boat";
import TypewriterText from './components/TypewriterText';
import useIntersectionObserver from './hooks/useIntersectionObserver';
import SharedRoomDispatching from './components/SharedRoomDispatching';
import AdminRoomDispatching from './components/AdminRoomDispatching';
import RoomAccessSystem from './components/RoomAccessSystem';
import RoomInterface from './components/RoomInterface';
import AudioControl from './components/AudioControl';
import AudioPrompt from './components/AudioPrompt';
import PasswordPopup from './components/PasswordPopup';
import RoomTypePopup from './components/RoomTypePopup';
import IndividualRoom from './components/IndividualRoom';
import BookingSuccessPopup from './components/BookingSuccessPopup';
import IndivBookingPage from './components/IndivBookingPage';

const WantedPosterSlideshow = lazy(() => import('./components/WantedPosterSlideshow'));
const Sponsors = lazy(() => import('./components/Sponsors'));
const RegistrationForm = lazy(() => import('./components/RegistrationForm'));

// Main page component
function MainPage() {
  const [section2Ref, isSection2Visible] = useIntersectionObserver({ threshold: 0.3 });
  const [showImage, setShowImage] = useState(false);
  const [showAdditionalText, setShowAdditionalText] = useState(false);
  const { audioEnabled } = useAudio();
  const navigate = useNavigate();

  const [overlayDone, setOverlayDone] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showRoomTypePopup, setShowRoomTypePopup] = useState(false);
  const [showIndividualConfirm, setShowIndividualConfirm] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookedRoomNumber, setBookedRoomNumber] = useState('');

  // Once audio decision made, finish overlay and start intro
  useEffect(() => {
    if (audioEnabled === null) return;
    const readyTimer = setTimeout(() => {
      setOverlayDone(true);
      setTimeout(() => setIntroReady(true), 100);
    }, 600);
    return () => clearTimeout(readyTimer);
  }, [audioEnabled]);

  // Handle room dispatching button click
  const handleRoomDispatchingClick = () => {
    setShowPasswordPopup(true);
  };

  // Handle successful password entry with access level
  const handlePasswordSuccess = (accessLevel) => {
    setShowPasswordPopup(false);
    
    // Check if admin access
    if (accessLevel === 'admin') {
      // Direct admin access - bypass room type selection
      navigate('/room-dispatching/admin');
    } else {
      // Regular user - show room type selection or direct to new room access
      navigate('/room-access');
    }
  };

  // Handle room type selection
  const handleRoomTypeSelect = (type) => {
    setShowRoomTypePopup(false);
    if (type === 'shared') {
      navigate('/room-dispatching/shared');
    } else if (type === 'individual') {
      setShowIndividualConfirm(true);
    }
  };

  // Handle individual room confirmation
  const handleIndividualConfirm = () => {
    setShowIndividualConfirm(false);
    // Generate a room number
    const roomNumber = `RM-${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`;
    setBookedRoomNumber(roomNumber);
    // Show success popup
    setShowBookingSuccess(true);
  };

  // Close booking success and navigate
  const handleBookingSuccessClose = () => {
    setShowBookingSuccess(false);
    navigate('/my-booking');
  };

  return (
    <>
      {/* Audio Prompt - only shows when audio hasn't been decided */}
      {audioEnabled === null && (
        <AudioPrompt onComplete={() => setOverlayDone(true)} />
      )}

      <OceanBackground />
      <Logo />
      <Boat />

      {/* Audio Control - shows on all pages after audio is decided */}
      <AudioControl />

      {/* Password Popup */}
      <PasswordPopup
        isOpen={showPasswordPopup}
        onClose={() => setShowPasswordPopup(false)}
        onSuccess={handlePasswordSuccess}
        title="Room Access"
      />

      {/* Room Type Popup */}
      <RoomTypePopup
        isOpen={showRoomTypePopup}
        onClose={() => setShowRoomTypePopup(false)}
        onSelect={handleRoomTypeSelect}
      />

      {/* Individual Room Confirmation */}
      <IndividualRoom
        isOpen={showIndividualConfirm}
        onClose={() => setShowIndividualConfirm(false)}
        onConfirm={handleIndividualConfirm}
      />

      {/* Booking Success Popup */}
      <BookingSuccessPopup
        isOpen={showBookingSuccess}
        onClose={handleBookingSuccessClose}
        roomNumber={bookedRoomNumber}
      />

      {/* Room Dispatching Button - NOW VISIBLE AND PROMINENT */}
      {true && (
        <button
        onClick={handleRoomDispatchingClick}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 150,
          background: 'linear-gradient(135deg, #F7E9B8 0%, #E6D18C 100%)',
          color: '#08161B',
          border: '3px solid #08161B',
          padding: '18px 30px',
          borderRadius: '15px',
          cursor: 'pointer',
          fontFamily: "'Pieces of Eight', serif",
          fontSize: '18px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(247, 233, 184, 0.35), 0 4px 12px rgba(0,0,0,0.3)',
          animation: 'pulse 2s infinite',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #08161B 0%, #17424A 100%)';
          e.target.style.color = '#F7E9B8';
          e.target.style.transform = 'scale(1.1) translateY(-3px)';
          e.target.style.boxShadow = '0 12px 35px rgba(247, 233, 184, 0.45), 0 8px 20px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #F7E9B8 0%, #E6D18C 100%)';
          e.target.style.color = '#08161B';
          e.target.style.transform = 'scale(1) translateY(0px)';
          e.target.style.boxShadow = '0 8px 25px rgba(247, 233, 184, 0.35), 0 4px 12px rgba(0,0,0,0.3)';
        }}
      >
        Room Dispatching
      </button>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {audioEnabled !== null && (
          <>
            {/* Section 1 */}
            <section id="1" style={{
              height: '100vh', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(1rem, 5vw, 2rem)',
            }}>
              <h1 style={{
                color: 'rgba(255, 240, 210, 0.82)',
                fontSize: 'clamp(1.8rem, 6vw, 4rem)',
                textShadow: '0 2px 18px rgba(0,0,0,0.45), 0 0 60px rgba(0,0,0,0.25)',
                textAlign: 'center',
                fontWeight: '500',
                letterSpacing: '0.01em',
                display: 'inline-block',
                opacity: introReady ? 1 : 0,
                transform: introReady ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                maxWidth: '90vw',
                lineHeight: '1.4',
              }}>
                {introReady && (
                  <TypewriterText
                    lines={[
                      "The sea remembers every sailor who dares to cross it.",
                      "Now it's your turn to be remembered.",
                    ]}
                    speed={55}
                    delayBetweenLines={400}
                  />
                )}
              </h1>
            </section>

            {/* Section 2 */}
            <section id="2" ref={section2Ref} style={{
              height: '100vh', color: 'white',
              padding: 'clamp(1rem, 5vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(0.5rem, 3vw, 1rem)',
            }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontFamily: "'Pieces of Eight', serif",
                fontWeight: 'normal',
                textAlign: 'center',
                color: 'var(--sand-light)',
                letterSpacing: 'clamp(1px, 2vw, 3px)',
                textTransform: 'uppercase',
              }}>
                <TypewriterText
                  lines={['Welcome to']}
                  speed={60}
                  trigger={isSection2Visible}
                  onComplete={() => setTimeout(() => setShowImage(true), 600)}
                />
              </h2>

              {showImage && (
                <div style={{
                  animation: 'fadeInUp 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
                  textAlign: 'center',
                }}>
                  <img src="/assets/logo.png" alt="Event logo" style={{
                    width: 'clamp(300px, 80vw, 600px)',
                    height: 'auto', borderRadius: '8px',
                  }} />
                  <div style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontFamily: "'Pieces of Eight', serif",
                    fontWeight: 'normal', textAlign: 'center',
                    color: 'var(--sand-light)',
                    letterSpacing: 'clamp(1px, 2vw, 3px)',
                    textTransform: 'uppercase', opacity: 0.7,
                    marginTop: '0.5rem',
                  }}>
                    <TypewriterText
                      lines={['26-27-28 JUNE', 'The sea is calling you.']}
                      speed={60}
                      trigger={showImage}
                      onComplete={() => setTimeout(() => setShowAdditionalText(true), 400)}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Section 3 — Posters */}
            <section id="3" style={{
              minHeight: '100vh', color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Pieces of Eight', serif",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: 'var(--sand-light)', opacity: 0.8,
                }}>
                  The most wanted organizers of the seven seas
                </h2>
              </div>
              <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading posters...</div>}>
                <WantedPosterSlideshow />
              </Suspense>
            </section>

            {/* Section 3.5 — Sponsors */}
            <section id="3.5" style={{
              minHeight: '100vh', color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Pieces of Eight', serif",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: 'var(--sand-light)', opacity: 0.8,
                }}>
                  Those who fuel the voyage
                </h2>
              </div>
              <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading sponsors...</div>}>
                <Sponsors />
              </Suspense>
            </section>

            <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading registration...</div>}>
              <RegistrationForm />
            </Suspense>
          </>
        )}
      </div>
    </>
  );
}

// Main App component with routes
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/room-dispatching/shared" element={<SharedRoomDispatching />} />
      <Route path="/room-dispatching/admin" element={<AdminRoomDispatching />} />
      <Route path="/room-access" element={<RoomAccessSystem />} />
      <Route path="/room-interface" element={<RoomInterface />} />
      <Route path="/my-booking" element={<IndivBookingPage />} />
    </Routes>
  );
}
