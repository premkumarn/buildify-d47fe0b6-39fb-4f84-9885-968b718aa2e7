
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PdfViewer from '@/components/resources/PdfViewer';
import VideoPlayer from '@/components/resources/VideoPlayer';
import AudioPlayer from '@/components/resources/AudioPlayer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ResourceView: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;
      
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('id', resourceId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError('Resource not found');
          return;
        }
        
        setResource(data);
        
        // Log user activity
        if (user) {
          await supabase.from('user_activity').insert({
            user_id: user.id,
            resource_id: resourceId,
            viewed_at: new Date().toISOString(),
          });
        }
      } catch (error: any) {
        console.error('Error fetching resource:', error);
        setError(error.message);
        toast.error(`Error loading resource: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResource();
  }, [resourceId, user]);
  
  const renderResourceViewer = () => {
    if (!resource) return null;
    
    switch (resource.resource_type) {
      case 'pdf':
        return <PdfViewer url={resource.file_path} title={resource.title} />;
      case 'video':
        return <VideoPlayer url={resource.file_path} title={resource.title} />;
      case 'audio':
        return <AudioPlayer url={resource.file_path} title={resource.title} />;
      default:
        return <div>Unsupported resource type</div>;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading resource...</div>
      </div>
    );
  }
  
  if (error || !resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error || 'Resource not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{resource.title}</h1>
      </div>
      
      {resource.description && (
        <p className="mb-6 text-gray-600">{resource.description}</p>
      )}
      
      <div className="mb-8">
        {renderResourceViewer()}
      </div>
    </div>
  );
};

export default ResourceView;