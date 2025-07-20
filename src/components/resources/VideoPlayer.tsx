
import React, { useState, useEffect, useRef } from 'react';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { Resource } from '@/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  resource: Resource;
  onView?: () => void;
  onProgress?: (duration: number, completed: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ resource, onView, onProgress }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        
        // Get the public URL for the video
        const url = getPublicUrl('resources', resource.file_path);
        setVideoUrl(url);
        
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
    
    loadVideo();
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [resource, onView]);

  useEffect(() => {
    if (videoRef.current && onProgress) {
      // Set up progress tracking
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const completed = currentTime >= duration * 0.9; // Consider completed if watched 90%
        
        onProgress(Math.floor(currentTime), completed);
      };
      
      // Update every 5 seconds
      progressInterval.current = window.setInterval(handleTimeUpdate, 5000);
      
      // Also update on pause and end
      video.addEventListener('pause', handleTimeUpdate);
      video.addEventListener('ended', handleTimeUpdate);
      
      return () => {
        if (progressInterval.current) {
          window.clearInterval(progressInterval.current);
        }
        video.removeEventListener('pause', handleTimeUpdate);
        video.removeEventListener('ended', handleTimeUpdate);
      };
    }
  }, [videoRef, onProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
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
    <div className="w-full aspect-video border rounded-md overflow-hidden">
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full h-full"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;