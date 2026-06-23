// src/components/AudioControl.jsx
import { useAudio } from '../context/AudioContext';

export default function AudioControl() {
  const { audioEnabled, toggleAudio } = useAudio();

  if (audioEnabled === null) return null;

  return (
    <button
      onClick={toggleAudio}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,240,210,0.2)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        color: 'rgba(255,240,210,0.7)',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={audioEnabled ? 'Mute' : 'Unmute'}
    >
      {audioEnabled ? '♪' : '♩'}
    </button>
  );
}