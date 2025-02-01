// src/lib/utils/validation.ts
export interface GraphData {
  nodes: { [key: string]: string };
  edges: Array<[number, number]>;
  num_rooms?: number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const VALID_ROOM_TYPES = [
  "living",
  "kitchen",
  "bedroom",
  "bathroom",
  "balcony",
  "entrance",
  "dining",
  "study",
  "storage",
  "front",
  "unknown",
  "interior"
];

export function validateGraphData(data: any): GraphData {
  console.log('Validating graph data:', data);
  
  if (!data || typeof data !== 'object') {
    console.error('Invalid graph data format:', data);
    throw new ValidationError('Invalid graph data format');
  }

  if (!data.nodes || !Array.isArray(data.edges)) {
    console.error('Missing nodes or edges data:', { nodes: data.nodes, edges: data.edges });
    throw new ValidationError('Missing nodes or edges data');
  }

  // Validate nodes
  if (typeof data.nodes !== 'object') {
    throw new ValidationError('Nodes must be an object');
  }

  Object.entries(data.nodes).forEach(([id, roomType]) => {
    console.log('Validating node:', { id, roomType });
    if (typeof roomType !== 'string' || !VALID_ROOM_TYPES.includes(roomType)) {
      console.error('Invalid room type:', { id, roomType });
      throw new ValidationError(`Invalid room type for node ${id}: ${roomType}`);
    }
  });

  // Validate edges
  data.edges.forEach((edge: any, index: number) => {
    console.log('Validating edge:', edge);
    if (!Array.isArray(edge) || edge.length !== 2 || 
        typeof edge[0] !== 'number' || typeof edge[1] !== 'number') {
      console.error('Invalid edge format:', edge);
      throw new ValidationError(`Invalid edge format at index ${index}`);
    }
  });

  console.log('Validation successful');
  return data as GraphData;
}