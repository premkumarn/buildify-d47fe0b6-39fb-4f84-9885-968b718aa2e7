
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF. Please try again later.');
    setLoading(false);
  };

  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[500px] border rounded-md overflow-hidden">
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
      
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full h-full"
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default PdfViewer;

export default PdfViewer;