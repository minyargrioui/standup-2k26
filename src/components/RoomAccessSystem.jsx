// src/components/RoomAccessSystem.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDelegateMembership,
  createRoom,
  joinRoomByCode,
} from '../services/roomService';
import OceanBackground from './OceanBackground';
import AudioControl from './AudioControl';

const VINTAGE_YELLOW = '#F3E6B3';
const VINTAGE_YELLOW_DEEP = '#D9C477';

const inputStyle = {
  width: '100%',
  padding: '15px',
  borderRadius: '10px',
  border: `2px solid ${VINTAGE_YELLOW}`,
  background: 'rgba(255,255,255,0.1)',
  color: '#B7A98A',
  fontFamily: "'Poppins', sans-serif",
  fontSize: '16px',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  color: VINTAGE_YELLOW,
  marginBottom: '10px',
  fontSize: '1rem',
  fontWeight: 'bold',
};

function getDelegateGender(delegate) {
  const gender = String(delegate?.gender || '').trim().toUpperCase();
  if (gender === 'M' || gender === 'MALE') return 'M';
  if (gender === 'F' || gender === 'FEMALE') return 'F';
  return '';
}

function storeRoomAccess({ delegate, gender, roomData, membership }) {
  sessionStorage.setItem('roomAccess', JSON.stringify({
    registrationId: delegate.id,
    userName: delegate.nickname || delegate.full_name,
    gender,
    roomData,
    membership,
    accessTime: new Date().toISOString(),
  }));
}

