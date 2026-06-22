// components/ShipDeck.jsx
import { useState } from 'react';

export default function ShipDeck({ propRooms, onDoorClick }) {
  const [hoveredDoor, setHoveredDoor] = useState(null);

  // DOOR CONFIGURATION - Modify these values to customize doors
  const doorConfig = {
    section1: {
      doors: [
        { id: '1A', label: 'Room 1', type: 'vip', x: 34, y: 3.5, imgWidth: 13 },
        { id: '1B', label: 'Room 2', type: 'vip', x: 48, y: 3.5, imgWidth: 13 },
        { id: '1C', label: 'Room 3', type: 'vip', x: 29, y: 12.5, imgWidth: 13 },
        { id: '1D', label: 'Room 4', type: 'vip', x: 41.25, y: 12.5, imgWidth: 13 },
        { id: '1E', label: 'Room 5', type: 'vip', x: 53.5, y: 12.5, imgWidth: 13 },
        { id: '1F', label: 'Room 6', type: 'vip', x: 28, y: 21.5, imgWidth: 13 },
        { id: '1G', label: 'Room 7', type: 'vip', x: 41.25, y: 21.5, imgWidth: 13 },
        { id: '1H', label: 'Room 8', type: 'vip', x: 54.5, y: 21.5, imgWidth: 13 },
      ],
      sectionName: 'NEWBIES',
      doorImage: '/assets/door1.png',
    },
    section2: {
      doors: [
        { id: '2A', label: 'Room 1', type: 'vip', x: 25.5, y: 39.5, imgWidth: 13 },
        { id: '2B', label: 'Room 2', type: 'vip', x: 35.75, y: 39.5, imgWidth: 13 },
        { id: '2C', label: 'Room 3', type: 'vip', x: 46, y: 39.5, imgWidth: 13 },
        { id: '2D', label: 'Room 4', type: 'vip', x: 56.5, y: 39.5, imgWidth: 13 },
        { id: '2E', label: 'Room 5', type: 'vip', x: 25.5, y: 49, imgWidth: 13 },
        { id: '2F', label: 'Room 6', type: 'vip', x: 35.75, y: 49, imgWidth: 13 },
        { id: '2G', label: 'Room 7', type: 'vip', x: 46, y: 49, imgWidth: 13 },
        { id: '2H', label: 'Room 8', type: 'vip', x: 56.5, y: 49, imgWidth: 13 },
      ],
      sectionName: 'OLDIES',
      doorImage: '/assets/door2.png',
    },
    section3: {
      doors: [
        { id: '3A', label: 'Room 1', type: 'vip', x: 31, y: 67, imgWidth: 8 },
        { id: '3B', label: 'Room 2', type: 'vip', x: 43.5, y: 67, imgWidth: 8 },
        { id: '3C', label: 'Room 3', type: 'vip', x: 55.75, y: 67, imgWidth: 8 },
        { id: '3D', label: 'Room 4', type: 'vip', x: 31, y: 77, imgWidth: 8 },
        { id: '3E', label: 'Room 5', type: 'vip', x: 43.5, y: 77, imgWidth: 8 },
        { id: '3F', label: 'Room 6', type: 'vip', x: 55.75, y: 77, imgWidth: 8 },
        { id: '3G', label: 'Room 7', type: 'vip', x: 35 , y: 87, imgWidth: 8 },
        { id: '3H', label: 'Room 8', type: 'vip', x: 51, y: 87 , imgWidth: 8 },
      ],
      sectionName: 'TLs/MMs',
      doorImage: '/assets/door3.png',
    },
  };

  // Get all doors from all sections with their section info
  const allDoors = Object.entries(doorConfig).flatMap(([sectionKey, section]) =>
    section.doors.map(door => ({
      ...door,
      sectionKey,
      doorImage: section.doorImage,
      sectionName: section.sectionName,
    }))
  );

  const getDoorContainerStyles = (door) => {
    const width = door.imgWidth || 10;
    
    return {
      position: 'absolute',
      left: `${door.x}%`,
      top: `${door.y}%`,
      width: `${width}%`,
      height: 'auto',
      cursor: door.available === false ? 'not-allowed' : 'pointer',
      zIndex: 10,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '0px',
      opacity: door.available === false ? 0.6 : 1,
    };
  };

  const getImageStyles = (door, isHovered) => {
    const scale = isHovered ? 1.15 : 1;

    return {
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
      border: 'none',
      outline: 'none',
      borderRadius: '0',
      boxShadow: 'none',
      background: 'none',
      transition: 'all 0.3s ease',
      zIndex: isHovered ? 20 : 10,
      opacity: door.opacity !== undefined ? door.opacity : 1,
      transform: `scale(${scale})`,
    };
  };

  const getLabelStyles = (door, isHovered) => {
    const isShared = door.capacity !== undefined;
    const isFull = door.available === false;

    return {
      fontSize: isShared ? 'clamp(10px, 0.7vw, 14px)' : 'clamp(12px, 0.8vw, 16px)',
      fontWeight: 'bold',
      color: isFull ? '#ff4444' : '#A89A7A',
      fontFamily: "'Pieces of Eight', serif",
      textShadow: '0 2px 8px #17424A',
      opacity: isHovered ? 1 : 0.8,
      background: isFull ? 'rgba(255,68,68,0.2)' : '#08161B',
      padding: isShared ? '4px 8px' : '2px 8px',
      borderRadius: '4px',
      whiteSpace: isShared ? 'normal' : 'nowrap',
      pointerEvents: 'none',
      zIndex: 25,
      transition: 'all 0.3s ease',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      marginTop: '2px',
      flexShrink: 0,
      letterSpacing: '1px',
      width: 'auto',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      lineHeight: '1.3',
      maxWidth: '120%',
    };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto',
        overflow: 'visible',
        animation: 'float 4s ease-in-out infinite',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '177.78%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
      >
        <img
          src="/assets/ship-deck.png"
          alt="Ship Deck"
          style={{
            position: 'absolute',
            top: 0,
            left: '5%',
            width: 'auto',
            height: '100%',
            maxWidth: 'none',
            maxHeight: '100%',
            objectFit: 'cover',
            transform: 'translateX(-50%)',
            animation: 'float 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Section Labels */}
      {Object.entries(doorConfig).map(([key, section]) => {
        const avgY = section.doors.reduce((sum, door) => sum + door.y, 0) / section.doors.length;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: '10%',
              top: `${avgY + 2}%`,
              color: '#B7A98A',
              fontFamily: "'Pieces of Eight', serif",
              fontSize: 'clamp(16px, 1.5vw, 28px)',
              textShadow: '0 2px 8px #08161B',
              opacity: 1,
              letterSpacing: '2px',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            {section.sectionName}
          </div>
        );
      })}

      {/* Doors */}
      {allDoors.map((door) => {
        const isHovered = hoveredDoor === door.id;
        const containerStyles = getDoorContainerStyles(door);
        const imageStyles = getImageStyles(door, isHovered);
        const labelStyles = getLabelStyles(door, isHovered);
        const isShared = door.capacity !== undefined;
        const isFull = door.available === false;

        return (
          <div
            key={door.id}
            onClick={() => onDoorClick?.(door)}
            onMouseEnter={() => setHoveredDoor(door.id)}
            onMouseLeave={() => setHoveredDoor(null)}
            style={containerStyles}
          >
            <img
              src={door.doorImage}
              alt={`Door ${door.id}`}
              style={imageStyles}
              onError={(e) => {
                console.log(`Failed to load: ${door.doorImage}`);
                e.target.style.display = 'none';
              }}
            />
            
            <div style={labelStyles}>
              <div>{door.label}</div>
              {isShared && (
                <div style={{
                  fontSize: 'clamp(8px, 0.5vw, 11px)',
                  color: isFull ? '#ff4444' : '#B7A98A',
                  marginTop: '2px',
                }}>
                  {isFull ? '🔴 FULL' : `🟢 ${door.current}/${door.capacity}`}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}