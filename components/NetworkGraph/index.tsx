import { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Options, DataSet } from 'vis-network';
import { Button } from '@/components/ui/button';
import { convertToModelFormat, GraphData } from '@/lib/graph/converter';
import 'vis-network/styles/vis-network.css';
import { allTemplates } from '@/lib/graph/templates';

const ROOM_TYPES = [
  'bedroom', 'bathroom', 'living', 'kitchen', 'balcony',
  'entrance', 'dining', 'study', 'storage', 'outside',
];

const roomToColor = {
  bedroom: '#FFD274', bathroom: '#BEBEBE', living: '#EE4D4D',
  kitchen: '#C67C7B', balcony: '#BFE3E8', entrance: '#7BA779',
  dining: '#E87A90', study: '#FF8C69', storage: '#1F849B',
  outside: '#727171', room: '#FFD274',
};

interface NetworkGraphProps {
  onGenerate: (graphData: any) => Promise<void>;
  isGenerating: boolean;
  selectedTemplate: number;
}

export default function NetworkGraph({
  onGenerate,
  isGenerating,
  selectedTemplate,
}: NetworkGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>(() => allTemplates[selectedTemplate]);

  const updateStateFromNetwork = useCallback(() => {
    if (!networkInstance.current) return;
    const nodes = networkInstance.current.body.data.nodes?.get() || [];
    const edges = networkInstance.current.body.data.edges?.get() || [];
    setGraphData({ nodes, edges });
  }, []);

  useEffect(() => {
    if (!networkRef.current) return;

    const container = networkRef.current;
    const options: Options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      physics: { enabled: true },
      manipulation: {
        enabled: true,
        addNode: false,
        editNode: false,
        addEdge: false,
        editEdge: false,
        deleteNode: true,
        deleteEdge: (data, callback) => {
          callback(data);
          updateStateFromNetwork();
        }
      }
    };

    networkInstance.current = new Network(container, null, options);
    networkInstance.current.setData({
      nodes: graphData.nodes,
      edges: graphData.edges,
    });
  }, []);

  useEffect(() => {
    if (!networkInstance.current) return;
    const newTemplateData = allTemplates[selectedTemplate];
    networkInstance.current.setData({
      nodes: newTemplateData.nodes,
      edges: newTemplateData.edges
    });
    setGraphData(newTemplateData);
  }, [selectedTemplate]);

  const handleAddNode = useCallback((roomType: string) => {
    if (!networkInstance.current) return;
    const nodesDS = networkInstance.current.body.data.nodes as DataSet<any>;

    const existingIds = nodesDS.getIds();
    let newId = 0;
    while (existingIds.includes(newId)) {
      newId++;
    }

    const center = networkInstance.current.getViewPosition();
    const offsetX = Math.floor(Math.random() * 100 - 50);
    const offsetY = Math.floor(Math.random() * 100 - 50);

    nodesDS.add({
      id: newId,
      label: roomType,
      color: roomToColor[roomType] || '#FFD274',
      x: center.x + offsetX,
      y: center.y + offsetY,
    });

    updateStateFromNetwork();
    setMenuOpen(false);
  }, [updateStateFromNetwork]);

  const handleAddEdge = useCallback(() => {
    networkInstance.current?.addEdgeMode();
  }, []);

  const handleDownloadPNG = useCallback(() => {
    if (!networkInstance.current || !networkRef.current) return;
    const canvas = networkRef.current.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = dataUrl;
    link.click();
  }, []);

  const handleGenerate = useCallback(async () => {
    const modelData = convertToModelFormat(graphData);
    await onGenerate(modelData);
  }, [graphData, onGenerate]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg overflow-hidden">
      <div ref={networkRef} className="flex-1 min-h-[500px] border-b border-gray-200" />
      
      <div className="p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setMenuOpen(!menuOpen)}
              className="min-w-[120px]"
            >
              Add Room
            </Button>
            {menuOpen && (
              <div className="absolute bottom-full mb-2 left-0 z-10 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="py-1 max-h-[300px] overflow-y-auto">
                  {ROOM_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleAddNode(type)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button 
            variant="outline"
            onClick={handleAddEdge}
            className="min-w-[120px]"
          >
            Add Connection
          </Button>

          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="min-w-[120px]"
          >
            {isGenerating ? 'Generating...' : 'Generate Layout'}
          </Button>

          <Button 
            variant="outline"
            onClick={handleDownloadPNG}
            className="min-w-[120px]"
          >
            Download Graph
          </Button>
        </div>
      </div>
    </div>
  );
}