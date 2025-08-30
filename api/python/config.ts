// python/config.ts
import path from 'path';

export const PYTHON_CONFIG = {
  MODEL_PATH: path.join(process.cwd(), 'python', 'pretrained_new.pth'),
  PYTHON_DIR: path.join(process.cwd(), 'python'),
  PYTHON_PATH: 'python',
  SCRIPTS: {
    INFER: '_infer.py', // keep only _infer here
  },
  ENV: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8',
    PYTHONUNBUFFERED: '1',
    PYTHONPATH: path.join(process.cwd(), 'python')
  }
};
