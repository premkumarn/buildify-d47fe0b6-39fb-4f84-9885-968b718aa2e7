
import React, { useState, useEffect } from 'react';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { Resource } from '@/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  resource: Resource;
  onView?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ resource, onView }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        
        // Get the public URL for the PDF
        const url = getPublicUrl('resources', resource.file_path);
        setPdfUrl(url);
        
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
    
    loadPdf();
  }, [resource, onView]);

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
    <div className="w-full h-[calc(100vh-200px)] min-h-[500px] border rounded-md overflow-hidden">
      {pdfUrl && (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
          className="w-full h-full"
          title={resource.title}
        />
      )}
    </div>
  );
};

export default PdfViewer;