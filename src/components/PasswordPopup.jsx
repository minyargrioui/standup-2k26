// src/components/PasswordPopup.jsx
import { useState, useEffect, useRef } from 'react';

export default function PasswordPopup({ isOpen, onClose, onSuccess, title = "Enter Access Code" }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter an access code');
      return;
    }

    setIsLoading(true);
    setError('');

    // For now, just simulate validation
    // Later: Replace with actual database check
    setTimeout(() => {
      setIsLoading(false);
      
      // TEMPORARY: Accept any non-empty password for testing
      // Replace this with actual validation logic
      if (password.trim().length > 0) {
        // Success - close popup and navigate
        onSuccess();
        onClose();
      } else {
        setError('Invalid access code. Please try again.');
      }
    }, 800);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 22, 27, 0.85)', // --dark-bg with opacity
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
          padding: '20px',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleClose();
        }}
      >
        {/* Popup Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)', // --dark-bg to --primary-teal
            border: '2px solid #B7A98A', // --sand-light
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
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#B7A98A', // --sand-light
              fontSize: '28px',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              fontFamily: 'monospace',
            }}
            onMouseEnter={(e) => e.target.style.color = '#A89A7A'} // --sand-dark
            onMouseLeave={(e) => e.target.style.color = '#B7A98A'} // --sand-light
          >
            ✕
          </button>

          {/* Skull icon */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '10px',
            opacity: 0.8,
          }}>
            <img src="/assets/key.png" alt="key" style={{ width: '56px', height: '56px' }} />
          </div>

          <h2 style={{
            textAlign: 'center',
            color: '#B7A98A', // --sand-light
            fontFamily: "'Pieces of Eight', serif",
            fontSize: '2rem',
            marginBottom: '10px',
            letterSpacing: '3px',
          }}>
            {title}
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#A89A7A', // --sand-dark
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.9rem',
            marginBottom: '25px',
            opacity: 0.8,
          }}>
            Speak the secret password to enter the captain's quarters
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter access code..."
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(8, 22, 27, 0.6)', // --dark-bg with opacity
                  border: error ? '2px solid #ff4444' : '2px solid #B7A98A', // --sand-light
                  borderRadius: '10px',
                  color: '#B7A98A', // --sand-light
                  fontSize: '16px',
                  fontFamily: "'Poppins', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: error ? '0 0 20px rgba(255,68,68,0.2)' : 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#A89A7A'; // --sand-dark
                  e.target.style.boxShadow = '0 0 20px rgba(183, 169, 138, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ff4444' : '#B7A98A'; // --sand-light
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                autoComplete="off"
              />
              {error && (
                <p style={{
                  color: '#ff4444',
                  fontSize: '0.85rem',
                  marginTop: '8px',
                  fontFamily: "'Poppins', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? 'rgba(23, 66, 74, 0.5)' : '#17424A', // --primary-teal
                color: '#B7A98A', // --sand-light
                border: '2px solid #B7A98A', // --sand-light
                borderRadius: '10px',
                fontSize: '18px',
                fontFamily: "'Pieces of Eight', serif",
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '2px',
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#B7A98A'; // --sand-light
                  e.target.style.color = '#08161B'; // --dark-bg
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#17424A'; // --primary-teal
                  e.target.style.color = '#B7A98A'; // --sand-light
                }
              }}
            >
              {isLoading ? '🔐 Verifying...' : <><img src="/assets/pirate-ship.png" alt="pirate ship" style={{ width: '30px', height: '30px', marginRight: '6px', verticalAlign: 'middle' }} /> Board Ship</> }
            </button>
          </form>
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