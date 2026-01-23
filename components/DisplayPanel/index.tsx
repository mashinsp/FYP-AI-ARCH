import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface DisplayPanelProps {
  layouts: string[];
  isGenerating: boolean;
  onLayoutSelect?: (index: number) => void;
  onExport?: (index: number) => void;
}

function reformatSVG(svgString: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (svg) {
      const width = svg.getAttribute("width") || "256";
      const height = svg.getAttribute("height") || "256";
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("class", "w-full h-full");
      return new XMLSerializer().serializeToString(svg);
    }
  } catch (error) {
    console.error("Error reformatting SVG:", error);
  }
  return svgString;
}

export default function DisplayPanel({ 
  layouts = [], 
  isGenerating,
  onLayoutSelect,
  onExport 
}: DisplayPanelProps) {
  const [selectedMainIndex, setSelectedMainIndex] = useState(0);
  const displayRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    console.log('DisplayPanel useEffect: layouts changed', layouts.length);
    layouts.forEach((svgContent, index) => {
      console.log(`Layout ${index}: ${svgContent?.length || 0} chars`);
      if (displayRefs.current[index] && svgContent) {
        try {
          const formattedSVG = reformatSVG(svgContent);
          displayRefs.current[index]!.innerHTML = formattedSVG;
        } catch (error) {
          console.error(`Error rendering layout ${index}:`, error);
        }
      }
    });
  }, [layouts]);

  const handleThumbnailClick = (index: number) => {
    if (!layouts[index]) return;
    setSelectedMainIndex(index);
    onLayoutSelect?.(index);
  };

  const SVGContainer = ({ content, className = "" }: { content: string; className?: string }) => (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div 
        className="w-full h-full"
        dangerouslySetInnerHTML={{ 
          __html: reformatSVG(content)
        }}
      />
    </div>
  );

  const downloadSVG = useCallback(() => {
    const svgContent = layouts[selectedMainIndex];
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${selectedMainIndex + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedMainIndex, layouts]);

  const downloadPNG = useCallback(() => {
    const svgContent = layouts[selectedMainIndex];
    if (!svgContent) return;

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = `layout-${selectedMainIndex + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dlUrl);
      }, 'image/png');
    };
    img.src = url;
  }, [selectedMainIndex, layouts]);

  return (
    <CardContent className="h-full flex flex-col p-0">
      {/* Main Preview - Takes up most of the space */}
      <div className="relative flex-1 min-h-[400px] border-b border-gray-200 bg-white">
        {layouts[selectedMainIndex] ? (
          <SVGContainer 
            content={layouts[selectedMainIndex]} 
            className="absolute inset-0 p-4"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            {isGenerating ? (
              <div className="spinner animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <div className="text-gray-400 text-sm">No layout detected</div>
            )}
          </div>
        )}
        
        {/* Export buttons - Positioned at the bottom */}
        {layouts[selectedMainIndex] && !isGenerating && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button variant="ghost" size="sm" onClick={downloadSVG}>
              SVG
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadPNG}>
              PNG
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnails Strip - Fixed height at bottom */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-5 gap-3 h-24">
          {Array(5).fill(null).map((_, index) => (
            <div
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`
                relative rounded-md bg-white border overflow-hidden cursor-pointer
                transition-all duration-200 ease-in-out
                ${index === selectedMainIndex ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-blue-300'}
                ${layouts[index] ? '' : 'bg-gray-50'}
              `}
            >
              {layouts[index] ? (
                <SVGContainer content={layouts[index]} className="p-1" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="spinner animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  ) : (
                    <span className="text-gray-300 text-xs">{index + 1}</span>
                  )}
                </div>
              )}
              {layouts[index] && !isGenerating && (
                <div className="absolute top-0.5 right-0.5 text-green-500 text-sm">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  );
}