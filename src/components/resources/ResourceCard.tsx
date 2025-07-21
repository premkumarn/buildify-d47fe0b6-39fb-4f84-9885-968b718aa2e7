
import React from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Music, ExternalLink } from 'lucide-react';
import { formatFileSize } from '@/lib/supabase';

interface ResourceCardProps {
  resource: Resource;
  showAccessStatus?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, showAccessStatus = false }) => {
  const getResourceIcon = () => {
    switch (resource.resource_type) {
      case 'pdf':
        return <FileText className="h-12 w-12 text-blue-600" />;
      case 'video':
        return <Video className="h-12 w-12 text-red-600" />;
      case 'audio':
        return <Music className="h-12 w-12 text-purple-600" />;
      default:
        return null;
    }
  };

  const getResourceTypeBadge = () => {
    switch (resource.resource_type) {
      case 'pdf':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PDF</Badge>;
      case 'video':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Video</Badge>;
      case 'audio':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Audio</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
        {resource.thumbnail_url ? (
          <img 
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {getResourceIcon()}
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-2">
          {getResourceTypeBadge()}
          {resource.language && (
            <Badge variant="outline" className="bg-gray-50">{resource.language.name}</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
        
        {resource.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">{resource.description}</p>
        )}
        
        {resource.file_size && (
          <p className="text-xs text-gray-500">Size: {formatFileSize(resource.file_size)}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/resources/${resource.id}`}>
            View Resource
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;