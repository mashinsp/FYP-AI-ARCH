// app/(protected)/architecture/page.tsx
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import DisplayPanel from '@/components/DisplayPanel';
import { Toast } from '@/components/ui/Toast';
import { validateGraphData } from '@/lib/utils/validation';
import TopMenu from '@/components/TopMenu';
import { allTemplates } from '@/lib/graph/templates';

const NetworkGraph = dynamic(() => import('@/components/NetworkGraph'), {
  ssr: false,
});

export default function ArchitecturePage() {
  const [generatedLayouts, setGeneratedLayouts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const handleTemplateSelect = useCallback((id: number) => {
    console.log('Selected template from top menu =>', allTemplates[id]);
    setSelectedTemplate(id);
  }, []);

  const handleGenerate = async (graphData: any) => {
    try {
      setIsGenerating(true);
      // Reset generated layouts (assume 5 slots)
      setGeneratedLayouts(Array(5).fill(''));

      const validated = validateGraphData(graphData);

      // Call your API route (which returns a JSON with an array of SVG layouts)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      if (Array.isArray(json.layouts)) {
        setGeneratedLayouts(json.layouts);
        setToast({ message: 'Layout generated successfully!', type: 'success' });
      } else {
        throw new Error('No layouts returned');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setGeneratedLayouts([]);
      setToast({
        message: err instanceof Error ? err.message : String(err),
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (index: number) => {
    try {
      const svgElement = document.querySelector(`#layout-${index} svg`) as SVGElement | null;
      if (!svgElement) {
        throw new Error('No SVG element found');
      }
      const bbox = svgElement.getBoundingClientRect();
      const MAX_SIZE = 8000;
      const scaleFactor = 2;
      const width = Math.min(bbox.width * scaleFactor, MAX_SIZE);
      const height = Math.min(bbox.height * scaleFactor, MAX_SIZE);
      if (width <= 0 || height <= 0) {
        throw new Error('SVG has zero bounding box');
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = `layout-${index + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
        setToast({ message: 'Layout exported successfully!', type: 'success' });
      };
      img.onerror = () => {
        console.error('Image failed to load for export');
        setToast({ message: 'Failed to export layout (image load error)', type: 'error' });
      };
      img.src = url;
    } catch (error) {
      console.error('Export error:', error);
      setToast({ message: (error as Error).message || 'Failed to export layout', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopMenu onSelectTemplate={handleTemplateSelect} />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">AI Architecture Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 h-[600px] flex flex-col">
              <NetworkGraph
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                selectedTemplate={selectedTemplate}
              />
            </Card>
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <Card className="p-4 flex-1">
              <DisplayPanel
                layouts={generatedLayouts}
                isGenerating={isGenerating}
                onExport={handleExport}
                onLayoutSelect={(index) => {
                  console.log('Selected layout:', index);
                }}
              />
            </Card>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
