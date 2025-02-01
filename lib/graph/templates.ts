// lib/graph/templates.ts

export const roomToColor: Record<string, string> = {
  living: '#EE4D4D',
  kitchen: '#C67C7B',
  bedroom: '#FFD274',
  bathroom: '#BEBEBE',
  balcony: '#BFE3E8',
  entrance: '#7BA779',
  dining: '#E87A90',
  study: '#FF8C69',
  storage: '#1F849B',
  outside: '#727171',
};

export const template1 = {
  nodes: [
    { id: 0, label: 'bedroom', color: '#FFD274' },
    { id: 1, label: 'bathroom', color: '#BEBEBE' },
    { id: 2, label: 'living', color: '#EE4D4D' },
    { id: 'outside', label: 'outside', color: '#727171' },
    { id: 4, label: 'balcony', color: '#BFE3E8' },
  ],
  edges: [
    { from: 0, to: 1, color: '#D3A2C7', width: 3 },
    { from: 2, to: 0, color: '#D3A2C7', width: 3 },
    { from: 2, to: 1, color: '#D3A2C7', width: 3 },
    { from: 2, to: 'outside', color: '#D3A2C7', width: 3 },
    { from: 2, to: 4, color: '#D3A2C7', width: 3 },
    { from: 0, to: 4, color: '#D3A2C7', width: 3 },
  ],
};

export const template2 = {
  nodes: [
    { id: 0, label: 'bedroom', color: '#FFD274' },
    { id: 1, label: 'bedroom', color: '#FFD274' },
    { id: 2, label: 'bathroom', color: '#BEBEBE' },
    { id: 3, label: 'bathroom', color: '#BEBEBE' },
    { id: 4, label: 'balcony', color: '#BFE3E8' },
    { id: 5, label: 'living', color: '#EE4D4D' },
    { id: 'outside', label: 'outside', color: '#727171' },
  ],
  edges: [
    { from: 5, to: 1, color: '#D3A2C7', width: 3 },
    { from: 5, to: 0, color: '#D3A2C7', width: 3 },
    { from: 5, to: 3, color: '#D3A2C7', width: 3 },
    { from: 5, to: 4, color: '#D3A2C7', width: 3 },
    { from: 'outside', to: 5, color: '#D3A2C7', width: 3 },
    { from: 0, to: 2, color: '#D3A2C7', width: 3 },
    { from: 1, to: 3, color: '#D3A2C7', width: 3 },
  ],
};

export const template3 = {
  nodes: [
    { id: 0, label: 'bedroom', color: '#FFD274' },
    { id: 1, label: 'bedroom', color: '#FFD274' },
    { id: 2, label: 'bedroom', color: '#FFD274' },
    { id: 3, label: 'bathroom', color: '#BEBEBE' },
    { id: 4, label: 'bathroom', color: '#BEBEBE' },
    { id: 5, label: 'kitchen', color: '#C67C7B' },
    { id: 6, label: 'living', color: '#EE4D4D' },
    { id: 'outside', label: 'outside', color: '#727171' },
    { id: 8, label: 'balcony', color: '#BFE3E8' },
  ],
  edges: [
    { from: 4, to: 2, color: '#D3A2C7', width: 3 },
    { from: 6, to: 0, color: '#D3A2C7', width: 3 },
    { from: 6, to: 1, color: '#D3A2C7', width: 3 },
    { from: 6, to: 2, color: '#D3A2C7', width: 3 },
    { from: 6, to: 3, color: '#D3A2C7', width: 3 },
    { from: 6, to: 5, color: '#D3A2C7', width: 3 },
    { from: 'outside', to: 6, color: '#D3A2C7', width: 3 },
    { from: 8, to: 2, color: '#D3A2C7', width: 3 },
  ],
};

// lib/graph/templates.ts (or inside NetworkGraph if you prefer)
export const allTemplates = [
  {
    // 0 => 1-Bedroom Suite
    nodes: [
      { id: 0, label: 'bedroom', color: '#FFD274' },
      { id: 1, label: 'bathroom', color: '#BEBEBE' },
      { id: 2, label: 'living', color: '#EE4D4D' },
      { id: 'outside', label: 'outside', color: '#727171' },
      { id: 4, label: 'balcony', color: '#BFE3E8' },
    ],
    edges: [
      { from: 0, to: 1, color: '#D3A2C7', width: 3 },
      { from: 2, to: 0, color: '#D3A2C7', width: 3 },
      { from: 2, to: 1, color: '#D3A2C7', width: 3 },
      { from: 2, to: 'outside', color: '#D3A2C7', width: 3 },
      { from: 2, to: 4, color: '#D3A2C7', width: 3 },
      { from: 0, to: 4, color: '#D3A2C7', width: 3 },
    ],
  },
  {
    // 1 => 2-Bedroom Suite
    nodes: [
      { id: 0, label: 'bedroom', color: '#FFD274' },
      { id: 1, label: 'bedroom', color: '#FFD274' },
      { id: 2, label: 'bathroom', color: '#BEBEBE' },
      { id: 3, label: 'bathroom', color: '#BEBEBE' },
      { id: 4, label: 'balcony', color: '#BFE3E8' },
      { id: 5, label: 'living', color: '#EE4D4D' },
      { id: 'outside', label: 'outside', color: '#727171' },
    ],
    edges: [
      { from: 5, to: 1, color: '#D3A2C7', width: 3 },
      { from: 5, to: 0, color: '#D3A2C7', width: 3 },
      { from: 5, to: 3, color: '#D3A2C7', width: 3 },
      { from: 5, to: 4, color: '#D3A2C7', width: 3 },
      { from: 'outside', to: 5, color: '#D3A2C7', width: 3 },
      { from: 0, to: 2, color: '#D3A2C7', width: 3 },
      { from: 1, to: 3, color: '#D3A2C7', width: 3 },
    ],
  },
  {
    // 2 => 3-Bedroom Suite
    nodes: [
      { id: 0, label: 'bedroom', color: '#FFD274' },
      { id: 1, label: 'bedroom', color: '#FFD274' },
      { id: 2, label: 'bedroom', color: '#FFD274' },
      { id: 3, label: 'bathroom', color: '#BEBEBE' },
      { id: 4, label: 'bathroom', color: '#BEBEBE' },
      { id: 5, label: 'kitchen', color: '#C67C7B' },
      { id: 6, label: 'living', color: '#EE4D4D' },
      { id: 'outside', label: 'outside', color: '#727171' },
      { id: 8, label: 'balcony', color: '#BFE3E8' },
    ],
    edges: [
      { from: 4, to: 2, color: '#D3A2C7', width: 3 },
      { from: 6, to: 0, color: '#D3A2C7', width: 3 },
      { from: 6, to: 1, color: '#D3A2C7', width: 3 },
      { from: 6, to: 2, color: '#D3A2C7', width: 3 },
      { from: 6, to: 3, color: '#D3A2C7', width: 3 },
      { from: 6, to: 5, color: '#D3A2C7', width: 3 },
      { from: 'outside', to: 6, color: '#D3A2C7', width: 3 },
      { from: 8, to: 2, color: '#D3A2C7', width: 3 },
    ],
  },
];


export const defaultTemplateId = 2; // e.g. use "2-bedroom suite" as default
