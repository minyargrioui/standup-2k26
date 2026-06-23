// src/components/BookingSuccessPopup.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingSuccessPopup({ isOpen, onClose, roomNumber }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
        navigate('/my-booking');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 22, 27, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)',
            border: '2px solid #B7A98A',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(8,22,27,0.8), 0 0 40px rgba(255,215,0,0.1)',
            animation: 'scaleIn 0.5s ease',
          }}
        >
          <div style={{ 
            textAlign: 'center', 
            fontSize: '64px', 
            marginBottom: '10px',
            animation: 'bounce 0.6s ease',
          }}>
            🎉
          </div>

          <h2 style={{
            textAlign: 'center',
            color: '#B7A98A',
            fontFamily: "'Pieces of Eight', serif",
            fontSize: '2rem',
            marginBottom: '10px',
            letterSpacing: '3px',
          }}>
            Booking Confirmed!
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#B7A98A',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1rem',
            marginBottom: '20px',
            opacity: 0.9,
          }}>
            Your booking has been successfully confirmed
          </p>

          <div style={{
            background: 'rgba(255,215,0,0.05)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 0',
            }}>
              <span style={{ color: '#4CAF50', fontFamily: "'Poppins', sans-serif", fontSize: '1.1rem' }}>
                ✅ Confirmed
              </span>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            color: '#A89A7A',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.8rem',
            opacity: 0.6,
          }}>
            Redirecting to your booking details...
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255,215,0,0.1)',
              borderTop: '3px solid #B7A98A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.9); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}