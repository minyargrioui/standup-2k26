// src/components/IndividualRoom.jsx
import { useState, useEffect } from 'react';

export default function IndividualRoom({ isOpen, onClose, onConfirm }) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No room number needed - just confirm
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 22, 27, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
          padding: '20px',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        {/* Popup Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)',
            border: '2px solid #B7A98A',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(8,22,27,0.8)',
            animation: 'scaleIn 0.3s ease',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#B7A98A',
              fontSize: '28px',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              fontFamily: 'monospace',
            }}
            onMouseEnter={(e) => e.target.style.color = '#A89A7A'}
            onMouseLeave={(e) => e.target.style.color = '#B7A98A'}
          >
            ✕
          </button>

          {/* Icon */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '10px',
            opacity: 0.8,
          }}>
            <img src="/assets/indiv.png" alt="pirate ship" style={{ width: '48px', height: '48px' }} />
          </div>

          <h2 style={{
            textAlign: 'center',
            color: '#B7A98A',
            fontFamily: "'Pieces of Eight', serif",
            fontSize: '1.8rem',
            marginBottom: '10px',
            letterSpacing: '3px',
          }}>
            Confirm Individual Room
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#A89A7A',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.9rem',
            marginBottom: '25px',
            opacity: 0.8,
          }}>
            You are about to book an individual room.<br />
            Please confirm to proceed.
          </p>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 30px',
                background: 'transparent',
                color: '#B7A98A',
                border: '2px solid #B7A98A',
                borderRadius: '10px',
                fontSize: '16px',
                fontFamily: "'Pieces of Eight', serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(183, 169, 138, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 30px',
                background: '#17424A',
                color: '#B7A98A',
                border: '2px solid #B7A98A',
                borderRadius: '10px',
                fontSize: '16px',
                fontFamily: "'Pieces of Eight', serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#B7A98A';
                e.target.style.color = '#08161B';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#17424A';
                e.target.style.color = '#B7A98A';
              }}
            >
              ⚓ Confirm Booking
            </button>
          </div>

          {/* Decorative chain */}
          <div style={{
            marginTop: '25px',
            textAlign: 'center',
            color: 'rgba(183, 169, 138, 0.3)',
            fontSize: '14px',
            letterSpacing: '4px',
          }}>
            ⛓️ • • • ⛓️ • • • ⛓️
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
      `}</style>
    </>
  );
}