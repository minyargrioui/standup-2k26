// src/components/SharedRoomDispatching.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipDeck from './ShipDeck';
import AudioControl from './AudioControl';
import OceanBackground from './OceanBackground';

export default function SharedRoomDispatching() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [userCode, setUserCode] = useState(() => {
    const code = sessionStorage.getItem('userCode');
    if (!code) {
      const newCode = 'USER-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      sessionStorage.setItem('userCode', newCode);
      return newCode;
    }
    return code;
  });

  // Room state: { roomId: { code: 'CODE-XXX', slots: [{ userId: 'USER-XXX', name: 'Person 1' }, null, null, null] } }
  const [roomsState, setRoomsState] = useState(() => {
    const saved = sessionStorage.getItem('sharedRoomsState');
    return saved ? JSON.parse(saved) : {};
  });

  const [codeInput, setCodeInput] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotName, setSlotName] = useState('');

  // Shared room configuration for ShipDeck
  const sharedRoomConfig = {
    section1: {
      doors: [
        { id: 'S1A', label: 'Bunk A', type: 'shared', x: 34, y: 3.5, imgWidth: 13 },
        { id: 'S1B', label: 'Bunk B', type: 'shared', x: 48, y: 3.5, imgWidth: 13 },
        { id: 'S1C', label: 'Bunk C', type: 'shared', x: 29, y: 12.5, imgWidth: 13 },
        { id: 'S1D', label: 'Bunk D', type: 'shared', x: 41.25, y: 12.5, imgWidth: 13 },
        { id: 'S1E', label: 'Bunk E', type: 'shared', x: 53.5, y: 12.5, imgWidth: 13 },
        { id: 'S1F', label: 'Bunk F', type: 'shared', x: 28, y: 21.5, imgWidth: 13 },
        { id: 'S1G', label: 'Bunk G', type: 'shared', x: 41.25, y: 21.5, imgWidth: 13 },
        { id: 'S1H', label: 'Bunk H', type: 'shared', x: 54.5, y: 21.5, imgWidth: 13 },
      ],
      sectionName: 'SHARED QUARTERS',
      doorImage: '/assets/door2.png',
    },
  };

  const allDoors = Object.entries(sharedRoomConfig).flatMap(([sectionKey, section]) =>
    section.doors.map(door => ({
      ...door,
      sectionKey,
      doorImage: section.doorImage,
      sectionName: section.sectionName,
    }))
  );

  // Generate simple code (first 4 chars of room ID + random)
  const generateCode = (roomId) => {
    return roomId.substring(0, 2) + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  // Save room state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('sharedRoomsState', JSON.stringify(roomsState));
  }, [roomsState]);

  const handleDoorClick = (door) => {
    const roomState = roomsState[door.id];
    const userHasSlot = roomState?.slots?.some(slot => slot?.userId === userCode);

    // If user already has a slot, bypass code check
    if (userHasSlot) {
      setSelectedRoom(door);
      setShowCodeModal(false);
      return;
    }

    // If room has bookings, ask for code
    if (roomState?.code) {
      setSelectedRoom(door);
      setShowCodeModal(true);
      return;
    }

    // If room is empty, open directly
    setSelectedRoom(door);
    setShowCodeModal(false);
  };

  const handleCodeSubmit = () => {
    if (!selectedRoom) return;

    const roomState = roomsState[selectedRoom.id];
    if (codeInput === roomState.code) {
      setCodeInput('');
      setShowCodeModal(false);
    } else {
      alert('❌ Incorrect code. Please try again.');
      setCodeInput('');
    }
  };

  const handleSlotClick = (slotIndex) => {
    const roomState = roomsState[selectedRoom.id];
    
    // Check if slot is already taken
    if (roomState?.slots?.[slotIndex]) {
      alert('❌ This slot is already taken!');
      return;
    }

    setSelectedSlot(slotIndex);
    setSlotName('');
  };

  const handleConfirmSlot = () => {
    if (!slotName.trim()) {
      alert('Please enter your name');
      return;
    }

    const roomId = selectedRoom.id;
    let roomCode = null;
    
    setRoomsState(prev => {
      const updated = { ...prev };
      
      // Initialize room state if doesn't exist - generate code only on first booking
      if (!updated[roomId]) {
        roomCode = generateCode(roomId);
        updated[roomId] = {
          code: roomCode,
          slots: [null, null, null, null],
        };
      } else {
        // Use existing code
        roomCode = updated[roomId].code;
      }

      // Check again if slot is taken (race condition safety)
      if (updated[roomId].slots[selectedSlot]) {
        alert('❌ Sorry, this slot was just taken!');
        return prev;
      }

      // Book the slot
      updated[roomId].slots[selectedSlot] = {
        userId: userCode,
        name: slotName.trim(),
      };

      return updated;
    });

    // Show success message
    alert(`✅ Slot ${selectedSlot + 1} booked successfully!`);
    setSelectedSlot(null);
    setSlotName('');
  };

  const getRoomStatus = (roomId) => {
    const roomState = roomsState[roomId];
    const filledSlots = roomState?.slots?.filter(slot => slot !== null).length || 0;
    return filledSlots > 0 ? 'Booked' : 'Empty';
  };

  if (selectedRoom) {
    const roomState = roomsState[selectedRoom.id];
    const slots = roomState?.slots || [null, null, null, null];
    const status = getRoomStatus(selectedRoom.id);

    return (
      <>
        <OceanBackground />

        <div style={{ position: 'fixed', top: 28, right: 28, zIndex: 100 }}>
          <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))" }} />
        </div>

        <AudioControl />

        <button onClick={() => { setSelectedRoom(null); setSelectedSlot(null); }} style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 100,
          background: 'var(--primary-teal)', color: 'var(--sand-light)',
          border: '2px solid var(--sand-light)', padding: '8px 16px', borderRadius: '8px',
          cursor: 'pointer', fontFamily: "'Pieces of Eight', serif", transition: 'all 0.3s ease',
        }} onMouseEnter={(e) => { e.target.style.background = 'var(--sand-light)'; e.target.style.color = 'var(--dark-bg)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'var(--primary-teal)'; e.target.style.color = 'var(--sand-light)'; }}>
          ← Back
        </button>

        {showCodeModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)',
              border: '2px solid #FFD700', borderRadius: '20px', padding: '40px',
              maxWidth: '400px', width: '90%', textAlign: 'center',
            }}>
              <h2 style={{ color: '#FFD700', fontFamily: "'Pieces of Eight', serif", marginBottom: '20px' }}>Enter Room Code</h2>
              <p style={{ color: '#B7A98A', marginBottom: '15px' }}>This room requires a code to join.</p>
              <input type="text" placeholder="Enter code" value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
                style={{
                  width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px',
                  border: '1px solid #FFD700', background: 'rgba(255,255,255,0.1)',
                  color: '#B7A98A', fontFamily: "'Poppins', sans-serif", fontSize: '16px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowCodeModal(false); setSelectedRoom(null); }}
                  style={{
                    flex: 1, padding: '10px', background: '#666', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Pieces of Eight', serif",
                  }}>Cancel</button>
                <button onClick={handleCodeSubmit}
                  style={{
                    flex: 1, padding: '10px', background: '#FFD700', color: '#08161B',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Pieces of Eight', serif",
                  }}>Submit</button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '600px', width: '100%', paddingTop: '60px' }}>
            <div style={{
              background: 'rgba(8, 22, 27, 0.9)', border: '2px solid #FFD700',
              borderRadius: '20px', padding: '40px', textAlign: 'center',
            }}>
              <h1 style={{ color: '#FFD700', fontFamily: "'Pieces of Eight', serif", fontSize: '2.5rem', marginBottom: '10px' }}>
                {selectedRoom.label}
              </h1>
              <p style={{ color: '#B7A98A', marginBottom: '20px' }}>Room Status: <strong>{status}</strong></p>

              {roomsState[selectedRoom.id]?.code && (
                <div style={{
                  background: 'rgba(76,175,80,0.1)', border: '1px solid #4CAF50',
                  borderRadius: '10px', padding: '15px', marginBottom: '20px',
                }}>
                  <p style={{ color: '#A89A7A', marginBottom: '5px', fontSize: '0.9rem' }}>Room Code:</p>
                  <p style={{ color: '#4CAF50', fontFamily: "'Pieces of Eight', serif", fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {roomsState[selectedRoom.id].code}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <p style={{ color: '#A89A7A', marginBottom: '15px' }}>Available Slots:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {slots.map((slot, idx) => (
                    <div key={idx} onClick={() => !slot && handleSlotClick(idx)}
                      style={{
                        padding: '20px', background: slot ? 'rgba(200,0,0,0.2)' : selectedSlot === idx ? 'rgba(76,175,80,0.3)' : 'rgba(255,215,0,0.1)',
                        border: slot ? '2px solid #FF6B6B' : selectedSlot === idx ? '2px solid #4CAF50' : '2px solid #FFD700',
                        borderRadius: '10px', cursor: slot ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                      }}>
                      <p style={{ color: slot ? '#FF6B6B' : selectedSlot === idx ? '#4CAF50' : '#FFD700', fontWeight: 'bold', marginBottom: '5px' }}>
                        Slot {idx + 1}
                      </p>
                      <p style={{ color: '#B7A98A', fontSize: '0.9rem' }}>
                        {slot ? `🔒 ${slot.name}` : selectedSlot === idx ? '✓ Selected' : 'Available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSlot !== null && (
                <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(76,175,80,0.1)', borderRadius: '10px' }}>
                  <p style={{ color: '#B7A98A', marginBottom: '10px' }}>Enter your name for Slot {selectedSlot + 1}:</p>
                  <input type="text" placeholder="Your name" value={slotName}
                    onChange={(e) => setSlotName(e.target.value)}
                    style={{
                      width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px',
                      border: '1px solid #4CAF50', background: 'rgba(255,255,255,0.1)',
                      color: '#B7A98A', fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setSelectedSlot(null)}
                      style={{
                        flex: 1, padding: '10px', background: '#666', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Pieces of Eight', serif",
                      }}>Cancel</button>
                    <button onClick={handleConfirmSlot}
                      style={{
                        flex: 1, padding: '10px', background: '#4CAF50', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Pieces of Eight', serif",
                      }}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <OceanBackground />

      <div style={{ position: "fixed", top: 28, right: 28, zIndex: 100 }}>
        <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))" }} />
      </div>

      <AudioControl />

      <button onClick={() => navigate('/')} style={{
        position: 'fixed', top: '20px', left: '20px', zIndex: 100,
        background: 'var(--primary-teal)', color: 'var(--sand-light)',
        border: '2px solid var(--sand-light)', padding: '8px 16px', borderRadius: '8px',
        cursor: 'pointer', fontFamily: "'Pieces of Eight', serif", transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => { e.target.style.background = 'var(--sand-light)'; e.target.style.color = 'var(--dark-bg)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'var(--primary-teal)'; e.target.style.color = 'var(--sand-light)'; }}>
        ← Back to Selection
      </button>

      <div style={{
        position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <h1 style={{
          color: 'var(--sand-light)', fontFamily: "'Pieces of Eight', serif",
          fontSize: '2rem', marginBottom: '2rem'
        }}>
          Select a Shared Room
        </h1>
        <ShipDeck propRooms={allDoors} onDoorClick={handleDoorClick} />
      </div>
    </>
  );
}
