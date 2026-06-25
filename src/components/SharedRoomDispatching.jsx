// src/components/SharedRoomDispatching.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShipDeck from './ShipDeck';
import AudioControl from './AudioControl';
import OceanBackground from './OceanBackground';

export default function SharedRoomDispatching() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Room data management
  const [roomsData, setRoomsData] = useState(() => {
    const saved = localStorage.getItem('dynamicRoomsData');
    return saved ? JSON.parse(saved) : {};
  });
  
  // User session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState('Delegate');
  const [userGender, setUserGender] = useState('Mixed');

  // Room configuration with enhanced visual indicators
  const sharedRoomConfig = {
    section1: {
      doors: [
        { id: 'S1A', label: 'Quarters Alpha', type: 'shared', x: 34, y: 3.5, imgWidth: 13, capacity: 4 },
        { id: 'S1B', label: 'Quarters Bravo', type: 'shared', x: 48, y: 3.5, imgWidth: 13, capacity: 4 },
        { id: 'S1C', label: 'Quarters Charlie', type: 'shared', x: 29, y: 12.5, imgWidth: 13, capacity: 4 },
        { id: 'S1D', label: 'Quarters Delta', type: 'shared', x: 41.25, y: 12.5, imgWidth: 13, capacity: 4 },
        { id: 'S1E', label: 'Quarters Echo', type: 'shared', x: 53.5, y: 12.5, imgWidth: 13, capacity: 4 },
        { id: 'S1F', label: 'Quarters Foxtrot', type: 'shared', x: 28, y: 21.5, imgWidth: 13, capacity: 4 },
        { id: 'S1G', label: 'Quarters Golf', type: 'shared', x: 41.25, y: 21.5, imgWidth: 13, capacity: 4 },
        { id: 'S1H', label: 'Quarters Hotel', type: 'shared', x: 54.5, y: 21.5, imgWidth: 13, capacity: 4 },
      ],
      sectionName: 'SHARED QUARTERS',
      doorImage: '/assets/door2.png',
    },
  };

  // Enhanced doors with dynamic status
  const allDoors = Object.entries(sharedRoomConfig).flatMap(([sectionKey, section]) =>
    section.doors.map(door => ({
      ...door,
      sectionKey,
      doorImage: section.doorImage,
      sectionName: section.sectionName,
      status: getRoomStatus(door.id),
      occupancy: getRoomOccupancy(door.id),
      isUserInRoom: isUserInRoom(door.id),
      hasRoom: !!roomsData[door.id],
    }))
  );

  // Auto-save data
  useEffect(() => {
    localStorage.setItem('dynamicRoomsData', JSON.stringify(roomsData));
  }, [roomsData]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);
  // Helper functions
  const getRoomStatus = (roomId) => {
    const room = roomsData[roomId];
    if (!room) return 'Available';
    
    const memberCount = room.members?.length || 0;
    if (memberCount === 0) return 'Available';
    if (memberCount >= room.capacity) return 'Full';
    return `${memberCount}/${room.capacity}`;
  };

  const getRoomOccupancy = (roomId) => {
    const room = roomsData[roomId];
    if (!room) return 0;
    return ((room.members?.length || 0) / room.capacity) * 100;
  };

  const isUserInRoom = (roomId) => {
    if (!currentUser) return false;
    const room = roomsData[roomId];
    return room?.members?.some(member => member?.id === currentUser.id) || false;
  };

  // Generate codes and IDs
  const generateRoomCode = () => {
    const prefixes = ['BE-2', 'BE-3', 'BE-12', 'BE-G'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    return `${prefix}${number.toString().padStart(2, '0')}`;
  };

  const generateUserId = () => {
    return 'USER-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  // Handle door clicks with enhanced logic
  const handleDoorClick = (door) => {
    if (!currentUser) {
      // Need to create user profile first
      setSelectedRoom(door);
      setShowCreateModal(true);
      return;
    }

    // Check if user is already in this room
    if (isUserInRoom(door.id)) {
      setSelectedRoom(door);
      return;
    }

    // Check if user is already in another room
    const userRoom = Object.keys(roomsData).find(roomId => 
      roomsData[roomId].members?.some(member => member.id === currentUser.id)
    );
    
    if (userRoom) {
      setError(`You're already in ${roomsData[userRoom].name}. Leave that room first.`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    const room = roomsData[door.id];
    
    if (!room) {
      // No room exists, offer to create
      setSelectedRoom(door);
      setShowCreateModal(true);
      return;
    }

    if (room.members.length >= room.capacity) {
      setError(`${door.label} is full! (${room.members.length}/${room.capacity})`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Room exists and has space
    setSelectedRoom(door);
    setShowJoinModal(true);
  };
  // Create new room
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    const newUser = {
      id: generateUserId(),
      name: userName.trim(),
      position: userPosition,
      gender: userGender,
      joinedAt: new Date().toISOString(),
    };

    const roomCode = generateRoomCode();
    const newRoom = {
      id: selectedRoom.id,
      code: roomCode,
      name: selectedRoom.label,
      capacity: selectedRoom.capacity,
      gender: userGender,
      position: userPosition,
      members: [newUser],
      createdAt: new Date().toISOString(),
      createdBy: newUser.id,
    };

    setCurrentUser(newUser);
    setRoomsData(prev => ({ ...prev, [selectedRoom.id]: newRoom }));
    
    setError(null);
    setShowCreateModal(false);
    setUserName('');
    
    // Show success message with room code
    setTimeout(() => {
      alert(`✅ Room created! Code: ${roomCode}\nShare this code with your roommates.`);
    }, 100);
  };

  // Join existing room
  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      setError('Please enter the room code');
      return;
    }

    // Find room by code
    const roomEntry = Object.entries(roomsData).find(([_, room]) => 
      room.code?.toUpperCase() === joinCode.toUpperCase().trim()
    );

    if (!roomEntry) {
      setError('Room not found. Check the code and try again.');
      return;
    }

    const [roomId, room] = roomEntry;
    
    if (room.members.length >= room.capacity) {
      setError('Room is full!');
      return;
    }

    // Add user to room
    const updatedRoom = {
      ...room,
      members: [...room.members, currentUser]
    };

    setRoomsData(prev => ({ ...prev, [roomId]: updatedRoom }));
    setShowJoinModal(false);
    setJoinCode('');
    setError(null);
    
    alert(`✅ Successfully joined ${room.name}!`);
  };

  // Leave room
  const handleLeaveRoom = () => {
    if (!currentUser) return;

    const userRoomId = Object.keys(roomsData).find(roomId => 
      roomsData[roomId].members?.some(member => member.id === currentUser.id)
    );

    if (!userRoomId) return;

    const room = roomsData[userRoomId];
    const updatedMembers = room.members.filter(member => member.id !== currentUser.id);

    if (updatedMembers.length === 0) {
      // Delete empty room
      setRoomsData(prev => {
        const updated = { ...prev };
        delete updated[userRoomId];
        return updated;
      });
    } else {
      // Update room with remaining members
      setRoomsData(prev => ({
        ...prev,
        [userRoomId]: { ...room, members: updatedMembers }
      }));
    }

    setSelectedRoom(null);
    alert('✅ Left the room successfully');
  };
  // Room detail view
  if (selectedRoom) {
    const room = roomsData[selectedRoom.id];
    const members = room?.members || [];
    const availableSlots = selectedRoom.capacity - members.length;
    const userInRoom = members.some(member => member?.id === currentUser?.id);

    return (
      <>
        <OceanBackground />
        
        <div style={{ position: 'fixed', top: 28, right: 28, zIndex: 100 }}>
          <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))" }} />
        </div>

        <AudioControl />

        {/* Back Button - More Visible */}
        <button 
          onClick={() => { setSelectedRoom(null); setError(null); }} 
          style={{
            position: 'fixed', top: '20px', left: '20px', zIndex: 100,
            background: '#FFD700', color: '#08161B',
            border: '3px solid #08161B', padding: '12px 20px', borderRadius: '12px',
            cursor: 'pointer', fontFamily: "'Pieces of Eight', serif", fontSize: '16px',
            fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
            transition: 'all 0.3s ease', textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => { 
            e.target.style.background = '#08161B'; 
            e.target.style.color = '#FFD700';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => { 
            e.target.style.background = '#FFD700'; 
            e.target.style.color = '#08161B';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ← Back to Deck
        </button>

        {/* Error Message */}
        {error && (
          <div style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255, 59, 48, 0.9)', color: 'white', padding: '15px 25px',
            borderRadius: '10px', zIndex: 200, fontFamily: "'Poppins', sans-serif",
            fontWeight: 'bold', boxShadow: '0 4px 20px rgba(255, 59, 48, 0.3)'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)',
              border: '3px solid #FFD700', borderRadius: '20px', padding: '40px',
              maxWidth: '500px', width: '100%', textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{ color: '#FFD700', fontFamily: "'Pieces of Eight', serif", marginBottom: '20px', fontSize: '2rem' }}>
                ⚓ Create New Quarters
              </h2>
              <p style={{ color: '#B7A98A', marginBottom: '25px', fontSize: '1rem' }}>
                Set up your crew quarters for BEPS 2026
              </p>

              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', color: '#FFD700', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Your Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '10px',
                    border: '2px solid #FFD700', background: 'rgba(255,255,255,0.1)',
                    color: '#B7A98A', fontFamily: "'Poppins', sans-serif", fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', color: '#FFD700', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Position</label>
                <select 
                  value={userPosition} 
                  onChange={(e) => setUserPosition(e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '10px',
                    border: '2px solid #FFD700', background: 'rgba(255,255,255,0.1)',
                    color: '#B7A98A', fontFamily: "'Poppins', sans-serif", fontSize: '16px',
                  }}
                >
                  <option value="Delegate">Delegate</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Manager">Manager</option>
                  <option value="Executive">Executive</option>
                  <option value="VIP">VIP</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={{ display: 'block', color: '#FFD700', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Gender Preference</label>
                <select 
                  value={userGender} 
                  onChange={(e) => setUserGender(e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '10px',
                    border: '2px solid #FFD700', background: 'rgba(255,255,255,0.1)',
                    color: '#B7A98A', fontFamily: "'Poppins', sans-serif", fontSize: '16px',
                  }}
                >
                  <option value="Mixed">Mixed (Any Gender)</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => { setShowCreateModal(false); setSelectedRoom(null); setUserName(''); }}
                  style={{
                    flex: 1, padding: '15px', background: 'rgba(255,255,255,0.1)', color: '#B7A98A',
                    border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px', cursor: 'pointer', 
                    fontFamily: "'Pieces of Eight', serif", fontSize: '16px',
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateRoom}
                  disabled={loading || !userName.trim()}
                  style={{
                    flex: 1, padding: '15px', background: loading ? '#666' : '#FFD700', 
                    color: loading ? '#999' : '#08161B',
                    border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', 
                    fontFamily: "'Pieces of Eight', serif", fontSize: '16px', fontWeight: 'bold',
                  }}
                >
                  {loading ? 'Creating...' : '⚓ Create Quarters'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Join Room Modal */}
        {showJoinModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #08161B 0%, #17424A 100%)',
              border: '3px solid #4CAF50', borderRadius: '20px', padding: '40px',
              maxWidth: '450px', width: '100%', textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{ color: '#4CAF50', fontFamily: "'Pieces of Eight', serif", marginBottom: '20px', fontSize: '2rem' }}>
                🔑 Join Crew Quarters
              </h2>
              <p style={{ color: '#B7A98A', marginBottom: '25px', fontSize: '1rem' }}>
                Enter the quarters code to join {selectedRoom.label}
              </p>

              <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={{ display: 'block', color: '#4CAF50', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Quarters Code *</label>
                <input 
                  type="text" 
                  placeholder="BE-201" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '10px',
                    border: '2px solid #4CAF50', background: 'rgba(255,255,255,0.1)',
                    color: '#B7A98A', fontFamily: "'Poppins', sans-serif", fontSize: '18px',
                    textAlign: 'center', letterSpacing: '3px', fontWeight: 'bold'
                  }}
                />
                <p style={{ color: '#B7A98A', fontSize: '0.9rem', marginTop: '8px', textAlign: 'center' }}>
                  Format: BE-101, BE-203, BE-G01
                </p>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => { setShowJoinModal(false); setSelectedRoom(null); setJoinCode(''); }}
                  style={{
                    flex: 1, padding: '15px', background: 'rgba(255,255,255,0.1)', color: '#B7A98A',
                    border: '2px solid rgba(255,255,255,0.3)', borderRadius: '10px', cursor: 'pointer', 
                    fontFamily: "'Pieces of Eight', serif", fontSize: '16px',
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleJoinRoom}
                  disabled={loading || !joinCode.trim()}
                  style={{
                    flex: 1, padding: '15px', background: loading ? '#666' : '#4CAF50', 
                    color: loading ? '#999' : 'white',
                    border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', 
                    fontFamily: "'Pieces of Eight', serif", fontSize: '16px', fontWeight: 'bold',
                  }}
                >
                  {loading ? 'Joining...' : '⚓ Join Crew'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Room Details View */}
        <div style={{
          position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: '700px', width: '100%', paddingTop: '60px' }}>
            <div style={{
              background: 'rgba(8, 22, 27, 0.95)', border: '3px solid #FFD700',
              borderRadius: '25px', padding: '40px', textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              {/* Room Header */}
              <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#FFD700', fontFamily: "'Pieces of Eight', serif", fontSize: '2.8rem', marginBottom: '15px' }}>
                  🏴‍☠️ {selectedRoom.label}
                </h1>
                {room && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: members.length >= room.capacity ? 'rgba(255,59,48,0.2)' : 'rgba(76,175,80,0.2)', 
                      color: members.length >= room.capacity ? '#FF3B30' : '#4CAF50',
                      padding: '8px 20px', borderRadius: '20px', fontSize: '1rem', fontWeight: 'bold',
                      border: `2px solid ${members.length >= room.capacity ? '#FF3B30' : '#4CAF50'}`
                    }}>
                      {members.length >= room.capacity ? '🔒 FULL' : `🆓 ${availableSlots} SPOTS LEFT`}
                    </span>
                    <span style={{ 
                      background: 'rgba(255,215,0,0.2)', color: '#FFD700',
                      padding: '8px 20px', borderRadius: '20px', fontSize: '1rem', fontWeight: 'bold',
                      border: '2px solid #FFD700'
                    }}>
                      👥 {room.gender} • 🎖️ {room.position}
                    </span>
                  </div>
                )}
              </div>

              {/* Room Code Display */}
              {room?.code && (
                <div style={{
                  background: 'rgba(76,175,80,0.15)', border: '3px solid #4CAF50',
                  borderRadius: '20px', padding: '25px', marginBottom: '35px',
                }}>
                  <p style={{ color: '#B7A98A', marginBottom: '10px', fontSize: '1.1rem' }}>🔑 Share this code with your crew:</p>
                  <p style={{ 
                    color: '#4CAF50', fontFamily: "'Pieces of Eight', serif", 
                    fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '5px', margin: '10px 0'
                  }}>
                    {room.code}
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(room.code);
                      alert('📋 Code copied to clipboard!');
                    }}
                    style={{
                      background: 'rgba(76,175,80,0.3)', color: '#4CAF50', border: '2px solid #4CAF50',
                      padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                      fontFamily: "'Pieces of Eight', serif", fontWeight: 'bold'
                    }}
                  >
                    📋 Copy Code
                  </button>
                </div>
              )}

              {/* Crew Members Grid */}
              <div style={{ marginBottom: '35px' }}>
                <h3 style={{ 
                  color: '#FFD700', marginBottom: '25px', fontFamily: "'Pieces of Eight', serif",
                  fontSize: '1.8rem'
                }}>
                  ⚓ Crew Roster ({members.length}/{room?.capacity || selectedRoom.capacity})
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '20px'
                }}>
                  {Array.from({ length: room?.capacity || selectedRoom.capacity }).map((_, idx) => {
                    const member = members[idx];
                    const isCurrentUser = member?.id === currentUser?.id;
                    
                    return (
                      <div key={idx} style={{
                        padding: '25px', 
                        background: member 
                          ? (isCurrentUser ? 'rgba(255,215,0,0.2)' : 'rgba(76,175,80,0.15)')
                          : 'rgba(255,255,255,0.05)',
                        border: member 
                          ? (isCurrentUser ? '3px solid #FFD700' : '3px solid #4CAF50')
                          : '3px dashed rgba(255,255,255,0.3)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        minHeight: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '60px', height: '60px', borderRadius: '50%',
                          background: member 
                            ? (isCurrentUser ? '#FFD700' : '#4CAF50')
                            : 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 15px', fontSize: '1.8rem', fontWeight: 'bold',
                          color: member ? '#08161B' : 'rgba(255,255,255,0.4)',
                          border: '3px solid rgba(0,0,0,0.1)'
                        }}>
                          {member ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        
                        {member ? (
                          <>
                            <p style={{ 
                              color: isCurrentUser ? '#FFD700' : '#4CAF50', 
                              fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem'
                            }}>
                              {member.name} {isCurrentUser && '👑'}
                            </p>
                            <p style={{ color: '#B7A98A', fontSize: '0.9rem', margin: '0' }}>
                              🎖️ {member.position}
                            </p>
                          </>
                        ) : (
                          <>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '5px 0' }}>
                              🆓 Available
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', margin: '0' }}>
                              Waiting for crew...
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Action Buttons - More Visible */}
              <div style={{ 
                display: 'flex', gap: '20px', justifyContent: 'center', 
                flexWrap: 'wrap', marginBottom: '35px' 
              }}>
                {!currentUser && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      padding: '15px 30px', background: '#FFD700', color: '#08161B',
                      border: '3px solid #08161B', borderRadius: '15px', cursor: 'pointer', 
                      fontFamily: "'Pieces of Eight', serif", fontSize: '18px', fontWeight: 'bold',
                      boxShadow: '0 5px 20px rgba(255,215,0,0.4)', transition: 'all 0.3s ease',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255,215,0,0.6)';
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 5px 20px rgba(255,215,0,0.4)';
                    }}
                  >
                    ⚓ Create New Quarters
                  </button>
                )}
                
                {currentUser && !userInRoom && room && availableSlots > 0 && (
                  <button 
                    onClick={() => setShowJoinModal(true)}
                    style={{
                      padding: '15px 30px', background: '#4CAF50', color: 'white',
                      border: '3px solid #2E7D32', borderRadius: '15px', cursor: 'pointer', 
                      fontFamily: "'Pieces of Eight', serif", fontSize: '18px', fontWeight: 'bold',
                      boxShadow: '0 5px 20px rgba(76,175,80,0.4)', transition: 'all 0.3s ease',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 25px rgba(76,175,80,0.6)';
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 5px 20px rgba(76,175,80,0.4)';
                    }}
                  >
                    🔑 Join This Crew
                  </button>
                )}
                
                {userInRoom && (
                  <button 
                    onClick={handleLeaveRoom}
                    style={{
                      padding: '15px 30px', background: 'rgba(255,59,48,0.8)', color: 'white',
                      border: '3px solid #C62828', borderRadius: '15px', cursor: 'pointer', 
                      fontFamily: "'Pieces of Eight', serif", fontSize: '18px', fontWeight: 'bold',
                      boxShadow: '0 5px 20px rgba(255,59,48,0.4)', transition: 'all 0.3s ease',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255,59,48,0.6)';
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 5px 20px rgba(255,59,48,0.4)';
                    }}
                  >
                    🚪 Abandon Ship
                  </button>
                )}
              </div>

              {/* Room Statistics */}
              <div style={{
                marginTop: '30px', padding: '25px', 
                background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
                border: '2px solid rgba(255,215,0,0.2)',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {((members.length / (room?.capacity || selectedRoom.capacity)) * 100).toFixed(0)}%
                  </p>
                  <p style={{ color: '#B7A98A', fontSize: '0.9rem', margin: '8px 0 0' }}>⚡ Occupied</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {room?.capacity || selectedRoom.capacity}
                  </p>
                  <p style={{ color: '#B7A98A', fontSize: '0.9rem', margin: '8px 0 0' }}>👥 Max Crew</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
                    {room ? new Date(room.createdAt).toLocaleDateString() : 'New'}
                  </p>
                  <p style={{ color: '#B7A98A', fontSize: '0.9rem', margin: '8px 0 0' }}>📅 Established</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  // Main deck view
  return (
    <>
      <OceanBackground />

      <div style={{ position: "fixed", top: 28, right: 28, zIndex: 100 }}>
        <img src="/assets/logo.png" alt="Stand Up 2K26" style={{ width: 120, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))" }} />
      </div>

      <AudioControl />

      {/* Back Button - More Prominent */}
      <button 
        onClick={() => navigate('/')} 
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 100,
          background: '#FFD700', color: '#08161B',
          border: '3px solid #08161B', padding: '12px 24px', borderRadius: '12px',
          cursor: 'pointer', fontFamily: "'Pieces of Eight', serif", fontSize: '16px',
          fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
          transition: 'all 0.3s ease', textTransform: 'uppercase'
        }} 
        onMouseEnter={(e) => { 
          e.target.style.background = '#08161B'; 
          e.target.style.color = '#FFD700';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => { 
          e.target.style.background = '#FFD700'; 
          e.target.style.color = '#08161B';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ← Back to Harbor
      </button>

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 59, 48, 0.95)', color: 'white', padding: '15px 30px',
          borderRadius: '10px', zIndex: 200, fontFamily: "'Poppins', sans-serif",
          fontWeight: 'bold', boxShadow: '0 4px 20px rgba(255, 59, 48, 0.4)',
          border: '2px solid #FF3B30'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Quick Stats Bar */}
      <div style={{
        position: 'fixed', top: '20px', right: '160px', zIndex: 99,
        background: 'rgba(8, 22, 27, 0.9)', color: '#FFD700',
        padding: '10px 20px', borderRadius: '10px', border: '2px solid #FFD700',
        fontFamily: "'Pieces of Eight', serif", fontSize: '14px',
        display: 'flex', gap: '15px', alignItems: 'center'
      }}>
        <span>🏴‍☠️ Quarters: {Object.keys(roomsData).length}</span>
        <span>👥 Crew: {Object.values(roomsData).reduce((total, room) => total + room.members.length, 0)}</span>
        {currentUser && <span>⚓ {currentUser.name}</span>}
      </div>

      <div style={{
        position: 'relative', zIndex: 10, minHeight: '100vh', padding: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <h1 style={{
          color: 'var(--sand-light)', fontFamily: "'Pieces of Eight', serif",
          fontSize: '3rem', marginBottom: '1rem', textAlign: 'center',
          textShadow: '0 4px 8px rgba(0,0,0,0.5)'
        }}>
          🏴‍☠️ Shared Crew Quarters
        </h1>
        
        <p style={{
          color: '#B7A98A', fontSize: '1.2rem', marginBottom: '3rem', textAlign: 'center',
          maxWidth: '600px', lineHeight: '1.6'
        }}>
          Choose your quarters aboard the BEPS 2026 vessel. Create new quarters or join existing crew!
        </p>

        {/* Enhanced ShipDeck with room status indicators */}
        <div style={{ position: 'relative' }}>
          <ShipDeck propRooms={allDoors} onDoorClick={handleDoorClick} />
          
          {/* Room Status Legend */}
          <div style={{
            position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(8, 22, 27, 0.9)', padding: '15px 25px', borderRadius: '15px',
            border: '2px solid #FFD700', display: 'flex', gap: '20px', alignItems: 'center',
            fontFamily: "'Poppins', sans-serif", fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(76,175,80,0.5)', borderRadius: '50%', border: '2px solid #4CAF50' }}></div>
              <span style={{ color: '#4CAF50' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(255,215,0,0.5)', borderRadius: '50%', border: '2px solid #FFD700' }}></div>
              <span style={{ color: '#FFD700' }}>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(255,59,48,0.5)', borderRadius: '50%', border: '2px solid #FF3B30' }}></div>
              <span style={{ color: '#FF3B30' }}>Full</span>
            </div>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div style={{
          marginTop: '120px', display: 'flex', gap: '30px', flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '20px 40px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: '#08161B', border: '3px solid #08161B', borderRadius: '20px',
              cursor: 'pointer', fontFamily: "'Pieces of Eight', serif",
              fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase',
              boxShadow: '0 8px 25px rgba(255,215,0,0.4)', transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) translateY(-5px)';
              e.target.style.boxShadow = '0 15px 35px rgba(255,215,0,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) translateY(0px)';
              e.target.style.boxShadow = '0 8px 25px rgba(255,215,0,0.4)';
            }}
          >
            ⚓ Create New Quarters
          </button>
        </div>
      </div>
    </>
  );
}