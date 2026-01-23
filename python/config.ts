import path from 'path';

// Set USE_MINIMAL_INFER=true to skip heavy model loading and just test the pipeline
const USE_MINIMAL = process.env.USE_MINIMAL_INFER === 'true';

export const PYTHON_CONFIG = {
  MODEL_PATH: path.join(process.cwd(), 'python', 'pretrained_new.pth'),
  PYTHON_DIR: path.join(process.cwd(), 'python'),
  PYTHON_PATH: 'python3',
  SCRIPTS: {
    INFER: USE_MINIMAL ? '_infer_minimal.py' : '_infer.py',
  },
  ENV: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUNBUFFERED: '1',
    PYTHONPATH: path.join(process.cwd(), 'python'),
    MAX_GENERATIONS: '2',
    MAX_TYPES: '1',
  }
};