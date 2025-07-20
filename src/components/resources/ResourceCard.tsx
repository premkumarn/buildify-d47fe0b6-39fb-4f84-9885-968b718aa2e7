
import React from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublicUrl, formatFileSize, formatDuration } from '@/lib/supabase';
import { FileText, Video, Music, ExternalLink } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const resourceTypeIcon = () => {
    switch (resource.resource_type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-blue-500" />;
      case 'audio':
        return <Music className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  };

  const resourceTypeLabel = () => {
    switch (resource.resource_type) {
      case 'pdf':
        return 'PDF Document';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Resource';
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video bg-gray-100">
        {resource.thumbnail_url ? (
          <img 
            src={getPublicUrl('resources', resource.thumbnail_url)}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {resourceTypeIcon()}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
          {resourceTypeIcon()}
        </div>
      </div>
      
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{resource.title}</h3>
        
        <div className="text-sm text-gray-500 mb-2">
          {resourceTypeLabel()}
          {resource.file_size && (
            <span className="ml-2">({formatFileSize(resource.file_size)})</span>
          )}
          {resource.duration && (
            <span className="ml-2">({formatDuration(resource.duration)})</span>
          )}
        </div>
        
        {resource.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/resources/${resource.id}`}>
            View Resource <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;