import path from 'path';

// Alternative: Even simpler - just change to python3 always
export const PYTHON_CONFIG = {
  MODEL_PATH: path.join(process.cwd(), 'python', 'pretrained_new.pth'),
  PYTHON_DIR: path.join(process.cwd(), 'python'),
  PYTHON_PATH: 'python3', // ✅ Change this line only
  SCRIPTS: {
    INFER: '_infer.py',
  },
  ENV: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUNBUFFERED: '1',
    PYTHONPATH: path.join(process.cwd(), 'python')
  }
};