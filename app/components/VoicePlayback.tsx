'use client';

import { useCallback, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

interface VoicePlaybackProps {
  text: string;
}

export default function VoicePlayback({ text }: VoicePlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const playVoice = useCallback(async () => {
    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play voice:', error);
      setIsPlaying(false);
    }
  }, [text, isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <>
      <audio 
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={() => setIsPlaying(false)}
      />
      <button
        onClick={playVoice}
        className="btn btn-link p-0 d-flex align-items-center justify-content-center"
        style={{ 
          width: '36px', 
          height: '36px', 
          minWidth: '36px',
          borderRadius: '50%',
          transition: 'background-color 0.2s ease'
        }}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
    </>
  );
} 