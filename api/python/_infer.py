import numpy as np
from viz import draw_graph, draw_masks
import matplotlib.pyplot as plt
import torch
from models_new import Generator
from PIL import Image
import base64
from io import BytesIO
import json
import sys
import time
from utils import fix_nodes, check_validity, get_nxgraph, get_mistakes, remove_multiple_components
import logging

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

def load_model(checkpoint='python/pretrained_new.pth'):
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
    fp_graph = parse_json(graph_data)
    G_gt = get_nxgraph(fp_graph)

    if len(fp_graph[0]) > 400 or len(fp_graph[1]) > 1200:
        yield "Err"
        return

    start_time = time.time()
    device = torch.cuda.current_device() if torch.cuda.is_available() else 'cpu'
    model = load_model().to(device)
    model.zero_grad(set_to_none=True)

    logging.info(f"load model: --- {time.time() - start_time} seconds ---")

    real_nodes = fp_graph[0]
    all_types = sorted(list(set(real_nodes)))
    selected_types = [all_types[:k+1] for k in range(50)]

    for k in range(5):
        state = {'masks': None, 'fixed_nodes': []}
        masks = _infer(fp_graph, model, state, device)
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
        masks, _ = remove_multiple_components(masks)

        logging.info(f"runtime: --- {time.time() - start_time} seconds ---")
        logging.info("Using GPU:", torch.cuda.is_available(), "CUDNN Version:", torch.backends.cudnn.version())
        logging.info("Search score {}".format(_tracker[0]))

        im_svg = draw_masks(masks.copy(), real_nodes, im_size=256)
        yield '<stop>' + str(im_svg)


if __name__ == "__main__":
    import sys

    # Read JSON input from stdin (PythonShell sends it)
    input_data = sys.stdin.read().strip()
    if not input_data:
        logging.info("No input data provided.")
        sys.exit(1)

    try:
        graph_data = json.loads(input_data)
    except Exception as e:
        logging.info(f"Failed to parse JSON: {e}")
        sys.exit(1)

    logging.info(f"Input Graph Details:")
    logging.info(f"Number of Nodes: ", graph_data)

    # Call run_model on that data
    for chunk in run_model(graph_data):
        logging.info(chunk)

    # Optionally: forcibly exit if the script doesn't close automatically.
    sys.exit(0)
