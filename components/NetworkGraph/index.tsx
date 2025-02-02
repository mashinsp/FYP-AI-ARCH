// components/NetworkGraph/index.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { Button } from '@/components/ui/button';
import { convertToModelFormat, GraphData } from '@/lib/graph/converter';
import 'vis-network/styles/vis-network.css';
import { allTemplates } from '@/lib/graph/templates';

const ROOM_TYPES = [
  'bedroom', 'bathroom', 'living', 'kitchen', 'balcony',
  'entrance', 'dining', 'study', 'storage'  // "outside" removed for consistency
];

const roomToColor: Record<string, string> = {
  bedroom: '#FFD274',
  bathroom: '#BEBEBE',
  living: '#EE4D4D',
  kitchen: '#C67C7B',
  balcony: '#BFE3E8',
  entrance: '#7BA779',
  dining: '#E87A90',
  study: '#FF8C69',
  storage: '#1F849B',
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
  // Hold the DataSets in separate refs so we can always query the latest data
  const nodesRef = useRef(new DataSet<any>(allTemplates[selectedTemplate].nodes));
  const edgesRef = useRef(new DataSet<any>(allTemplates[selectedTemplate].edges));

  const [menuOpen, setMenuOpen] = useState(false);
  // (We still keep this state for display, but we won’t rely on it for conversion)
  const [graphData, setGraphData] = useState<GraphData>(allTemplates[selectedTemplate]);

  // This function updates our local state from our DataSets.
  // (It also logs the current nodes and edges.)
  const updateStateFromNetwork = useCallback(() => {
    const nodes = nodesRef.current.get();
    const edges = edgesRef.current.get();
    console.log("Graph data updated. Nodes:", nodes, "Edges:", edges);
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
        // Add a callback for edge addition so that every added edge triggers an update
        addEdge: (data, callback) => {
          callback(data);
          updateStateFromNetwork();
        },
        editEdge: false,
        deleteNode: true,
        deleteEdge: (data, callback) => {
          callback(data);
          updateStateFromNetwork();
        },
      },
    };

    // Create network using our DataSets for nodes and edges.
    networkInstance.current = new Network(container, {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    }, options);
  }, [updateStateFromNetwork]);

  // When the selected template changes, update the DataSets and our state.
  useEffect(() => {
    const newTemplateData = allTemplates[selectedTemplate];
    nodesRef.current.clear();
    nodesRef.current.add(newTemplateData.nodes);
    edgesRef.current.clear();
    edgesRef.current.add(newTemplateData.edges);
    networkInstance.current?.setData({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });
    setGraphData(newTemplateData);
  }, [selectedTemplate]);

  const handleAddNode = useCallback((roomType: string) => {
    if (!networkInstance.current) return;
    const nodesDS = nodesRef.current;
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
    if (!networkRef.current) return;
    const canvas = networkRef.current.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = dataUrl;
    link.click();
  }, []);

  // Instead of using the (possibly stale) graphData state,
  // retrieve the latest nodes and edges directly from our DataSets.
  const handleGenerate = useCallback(async () => {
    const latestGraphData = {
      nodes: nodesRef.current.get(),
      edges: edgesRef.current.get(),
    };
    console.log("Generating layout with graphData:", latestGraphData);
    const modelData = convertToModelFormat(latestGraphData);
    await onGenerate(modelData);
  }, [onGenerate]);

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