export default function RoomAccessSystem() {
  const navigate = useNavigate();
  const [step, setStep] = useState('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [delegate, setDelegate] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('verifiedDelegate') || 'null');
    } catch {
      return null;
    }
  });
  const [roomCode, setRoomCode] = useState('');
  const [roomType, setRoomType] = useState('');

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const finishRoomAccess = (
    roomData,
    membership = null,
    activeDelegate = delegate,
    activeGender = getDelegateGender(delegate),
    { immediate = false } = {},
  ) => {
    if (!activeDelegate) return;
    storeRoomAccess({
      delegate: activeDelegate,
      gender: activeGender || membership?.gender || getDelegateGender(activeDelegate),
      roomData,
      membership,
    });

    if (immediate) {
      navigate('/room-interface', { replace: true });
      return;
    }

    setSuccess('Access granted! Redirecting to your quarters...');
    setTimeout(() => navigate('/room-interface', { replace: true }), 1500);
  };

  useEffect(() => {
    if (!delegate) {
      navigate('/');
      return;
    }

    const savedAccess = sessionStorage.getItem('roomAccess');
    if (savedAccess) {
      navigate('/room-interface', { replace: true });
      return;
    }

    if (step !== 'choose') return;

    let cancelled = false;

    async function checkExistingMembership() {
      setLoading(true);
      resetMessages();

      try {
        const membershipResult = await getDelegateMembership(delegate.id);
        if (cancelled) return;

        if (!membershipResult.success) {
          setError(membershipResult.error);
          return;
        }

        if (membershipResult.membership?.room) {
          finishRoomAccess(
            membershipResult.membership.room,
            membershipResult.membership,
            delegate,
            membershipResult.membership.gender,
            { immediate: true },
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Membership verification error:', err);
          setError('Could not check existing room assignment.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkExistingMembership();

    return () => {
      cancelled = true;
    };
  }, [delegate, step]);

  const handleJoinRoom = async (event) => {
    event.preventDefault();
    resetMessages();

    const delegateGender = getDelegateGender(delegate);

    if (!delegateGender) {
      setError('Your registration does not have a saved gender. Please contact support.');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter the room code.');
      return;
    }

    setLoading(true);
    try {
      const result = await joinRoomByCode({
        registrationId: delegate.id,
        userName: delegate.nickname || delegate.full_name,
        gender: delegateGender,
        roomCode,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      finishRoomAccess(result.roomData, result.roomData.members?.[0], delegate, delegateGender);
    } catch (err) {
      console.error('Join room error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    resetMessages();

    const delegateGender = getDelegateGender(delegate);

    if (!delegateGender) {
      setError('Your registration does not have a saved gender. Please contact support.');
      return;
    }

    if (!roomType) {
      setError('Please select a room type.');
      return;
    }

    setLoading(true);
    try {
      const result = await createRoom({
        registrationId: delegate.id,
        userName: delegate.nickname || delegate.full_name,
        gender: delegateGender,
        roomType,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(`Room created! Share this code with your crew: ${result.roomData.room_code}`);
      finishRoomAccess(result.roomData, result.roomData.members?.[0], delegate, delegateGender);
    } catch (err) {
      console.error('Create room error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    resetMessages();
    if (step === 'choose') {
      sessionStorage.removeItem('verifiedDelegate');
      setDelegate(null);
      navigate('/');
      return;
    }
    if (step === 'join' || step === 'create') {
      setStep('choose');
      setRoomCode('');
      setRoomType('');
    }
  };

  if (!delegate) return null;

  return (
    <>
      <OceanBackground />

      <div className="room-page-logo" style={{ position: 'fixed', top: 28, right: 28, zIndex: 100 }}>
        <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }} />
      </div>

      <AudioControl />

      <button
        className="room-top-action"
        onClick={goBack}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 100,
          background: VINTAGE_YELLOW, color: '#08161B',
          border: '3px solid #08161B', padding: '12px 24px', borderRadius: '12px',
          cursor: 'pointer', fontFamily: "'Pieces of Eight', serif", fontSize: '18px',
          fontWeight: 'bold', textTransform: 'uppercase',
        }}
      >
        Back to main page
      </button>

      {error && (
        <div className="room-status-alert" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 59, 48, 0.9)', color: 'white', padding: '15px 25px',
          borderRadius: '10px', zIndex: 200, fontWeight: 'bold', maxWidth: '90%', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div className="room-status-alert" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(76, 175, 80, 0.9)', color: 'white', padding: '15px 25px',
          borderRadius: '10px', zIndex: 200, fontWeight: 'bold', maxWidth: '90%', textAlign: 'center',
        }}>
          {success}
        </div>
      )}

      <div className="room-access-shell" style={{
        position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '620px', width: '100%' }}>
          <div className="room-access-panel" style={{
            background: 'rgba(8, 22, 27, 0.95)', border: `3px solid ${VINTAGE_YELLOW}`,
            borderRadius: '25px', padding: '40px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ marginBottom: '30px' }}>
              <img src="/assets/key.png" alt="Room Access" style={{ width: '70px', height: '70px', opacity: 0.8 }} />
              <h1 style={{
                color: VINTAGE_YELLOW, fontFamily: "'Pieces of Eight', serif",
                fontSize: '2.4rem', margin: '15px 0',
              }}>
                Room Access Portal
              </h1>
              <p style={{ color: '#B7A98A', fontSize: '1rem' }}>
                {step === 'choose' && `Welcome, ${delegate?.nickname || delegate?.full_name}! Choose how to get quarters`}
                {step === 'join' && 'Enter your room code'}
                {step === 'create' && 'Create your own quarters'}
              </p>
            </div>

            {step === 'choose' && (
              <div className="room-choice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <button
                  className="room-choice-button"
                  type="button"
                  onClick={() => { resetMessages(); setStep('join'); }}
                  style={{
                    padding: '30px 20px', borderRadius: '15px',
                    background: 'rgba(76,175,80,0.15)', border: '2px solid #4CAF50',
                    color: '#4CAF50', cursor: 'pointer',
                    fontFamily: "'Pieces of Eight', serif", fontSize: '1.55rem',
                    fontWeight: 'bold',
                  }}
                >
                  Join Room
                  <div style={{ fontSize: '1rem', marginTop: '8px', color: '#B7A98A', fontFamily: "'Poppins', sans-serif" }}>
                    Enter room code
                  </div>
                </button>
                <button
                  className="room-choice-button"
                  type="button"
                  onClick={() => { resetMessages(); setStep('create'); }}
                  style={{
                    padding: '30px 20px', borderRadius: '15px',
                    background: 'rgba(243,230,179,0.12)', border: `2px solid ${VINTAGE_YELLOW}`,
                    color: VINTAGE_YELLOW, cursor: 'pointer',
                    fontFamily: "'Pieces of Eight', serif", fontSize: '1.55rem',
                    fontWeight: 'bold',
                  }}
                >
                  Create Room
                  <div style={{ fontSize: '1rem', marginTop: '8px', color: '#B7A98A', fontFamily: "'Poppins', sans-serif" }}>
                    Individual or shared quarters
                  </div>
                </button>
              </div>
            )}

            {step === 'join' && (
              <form onSubmit={handleJoinRoom} style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Room Code *</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                  disabled={loading}
                />

                <button
                  className="room-action-button"
                  type="submit"
                  disabled={loading || !getDelegateGender(delegate) || !roomCode.trim()}
                  style={{
                    width: '100%', marginTop: '25px', padding: '18px', borderRadius: '15px',
                    background: loading ? '#666' : '#4CAF50',
                    color: 'white', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Pieces of Eight', serif", fontSize: '24px', fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {loading ? 'Joining...' : 'Join Quarters'}
                </button>
              </form>
            )}

            {step === 'create' && (
              <form onSubmit={handleCreateRoom} style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Room Type *</label>
                <div className="room-type-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    className="room-type-button"
                    type="button"
                    onClick={() => setRoomType('individual')}
                    style={{
                      padding: '18px', borderRadius: '12px',
                      border: roomType === 'individual' ? `3px solid ${VINTAGE_YELLOW}` : '2px solid rgba(243,230,179,0.4)',
                      background: roomType === 'individual' ? 'rgba(243,230,179,0.15)' : 'rgba(255,255,255,0.05)',
                      color: VINTAGE_YELLOW, cursor: 'pointer',
                      fontFamily: "'Pieces of Eight', serif",
                      fontSize: '1.35rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Individual
                    <div style={{ fontSize: '0.95rem', color: '#B7A98A', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>Private, 1 person</div>
                  </button>
                  <button
                    className="room-type-button"
                    type="button"
                    onClick={() => setRoomType('shared')}
                    style={{
                      padding: '18px', borderRadius: '12px',
                      border: roomType === 'shared' ? `3px solid ${VINTAGE_YELLOW}` : '2px solid rgba(243,230,179,0.4)',
                      background: roomType === 'shared' ? 'rgba(243,230,179,0.15)' : 'rgba(255,255,255,0.05)',
                      color: VINTAGE_YELLOW, cursor: 'pointer',
                      fontFamily: "'Pieces of Eight', serif",
                      fontSize: '1.35rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Shared
                    <div style={{ fontSize: '0.95rem', color: '#B7A98A', marginTop: '6px', fontFamily: "'Poppins', sans-serif" }}>Up to 4 crew</div>
                  </button>
                </div>

                <button
                  className="room-action-button"
                  type="submit"
                  disabled={loading || !getDelegateGender(delegate) || !roomType}
                  style={{
                    width: '100%', marginTop: '25px', padding: '18px', borderRadius: '15px',
                    background: loading ? '#666' : `linear-gradient(135deg, ${VINTAGE_YELLOW} 0%, ${VINTAGE_YELLOW_DEEP} 100%)`,
                    color: loading ? '#999' : '#08161B',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Pieces of Eight', serif", fontSize: '24px', fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {loading ? 'Creating...' : 'Create Quarters'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
