
import React, { useState, useEffect, useRef } from 'react';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { Resource } from '@/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  resource: Resource;
  onView?: () => void;
  onProgress?: (duration: number, completed: boolean) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ resource, onView, onProgress }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        setLoading(true);
        
        // Get the public URL for the audio
        const url = getPublicUrl('resources', resource.file_path);
        setAudioUrl(url);
        
        // Record view activity
        if (onView) {
          onView();
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAudio();
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [resource, onView]);

  useEffect(() => {
    if (audioRef.current && onProgress) {
      // Set up progress tracking
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration;
        const completed = currentTime >= duration * 0.9; // Consider completed if listened to 90%
        
        onProgress(Math.floor(currentTime), completed);
      };
      
      // Update every 5 seconds
      progressInterval.current = window.setInterval(handleTimeUpdate, 5000);
      
      // Also update on pause and end
      audio.addEventListener('pause', handleTimeUpdate);
      audio.addEventListener('ended', handleTimeUpdate);
      
      return () => {
        if (progressInterval.current) {
          window.clearInterval(progressInterval.current);
        }
        audio.removeEventListener('pause', handleTimeUpdate);
        audio.removeEventListener('ended', handleTimeUpdate);
      };
    }
  }, [audioRef, onProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full border rounded-md p-4 bg-gray-50">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="w-full"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          Your browser does not support the audio tag.
        </audio>
      )}
    </div>
  );
};

export default AudioPlayer;