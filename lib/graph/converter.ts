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

/**
 * Convert graph data from the UI format to the model's expected format.
 *
 * Instead of filtering out nodes with label 'outside', we map them to 'front'
 * so that edges involving these nodes are preserved.
 */
export function convertToModelFormat(graphData: GraphData) {
  // Map any node with label "outside" to "front"
  const mappedNodes = graphData.nodes.map((node) =>
    node.label.toLowerCase() === 'outside'
      ? { ...node, label: 'front' }
      : node
  );

  // Create a mapping of original IDs to new (zero-based) indices
  const idToIndex = new Map(
    mappedNodes.map((node, index) => [node.id, index])
  );

  // Build the nodes object expected by the model
  const nodes: { [key: string]: string } = {};
  mappedNodes.forEach((node, index) => {
    nodes[index.toString()] = node.label.toLowerCase();
  });

  // Convert each edge by mapping the original IDs to new indices.
  // (No filtering is performed now, so edges involving former "outside" nodes will be included.)
  const edges = graphData.edges.map((edge) => {
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
  return modelOutput;
}
