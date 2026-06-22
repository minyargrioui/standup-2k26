import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioControl from './AudioControl';
import OceanBackground from './OceanBackground';

export default function IndivBookingPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
  });

  return (
    <>
      {/* Background - Custom background for booking page */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(135deg, #08161B 0%, #17424A 50%, #0a2a35 100%)',
        }}
      >
        <img src="/assets/indiv-bg.jpg" alt="Booking Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Logo */}
      <div
        style={{
          position: "fixed",
          top: 28,
          right: 28,
          zIndex: 100,
        }}
      >
        <img
          src="/assets/logo.png"
          alt="Stand Up 2K26"
          style={{
            width: 120,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))",
          }}
        />
      </div>

      {/* Audio Control */}
      <AudioControl />

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 100,
          background: 'var(--primary-teal)',
          color: 'var(--sand-light)',
          border: '2px solid var(--sand-light)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: "'Pieces of Eight', serif",
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--sand-light)';
          e.target.style.color = 'var(--dark-bg)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--primary-teal)';
          e.target.style.color = 'var(--sand-light)';
        }}
      >
        ← Back
      </button>

      {/* Main Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ 
          maxWidth: '600px', 
          width: '100%',
          paddingTop: '60px',
        }}>
          {/* Booking Card */}
          <div style={{
            background: 'rgba(8, 22, 27, 0.9)',
            border: '2px solid #B7A98A',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.05)',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                🏴‍☠️
              </div>
              <h1 style={{
                color: '#B7A98A',
                fontFamily: "'Pieces of Eight', serif",
                fontSize: '2.5rem',
                letterSpacing: '3px',
                marginBottom: '10px',
              }}>
                Booking Confirmed!
              </h1>
              <p style={{
                color: '#B7A98A',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '1rem',
                opacity: 0.8,
              }}>
                Your individual room has been reserved
              </p>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,215,0,0.2)',
              paddingTop: '20px',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
              }}>
                <div>
                  <p style={{ color: '#A89A7A', fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', marginBottom: '5px' }}>
                    Passenger Name
                  </p>
                  <p style={{ color: '#B7A98A', fontFamily: "'Pieces of Eight', serif", fontSize: '1.5rem' }}>
                    {userInfo.name}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#A89A7A', fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', marginBottom: '5px' }}>
                    Status
                  </p>
                  <p style={{ color: '#4CAF50', fontFamily: "'Poppins', sans-serif", fontSize: '1rem' }}>
                    ✅ Confirmed
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.1)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '25px',
            }}>
              <p style={{
                color: '#B7A98A',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.85rem',
                textAlign: 'center',
                opacity: 0.8,
              }}>
                ⚓ Your quarters are ready, captain!
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '24px 72px',
                  background: '#B7A98A',
                  color: '#08161B',
                  border: '2px solid #B7A98A',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Pieces of Eight', serif",
                  fontSize: '24px',
                  transition: 'all 0.3s ease',
                  letterSpacing: '1px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#08161B';
                  e.target.style.color = '#B7A98A';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#B7A98A';
                  e.target.style.color = '#08161B';
                }}
              >
                ⚓ Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}