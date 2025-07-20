
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [scale, setScale] = useState(1);
  
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
  };
  
  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="flex-1 p-0 overflow-auto">
        <iframe
          src={`${url}#toolbar=0`}
          title={title}
          className="w-full h-full"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            height: `${100 / scale}%`,
            width: `${100 / scale}%`,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default PdfViewer;