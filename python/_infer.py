import numpy as np
import sys
import os

# Flush output immediately for debugging
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)

print("DEBUG: Starting _infer.py import phase", file=sys.stderr, flush=True)

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for headless environments
import matplotlib.pyplot as plt

print("DEBUG: matplotlib imported", file=sys.stderr, flush=True)

import torch
print("DEBUG: torch imported", file=sys.stderr, flush=True)

from viz import draw_graph, draw_masks
print("DEBUG: viz imported (draw_masks available)", file=sys.stderr, flush=True)

from models_new import Generator
print("DEBUG: models_new imported", file=sys.stderr, flush=True)

from PIL import Image
import base64
from io import BytesIO
import json
import time
from utils import fix_nodes, check_validity, get_nxgraph, get_mistakes, remove_multiple_components
import logging

print("DEBUG: All imports completed successfully", file=sys.stderr, flush=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

# enable cuDNN auto-tuner
torch.backends.cudnn.benchmark = True

# Rooms
ROOM_CLASS = {
    "living": 1, "kitchen": 2, "bedroom": 3, "bathroom": 4, "balcony": 5,
    "entrance": 6, "dining": 7, "study": 8, "storage": 10 , "front": 15,
    "unknown": 16, "interior": 17
}

def parse_json(json_data):
    nds, eds = [], []
    rooms, doors = dict(json_data["nodes"]), list(json_data["edges"])
    doors = [tuple(d) for d in doors]
    front_door_ind = -1

    # handle nodes
    for k, n in enumerate(rooms):
        if "outside" in rooms[n]:
            nds.append(ROOM_CLASS['front'])
            front_door_ind = k
        else:
            nds.append(ROOM_CLASS[rooms[n]])

    # handle 'interior' for edges not connected to 'front'
    to_add = []
    for k, l in doors:
        if k != front_door_ind and l != front_door_ind:
            nds.append(ROOM_CLASS['interior'])
            to_add.append((k, len(nds)-1))
            to_add.append((l, len(nds)-1))
    doors += to_add

    # build edges
    for k in range(len(nds)):
        for l in range(len(nds)):
            if k < l:
                if (k, l) in doors or (l, k) in doors:
                    eds.append([k, 1, l])
                else:
                    eds.append([k, -1, l])

    return np.array(nds), np.array(eds)

def load_model(checkpoint=None):
    # Use absolute path from environment or construct it relative to this script
    if checkpoint is None:
        checkpoint = os.environ.get('MODEL_PATH')
        if not checkpoint:
            # Fallback: construct path relative to this script
            script_dir = os.path.dirname(os.path.abspath(__file__))
            checkpoint = os.path.join(script_dir, 'pretrained_new.pth')
    
    print(f"DEBUG: Loading model from: {checkpoint}", file=sys.stderr, flush=True)
    print(f"DEBUG: Model file exists: {os.path.exists(checkpoint)}", file=sys.stderr, flush=True)
    
    model = Generator()
    model.load_state_dict(torch.load(checkpoint, map_location=torch.device('cpu')), strict=True)
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
    logging.info(f"Input Graph Details:")
    logging.info(f"Number of Nodes: {len(graph[0])}")
    logging.info(f"Number of Edges: {len(graph[1])}")
    logging.info(f"Using Device: {device}")

    try:
        logging.info("Initializing input...")
        z, given_masks_in, given_nds, given_eds = _init_input(graph, prev_state)

        logging.info(f"Latent Vector Shape (z): {z.shape}")
        logging.info(f"Masks Input Shape: {given_masks_in.shape}")
        logging.info(f"Nodes Input Shape: {given_nds.shape}")
        logging.info(f"Edges Input Shape: {given_eds.shape}")

        logging.info("Starting model inference...")
        with torch.no_grad():
            start_time = time.time()
            masks = model(
                z.to(device).float(),
                given_masks_in.to(device).float(),
                given_nds.to(device).float(),
                given_eds.to(device)
            )
            inference_time = time.time() - start_time
            logging.info(f"Inference completed in {inference_time:.4f} seconds")
            logging.info(f"Output Masks Shape: {masks.shape}")

            masks = masks.detach().float().cpu().numpy()

        return masks

    except Exception as e:
        logging.info(f"Error during inference: {e}")
        import traceback
        traceback.print_exc()
        raise

def run_model(graph_data):
    print("DEBUG: run_model() starting", file=sys.stderr, flush=True)
    
    fp_graph = parse_json(graph_data)
    print(f"DEBUG: Parsed graph, nodes shape={fp_graph[0].shape}, edges shape={fp_graph[1].shape}", file=sys.stderr, flush=True)
    
    G_gt = get_nxgraph(fp_graph)
    print(f"DEBUG: Created networkx graph", file=sys.stderr, flush=True)

    if len(fp_graph[0]) > 400 or len(fp_graph[1]) > 1200:
        print("ERROR: Graph too large", file=sys.stderr, flush=True)
        return  # Changed from: yield "Err"

    start_time = time.time()
    device = torch.cuda.current_device() if torch.cuda.is_available() else 'cpu'
    print(f"DEBUG: Device = {device}", file=sys.stderr, flush=True)
    
    model = load_model().to(device)
    print(f"DEBUG: Model loaded", file=sys.stderr, flush=True)
    
    model.zero_grad(set_to_none=True)

    logging.info(f"load model: --- {time.time() - start_time} seconds ---")

    real_nodes = fp_graph[0]
    all_types = sorted(list(set(real_nodes)))
    try:
        MAX_TYPES = int(os.environ.get('MAX_TYPES', '1'))
    except Exception:
        MAX_TYPES = 1
    # limit selected types to avoid long-running inner loops during dev
    max_k = min(len(all_types), MAX_TYPES)
    selected_types = [all_types[:k+1] for k in range(max_k)]

    # Allow limiting number of generation attempts via env for faster dev iterations
    try:
        MAX_GEN = int(os.environ.get('MAX_GENERATIONS', '1'))
    except Exception:
        MAX_GEN = 1

    print('PYTHON_START')
    sys.stdout.flush()

    for k in range(MAX_GEN):
        print(f"DEBUG: Starting generation iteration {k}", file=sys.stderr, flush=True)
        
        state = {'masks': None, 'fixed_nodes': []}
        masks = _infer(fp_graph, model, state, device)
        print(f"DEBUG: Initial inference done, masks shape={masks.shape}", file=sys.stderr, flush=True)
        
        _tracker = (get_mistakes(masks.copy(), real_nodes, G_gt), masks)

        for l, _types in enumerate(selected_types):
            start_time = time.time()
            _fixed_nds = (
                np.concatenate([np.where(real_nodes == _t)[0] for _t in _types])
                if len(_types) > 0 else np.array([])
            )
            state = {'masks': masks, 'fixed_nodes': _fixed_nds}
            masks = _infer(fp_graph, model, state, device)

            score = get_mistakes(masks.copy(), real_nodes, G_gt)
            if score <= _tracker[0]:
                _tracker = (score, masks.copy())

            if l % 5 == 0 and l > 0:
                state = {'masks': None, 'fixed_nodes': []}
                masks = _infer(fp_graph, model, state, device)

            if _tracker[0] == 0:
                break

        masks = _tracker[1]
        masks_list, _ = remove_multiple_components(masks)
        # Convert list of masks back to tensor
        masks = torch.tensor(np.array(masks_list), dtype=torch.float32)
        print(f"DEBUG: After remove_multiple_components, masks shape={masks.shape}", file=sys.stderr, flush=True)

        logging.info(f"runtime: --- {time.time() - start_time} seconds ---")
        logging.info(f"Using GPU: {torch.cuda.is_available()}, CUDNN Version: {torch.backends.cudnn.version()}")
        logging.info(f"Search score {_tracker[0]}")

        print(f"DEBUG: About to call draw_masks with masks shape={masks.shape}, real_nodes length={len(real_nodes)}", file=sys.stderr, flush=True)
        # Convert tensor to numpy array for draw_masks
        masks_np = masks.cpu().numpy()
        im_svg = draw_masks(masks_np, real_nodes, im_size=256)
        print(f"DEBUG: draw_masks returned, SVG length={len(str(im_svg))}", file=sys.stderr, flush=True)
        
        # Print SVG output so PythonShell captures it
        print('<stop>' + str(im_svg))
        sys.stdout.flush()
        print(f"DEBUG: SVG printed and flushed", file=sys.stderr, flush=True)

    logging.info(f"Finished run_model after {MAX_GEN} iterations")
    print('PYTHON_DONE')
    sys.stdout.flush()
    print(f"DEBUG: run_model() completed", file=sys.stderr, flush=True)
    sys.stdout.flush()


if __name__ == "__main__":
    print("DEBUG: Entering __main__ block", file=sys.stderr, flush=True)

    # Expect JSON via CLI arg from bridge (do NOT fall back to stdin to avoid blocking)
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        error_msg = "No input data provided via CLI argument."
        logging.error(error_msg)
        print(f"ERROR: {error_msg}", file=sys.stderr, flush=True)
        sys.exit(1)

    input_str = sys.argv[1]
    print(f"DEBUG: Received input via CLI arg, length={len(input_str)}", file=sys.stderr, flush=True)

    try:
        graph_data = json.loads(input_str)
        print(f"DEBUG: Parsed JSON successfully, nodes={len(graph_data.get('nodes', {}))}, edges={len(graph_data.get('edges', []))}", file=sys.stderr, flush=True)
    except Exception as e:
        error_msg = f"Failed to parse JSON: {e}"
        logging.error(error_msg)
        print(f"ERROR: {error_msg}", file=sys.stderr, flush=True)
        sys.exit(1)

    logging.info(f"Input Graph Details: nodes={len(graph_data.get('nodes', {}))}, edges={len(graph_data.get('edges', []))}")
    print(f"DEBUG: About to call run_model()", file=sys.stderr, flush=True)

    # Call run_model (it prints outputs directly)
    try:
        run_model(graph_data)
        print(f"DEBUG: run_model() completed successfully", file=sys.stderr, flush=True)
    except Exception as e:
        error_msg = f"run_model() failed: {e}"
        logging.error(error_msg)
        print(f"ERROR: {error_msg}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

    # Exit cleanly
    print(f"DEBUG: Exiting normally", file=sys.stderr, flush=True)
    sys.exit(0)
