// src/components/RoomInterface.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDelegateMembership, getRoomDetails, removeUserFromRoom } from '../services/roomService';
import OceanBackground from './OceanBackground';
import AudioControl from './AudioControl';

const COLORS = {
  panel: 'rgba(8, 22, 27, 0.94)',
  panelSoft: 'rgba(18, 47, 54, 0.76)',
  border: 'rgba(183, 169, 138, 0.45)',
  borderStrong: 'rgba(183, 169, 138, 0.72)',
  sand: '#C8B992',
  sandMuted: '#A89A7A',
  text: '#E8DFC5',
  teal: '#6FA3A8',
  danger: '#B96A5F',
  dark: '#08161B',
};

const buttonBase = {
  borderRadius: '10px',
  cursor: 'pointer',
  fontFamily: "'Pieces of Eight', serif",
  fontWeight: 'bold',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

function storeRoomAccessFromMembership(membership) {
  sessionStorage.setItem('roomAccess', JSON.stringify({
    registrationId: membership.registration_id,
    userName: membership.user_name,
    gender: membership.gender,
    roomData: membership.room,
    membership,
    accessTime: new Date().toISOString(),
  }));
}

export default function RoomInterface() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [userAccess, setUserAccess] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeRoom() {
      const accessData = sessionStorage.getItem('roomAccess');

      if (accessData) {
        try {
          const parsedAccess = JSON.parse(accessData);
          if (cancelled) return;
          setUserAccess(parsedAccess);
          await loadRoomDetails(parsedAccess.roomData.room_id, cancelled);
          return;
        } catch (err) {
          console.error('Error parsing access data:', err);
          sessionStorage.removeItem('roomAccess');
        }
      }

      try {
        const delegate = JSON.parse(sessionStorage.getItem('verifiedDelegate') || 'null');
        if (!delegate?.id) {
          navigate('/room-access', { replace: true });
          return;
        }

        const membershipResult = await getDelegateMembership(delegate.id);
        if (cancelled) return;

        if (!membershipResult.success || !membershipResult.membership?.room) {
          navigate('/room-access', { replace: true });
          return;
        }

        storeRoomAccessFromMembership(membershipResult.membership);
        setUserAccess(JSON.parse(sessionStorage.getItem('roomAccess')));
        await loadRoomDetails(membershipResult.membership.room.room_id, cancelled);
      } catch (err) {
        console.error('Room initialization error:', err);
        if (!cancelled) navigate('/room-access', { replace: true });
      }
    }

    initializeRoom();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const loadRoomDetails = async (roomId, cancelled = false) => {
    try {
      const result = await getRoomDetails(roomId);

      if (cancelled) return;

      if (result.success) {
        setRoomData(result.room);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      if (!cancelled) {
        setError('Failed to load room details.');
        console.error('Room details error:', err);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!userAccess || !window.confirm('Are you sure you want to leave this room?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeUserFromRoom(
        userAccess.registrationId,
        userAccess.roomData.room_id,
      );

      if (result.success) {
        sessionStorage.removeItem('roomAccess');
        navigate('/room-access', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to leave room.');
      console.error('Leave room error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = async () => {
    if (!roomData?.room_code) return;
    try {
      await navigator.clipboard.writeText(roomData.room_code);
      alert(`Room code copied: ${roomData.room_code}`);
    } catch {
      alert(`Share this code with friends: ${roomData.room_code}`);
    }
  };

  if (loading) {
    return (
      <>
        <OceanBackground />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
          color: COLORS.sand, fontFamily: "'Pieces of Eight', serif",
        }}>
          <h2>Loading your room...</h2>
        </div>
      </>
    );
  }

  if (error || !roomData) {
    return (
      <>
        <OceanBackground />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
          color: COLORS.text, fontFamily: "'Poppins', sans-serif",
          background: COLORS.panel, border: `1px solid ${COLORS.border}`,
          borderRadius: '8px', padding: '28px', width: 'min(420px, 90vw)',
        }}>
          <h2 style={{ color: COLORS.danger, fontFamily: "'Pieces of Eight', serif" }}>Room unavailable</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/room-access', { replace: true })}
            style={{
              ...buttonBase,
              padding: '10px 20px', background: COLORS.sand, color: COLORS.dark,
              border: 'none', marginTop: '20px',
            }}
          >
            Room access
          </button>
        </div>
      </>
    );
  }

  const occupancyPercentage = (roomData.occupied / roomData.capacity) * 100;
  const spotsLeft = roomData.capacity - roomData.occupied;
  const isYou = (member) => member.registration_id === userAccess.registrationId;

  return (
    <>
      <OceanBackground />

      <div className="room-page-logo" style={{ position: 'fixed', top: 28, right: 28, zIndex: 100 }}>
        <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }} />
      </div>

      <AudioControl />

      <button
        className="room-top-action"
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 100,
          ...buttonBase,
          background: COLORS.sand, color: COLORS.dark,
          border: `2px solid ${COLORS.dark}`, padding: '12px 22px',
          fontSize: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
        }}
      >
        Back to main page
      </button>

      <div className="room-interface-shell" style={{
        position: 'relative', zIndex: 10, minHeight: '100vh', padding: '96px 1rem 2rem',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <div style={{ maxWidth: '820px', width: '100%' }}>
          <div className="room-interface-panel" style={{
            background: COLORS.panel, border: `1px solid ${COLORS.borderStrong}`,
            borderRadius: '8px', padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center',
            boxShadow: '0 18px 50px rgba(0,0,0,0.42)',
          }}>
            <div style={{ marginBottom: '34px' }}>
              <p style={{
                color: COLORS.sandMuted, fontFamily: "'Poppins', sans-serif",
                fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: '8px',
              }}>
                Your room
              </p>
              <h1 style={{
                color: COLORS.sand, fontFamily: "'Pieces of Eight', serif",
                fontSize: 'clamp(2.4rem, 8vw, 3.6rem)', marginBottom: '18px',
              }}>
                {roomData.room_code}
              </h1>

              <div className="room-chip-row" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(111, 163, 168, 0.13)',
                  color: COLORS.text,
                  padding: '8px 16px', borderRadius: '999px', fontSize: '0.92rem', fontWeight: 'bold',
                  border: `1px solid ${COLORS.border}`,
                }}>
                  {roomData.gender === 'M' ? 'Male' : 'Female'} room
                </span>

                <span style={{
                  background: 'rgba(183, 169, 138, 0.12)', color: COLORS.text,
                  padding: '8px 16px', borderRadius: '999px', fontSize: '0.92rem', fontWeight: 'bold',
                  border: `1px solid ${COLORS.border}`,
                }}>
                  {roomData.room_type === 'individual' ? 'Individual' : 'Shared'}
                </span>

                <span style={{
                  background: occupancyPercentage >= 100 ? 'rgba(185, 106, 95, 0.16)' : 'rgba(111, 163, 168, 0.13)',
                  color: occupancyPercentage >= 100 ? '#DDA59D' : COLORS.text,
                  padding: '8px 16px', borderRadius: '999px', fontSize: '0.92rem', fontWeight: 'bold',
                  border: `1px solid ${occupancyPercentage >= 100 ? 'rgba(185, 106, 95, 0.58)' : COLORS.border}`,
                }}>
                  {occupancyPercentage >= 100 ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
                </span>
              </div>

              <button
                onClick={copyRoomCode}
                style={{
                  ...buttonBase,
                  padding: '10px 18px', background: 'rgba(183, 169, 138, 0.12)',
                  color: COLORS.sand, border: `1px solid ${COLORS.borderStrong}`,
                }}
              >
                Copy room code
              </button>
            </div>

            <div className="room-occupancy-grid" style={{
              display: 'grid', gridTemplateColumns: 'minmax(160px, 280px)',
              justifyContent: 'center',
              gap: '14px', marginBottom: '34px',
            }}>
              <div style={{
                background: COLORS.panelSoft, border: `1px solid ${COLORS.border}`,
                borderRadius: '8px', padding: '20px',
              }}>
                <h3 style={{ color: COLORS.sand, fontSize: '2rem', margin: '0' }}>
                  {roomData.occupied}/{roomData.capacity}
                </h3>
                <p style={{ color: COLORS.sandMuted, margin: '5px 0 0', fontSize: '0.9rem' }}>Occupancy</p>
              </div>
            </div>

            <div style={{ marginBottom: '34px' }}>
              <h2 style={{
                color: COLORS.sand, fontFamily: "'Pieces of Eight', serif",
                marginBottom: '22px', fontSize: '1.8rem',
              }}>
                Current Room Members
              </h2>

              {roomData.members && roomData.members.length > 0 ? (
                <div className="room-members-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '12px',
                }}>
                  {roomData.members.map((member) => (
                    <div key={member.id} style={{
                      background: isYou(member)
                        ? 'rgba(183, 169, 138, 0.15)'
                        : 'rgba(18, 47, 54, 0.58)',
                      border: isYou(member)
                        ? `1px solid ${COLORS.borderStrong}`
                        : '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '8px', padding: '18px', textAlign: 'center',
                    }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '50%',
                        background: isYou(member) ? COLORS.sand : COLORS.teal,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px', fontSize: '1.3rem', fontWeight: 'bold',
                        color: COLORS.dark,
                      }}>
                        {member.user_name ? member.user_name.charAt(0).toUpperCase() : '?'}
                      </div>

                      <p style={{
                        color: isYou(member) ? COLORS.sand : COLORS.text,
                        fontWeight: 'bold', marginBottom: '5px',
                      }}>
                        {member.user_name || 'Anonymous'}
                        {isYou(member) && ' (You)'}
                      </p>

                      <p style={{ color: COLORS.sandMuted, fontSize: '0.8rem', margin: '0' }}>
                        Joined {new Date(member.joined_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '32px', background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px', color: COLORS.sandMuted,
                }}>
                  <p style={{ fontSize: '1.1rem', margin: '0' }}>
                    You are the first member in this room.
                  </p>
                </div>
              )}
            </div>

            <div className="room-actions" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => loadRoomDetails(roomData.room_id)}
                style={{
                  ...buttonBase,
                  padding: '14px 24px', background: COLORS.teal, color: COLORS.dark,
                  border: 'none', fontSize: '1rem',
                }}
              >
                Refresh room
              </button>

              <button
                onClick={handleLeaveRoom}
                disabled={loading}
                style={{
                  ...buttonBase,
                  padding: '14px 24px',
                  background: loading ? 'rgba(255,255,255,0.16)' : 'rgba(185, 106, 95, 0.84)',
                  color: loading ? COLORS.sandMuted : '#fff',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                }}
              >
                {loading ? 'Leaving...' : 'Leave room'}
              </button>
            </div>

            <div className="room-meta" style={{
              marginTop: '34px', paddingTop: '22px', borderTop: `1px solid ${COLORS.border}`,
              color: COLORS.sandMuted, fontSize: '0.85rem',
            }}>
              <p>Access granted at {new Date(userAccess.accessTime).toLocaleString()}</p>
              <p>Registration {userAccess.registrationId}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
