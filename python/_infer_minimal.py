#!/usr/bin/env python3
"""
Minimal test script to verify pipeline without heavy model inference.
This generates dummy SVG output to test the entire flow.
"""
import sys
import os
import json

# Flush output immediately
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)

print("DEBUG: _infer_minimal.py starting", file=sys.stderr, flush=True)

# Parse input
if len(sys.argv) < 2 or not sys.argv[1].strip():
    print("ERROR: No input data provided", file=sys.stderr, flush=True)
    sys.exit(1)

try:
    graph_data = json.loads(sys.argv[1])
    print(f"DEBUG: Parsed graph with {len(graph_data.get('nodes', {}))} nodes", file=sys.stderr, flush=True)
except Exception as e:
    print(f"ERROR: Failed to parse JSON: {e}", file=sys.stderr, flush=True)
    sys.exit(1)

# Generate minimal SVG based on number of rooms
num_rooms = len(graph_data.get('nodes', {}))
print(f"DEBUG: Generating SVG for {num_rooms} rooms", file=sys.stderr, flush=True)

# Create a simple grid layout SVG
svg_parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">',
    '<rect width="256" height="256" fill="white"/>'
]

# Draw rectangles for each room
colors = ['#EE4D4D', '#C67C7B', '#FFD274', '#BEBEBE', '#BFE3E8', '#7BA779', '#E87A90']
room_size = 256 // max(1, int(num_rooms**0.5) + 1)

for i in range(num_rooms):
    color = colors[i % len(colors)]
    row = i // 3
    col = i % 3
    x = col * room_size
    y = row * room_size
    svg_parts.append(f'<rect x="{x}" y="{y}" width="{room_size}" height="{room_size}" fill="{color}" stroke="black" stroke-width="2"/>')

svg_parts.append('</svg>')
svg_string = '\n'.join(svg_parts)

print(f"DEBUG: SVG generated, length={len(svg_string)}", file=sys.stderr, flush=True)
print('PYTHON_START')
sys.stdout.flush()

# Output the SVG with stop marker
print('<stop>' + svg_string)
sys.stdout.flush()

print('PYTHON_DONE')
sys.stdout.flush()

print("DEBUG: _infer_minimal.py completed successfully", file=sys.stderr, flush=True)
sys.exit(0)
