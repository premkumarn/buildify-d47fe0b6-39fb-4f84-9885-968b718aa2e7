
import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoError = () => {
    setError('Failed to load video. Please try again later.');
    setLoading(false);
  };

  return (
    <div className="w-full aspect-video border rounded-md overflow-hidden">
      {loading && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full h-full"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        style={{ display: loading ? 'none' : 'block' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;

export default VideoPlayer;