# api/python/generate.py - Move your Python code here
import json
import sys
import os
from http.server import BaseHTTPRequestHandler
import numpy as np
import torch
from io import StringIO
import logging

# Your existing imports and code
from viz import draw_graph, draw_masks
import matplotlib.pyplot as plt
from models_new import Generator
from PIL import Image
import base64
from io import BytesIO
import time
from utils import fix_nodes, check_validity, get_nxgraph, get_mistakes, remove_multiple_components

# Set up logging to capture output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

# Rooms mapping (your existing code)
ROOM_CLASS = {
    "living": 1, "kitchen": 2, "bedroom": 3, "bathroom": 4, "balcony": 5,
    "entrance": 6, "dining": 7, "study": 8, "storage": 10 , "front": 15,
    "unknown": 16, "interior": 17
}

# All your existing functions (parse_json, load_model, etc.)
def parse_json(json_data):
    nds, eds = [], []
    rooms, doors = dict(json_data["nodes"]), list(json_data["edges"])
    doors = [tuple(d) for d in doors]
    front_door_ind = -1

    for k, n in enumerate(rooms):
        if "outside" in rooms[n]:
            nds.append(ROOM_CLASS['front'])
            front_door_ind = k
        else:
            nds.append(ROOM_CLASS[rooms[n]])

    to_add = []
    for k, l in doors:
        if k != front_door_ind and l != front_door_ind:
            nds.append(ROOM_CLASS['interior'])
            to_add.append((k, len(nds)-1))
            to_add.append((l, len(nds)-1))
    doors += to_add

    for k in range(len(nds)):
        for l in range(len(nds)):
            if k < l:
                if (k, l) in doors or (l, k) in doors:
                    eds.append([k, 1, l])
                else:
                    eds.append([k, -1, l])

    return np.array(nds), np.array(eds)

def load_model(checkpoint='pretrained_new.pth'):
    # Model will be in the same directory as this function
    model_path = os.path.join(os.path.dirname(__file__), checkpoint)
    model = Generator()
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')), strict=True)
    return model.eval()

def one_hot_embedding(labels, num_classes=19):
    y = torch.eye(num_classes)
    return y[labels]

def _init_input(graph, prev_state=None, mask_size=64):
    nds, eds = graph
    given_nds = one_hot_embedding(nds)[:, 1:].float()
    given_eds = torch.tensor(eds).long()
    z = torch.randn(len(nds), 128).float()

    fixed_nodes = prev_state['fixed_nodes']
    prev_mks = (
        torch.zeros((given_nds.shape[0], mask_size, mask_size)) - 1.0
        if (prev_state['masks'] is None)
        else prev_state['masks']
    )
    given_masks_in = fix_nodes(prev_mks, torch.tensor(fixed_nodes))
    return z, given_masks_in, given_nds, given_eds

def _infer(graph, model, prev_state=None, device='cpu'):
    try:
        z, given_masks_in, given_nds, given_eds = _init_input(graph, prev_state)
        
        with torch.no_grad():
            masks = model(
                z.to(device).float(),
                given_masks_in.to(device).float(),
                given_nds.to(device).float(),
                given_eds.to(device)
            )
            masks = masks.detach().float().cpu().numpy()

        return masks
    except Exception as e:
        logging.error(f"Error during inference: {e}")
        raise

def run_model(graph_data):
    fp_graph = parse_json(graph_data)
    G_gt = get_nxgraph(fp_graph)

    if len(fp_graph[0]) > 400 or len(fp_graph[1]) > 1200:
        return ["Error: Graph too large"]

    device = 'cpu'  # Force CPU for Vercel
    model = load_model()
    
    real_nodes = fp_graph[0]
    all_types = sorted(list(set(real_nodes)))
    selected_types = [all_types[:k+1] for k in range(min(50, len(all_types)))]

    results = []
    
    for k in range(3):  # Reduce iterations for faster response
        state = {'masks': None, 'fixed_nodes': []}
        masks = _infer(fp_graph, model, state, device)
        _tracker = (get_mistakes(masks.copy(), real_nodes, G_gt), masks)

        for l, _types in enumerate(selected_types[:10]):  # Limit iterations
            _fixed_nds = (
                np.concatenate([np.where(real_nodes == _t)[0] for _t in _types])
                if len(_types) > 0 else np.array([])
            )
            state = {'masks': masks, 'fixed_nodes': _fixed_nds}
            masks = _infer(fp_graph, model, state, device)

            score = get_mistakes(masks.copy(), real_nodes, G_gt)
            if score <= _tracker[0]:
                _tracker = (score, masks.copy())

            if _tracker[0] == 0:
                break

        masks = _tracker[1]
        masks, _ = remove_multiple_components(masks)

        im_svg = draw_masks(masks.copy(), real_nodes, im_size=256)
        results.append(str(im_svg))

    return results

# Vercel Function Handler
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            
            # Parse JSON
            graph_data = json.loads(body.decode('utf-8'))
            
            # Run model
            layouts = run_model(graph_data)
            
            # Return response
            response = {
                'success': True,
                'layouts': layouts
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            logging.error(f"Error in handler: {e}")
            
            error_response = {
                'success': False,
                'error': str(e)
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()