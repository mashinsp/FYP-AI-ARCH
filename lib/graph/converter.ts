// lib/graph/converter.ts

import { Node as VisNode, Edge as VisEdge } from 'vis-network';

export interface GraphNode extends VisNode {
  id: string | number;
  label: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface GraphEdge extends Omit<VisEdge, 'color' | 'width'> {
  from: string | number;
  to: string | number;
  color: string;
  width: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function convertToModelFormat(graphData: GraphData) {
  // Filter out the 'outside' node as it's not needed for the model
  const filteredNodes = graphData.nodes.filter(node => node.label !== 'outside');
  
  // Create a mapping of original IDs to new indices
  const idToIndex = new Map(
    filteredNodes.map((node, index) => [node.id, index])
  );

  // Convert nodes to the format expected by the model: { "0": "bedroom", "1": "bathroom", ... }
  const nodes: { [key: string]: string } = {};
  filteredNodes.forEach((node, index) => {
    // Convert node label to lowercase to match Python model's expected format
    nodes[index.toString()] = node.label.toLowerCase();
  });

  // Convert edges to the format expected by the model: [[0, 1], [1, 2], ...]
  // Filter out edges connected to 'outside' node and convert to zero-based indices
  const edges = graphData.edges
    .filter(edge => {
      const fromNode = graphData.nodes.find(n => n.id === edge.from);
      const toNode = graphData.nodes.find(n => n.id === edge.to);
      return fromNode?.label !== 'outside' && toNode?.label !== 'outside';
    })
    .map(edge => {
      const fromIndex = idToIndex.get(edge.from);
      const toIndex = idToIndex.get(edge.to);
      if (fromIndex === undefined || toIndex === undefined) {
        console.error('Invalid edge mapping:', { edge, fromIndex, toIndex });
        throw new Error('Invalid edge mapping');
      }
      return [fromIndex, toIndex];
    });

  const modelData = {
    nodes,
    edges,
  };

  console.log('Converted model data:', JSON.stringify(modelData, null, 2));
  return modelData;
}

export function convertFromModelFormat(modelOutput: any, originalGraph: GraphData) {
  // Implementation for converting model output back to graph format
  // This will be implemented when needed for handling the model's response
  return modelOutput;
}
