// components/DisplayPanel/LayoutExporter.tsx

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface LayoutExporterProps {
  svgContent: string;
  index: number;
}

export default function LayoutExporter({ svgContent, index }: LayoutExporterProps) {
  const downloadSVG = useCallback(() => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent, index]);

  const downloadPNG = useCallback(async () => {
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
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `layout-${index + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };

    img.src = url;
  }, [svgContent, index]);

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button variant="ghost" size="sm" onClick={downloadSVG}>
        Download SVG
      </Button>
      <Button variant="ghost" size="sm" onClick={downloadPNG}>
        Download PNG
      </Button>
    </div>
  );
}
