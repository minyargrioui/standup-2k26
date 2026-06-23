// src/components/RoomTypePopup.jsx
import { useState, useEffect } from 'react';

export default function RoomTypePopup({ isOpen, onClose, onSelect }) {
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
    }
  }, [isOpen]);

  const handleSelect = (type) => {
    setSelectedType(type);
    setTimeout(() => {
      onSelect(type);
    }, 300);
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
            maxWidth: '550px',
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
            fontSize: '48px', 
            marginBottom: '10px',
            opacity: 0.8,
          }}>
            🏴‍☠️
          </div>

          <h2 style={{
            textAlign: 'center',
            color: '#B7A98A',
            fontFamily: "'Pieces of Eight', serif",
            fontSize: '2rem',
            marginBottom: '10px',
            letterSpacing: '3px',
          }}>
            Choose Your Quarters
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#A89A7A',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.9rem',
            marginBottom: '30px',
            opacity: 0.8,
          }}>
            Select the type of accommodation for your voyage
          </p>

          {/* Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}>
            {/* Individual Room Option */}
            <div
              onClick={() => handleSelect('individual')}
              onMouseEnter={() => setHoveredType('individual')}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                background: hoveredType === 'individual' 
                  ? 'rgba(183, 169, 138, 0.2)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedType === 'individual'
                  ? '3px solid #FFD700'
                  : hoveredType === 'individual'
                  ? '2px solid #B7A98A'
                  : '2px solid rgba(183, 169, 138, 0.3)',
                borderRadius: '12px',
                padding: '25px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: hoveredType === 'individual' ? 'translateY(-5px)' : 'translateY(0)',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <img src="/assets/indiv.png" alt="individual room" style={{ width: '40px', height: '40px' }} />
              </div>
              <h3 style={{
                color: '#B7A98A',
                fontFamily: "'Pieces of Eight', serif",
                fontSize: '1.2rem',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Individual Room
              </h3>
              <p style={{
                color: '#A89A7A',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.8rem',
                opacity: 0.7,
                margin: 0,
              }}>
                Private quarters for<br />one brave sailor
              </p>
            </div>

            {/* Shared Room Option */}
            <div
              onClick={() => handleSelect('shared')}
              onMouseEnter={() => setHoveredType('shared')}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                background: hoveredType === 'shared' 
                  ? 'rgba(183, 169, 138, 0.2)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedType === 'shared'
                  ? '3px solid #FFD700'
                  : hoveredType === 'shared'
                  ? '2px solid #B7A98A'
                  : '2px solid rgba(183, 169, 138, 0.3)',
                borderRadius: '12px',
                padding: '25px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: hoveredType === 'shared' ? 'translateY(-5px)' : 'translateY(0)',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <img src="/assets/shared.png" alt="shared room" style={{ width: '40px', height: '40px' }} />
              </div>
              <h3 style={{
                color: '#B7A98A',
                fontFamily: "'Pieces of Eight', serif",
                fontSize: '1.2rem',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Shared Room
              </h3>
              <p style={{
                color: '#A89A7A',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.8rem',
                opacity: 0.7,
                margin: 0,
              }}>
                Bunk with fellow<br />crew members
              </p>
            </div>
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