
import React from 'react';
import { Link } from 'react-router-dom';
import { Kit } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublicUrl } from '@/lib/supabase';
import { Package, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KitCardProps {
  kit: Kit;
  hasAccess?: boolean;
}

const KitCard: React.FC<KitCardProps> = ({ kit, hasAccess }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video bg-gray-100">
        {kit.thumbnail_url ? (
          <img 
            src={getPublicUrl('kits', kit.thumbnail_url)}
            alt={kit.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">
          Grade {kit.grade}
        </Badge>
      </div>
      
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-2">{kit.title}</h3>
        
        {kit.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{kit.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant={hasAccess ? "default" : "outline"}>
          <Link to={`/kits/${kit.id}`}>
            {hasAccess ? 'View Kit' : 'Kit Details'} 
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KitCard;