// components/NetworkGraph/GraphControls.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GraphControlsProps {
  onAddNode: (roomType: string) => void;
  onAddEdge: () => void;
  onDownloadPNG: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// Hard-coded list of possible rooms
const ROOM_TYPES = [
  'bedroom',
  'bathroom',
  'living',
  'kitchen',
  'balcony',
  'entrance',
  'dining',
  'study',
  'storage',
  'outside',
];

export const GraphControls: React.FC<GraphControlsProps> = ({
  onAddNode,
  onAddEdge,
  onDownloadPNG,
  onGenerate,
  isGenerating,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRoomClick = (room: string) => {
    onAddNode(room);
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      {/* Add Node */}
      <div className="relative">
        <Button variant="outline" onClick={() => setMenuOpen(!menuOpen)} className="w-full">
          Add Node
        </Button>
        {menuOpen && (
          <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow">
            {ROOM_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleRoomClick(type)}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Edge */}
      <Button variant="outline" onClick={onAddEdge}>
        Add Edge
      </Button>

      {/* Generate Layout */}
      <Button 
        onClick={onGenerate}
        variant="default"
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Layout'}
      </Button>

      {/* Download PNG */}
      <Button onClick={onDownloadPNG} variant="outline">
        Download Graph
      </Button>
    </div>
  );
};
