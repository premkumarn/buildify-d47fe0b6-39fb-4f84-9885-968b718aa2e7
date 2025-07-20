
import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAudioLoad = () => {
    setLoading(false);
  };

  const handleAudioError = () => {
    setError('Failed to load audio. Please try again later.');
    setLoading(false);
  };

  return (
    <div className="w-full border rounded-md p-4 bg-gray-50">
      {loading && (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <audio
        ref={audioRef}
        src={url}
        controls
        className="w-full"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onLoadedData={handleAudioLoad}
        onError={handleAudioError}
        style={{ display: loading ? 'none' : 'block' }}
      >
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};

export default AudioPlayer;

export default AudioPlayer;