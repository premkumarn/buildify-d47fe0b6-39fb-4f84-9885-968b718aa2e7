
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Music } from 'lucide-react';
import { Resource } from '@/types';
import { Link } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getIcon = () => {
    switch (resource.resource_type) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-blue-600" />;
      case 'video':
        return <Video className="h-10 w-10 text-red-600" />;
      case 'audio':
        return <Music className="h-10 w-10 text-purple-600" />;
      default:
        return <FileText className="h-10 w-10 text-gray-600" />;
    }
  };
  
  const getTypeName = () => {
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col items-center justify-center py-4">
          {getIcon()}
          <span className="mt-2 text-sm text-gray-500">{getTypeName()}</span>
        </div>
        {resource.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{resource.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/resources/${resource.id}`}>
            View Resource
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;