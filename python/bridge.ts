// python/bridge.ts
import { execFile } from 'child_process';
import { PYTHON_CONFIG } from './config';
import fs from 'fs-extra';
import path from 'path';

interface GenerationResult {
  success: boolean;
  layouts: string[];
  error?: string;
  logs?: string[];
}

export type PartialLayoutCallback = (svg: string, index: number) => void;

export class PythonBridge {
  private static instance: PythonBridge;
  private debugLogs: string[] = [];

  private log(message: string, type: 'info' | 'error' | 'debug' | 'warn' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    this.debugLogs.push(logMessage);
    console.log(logMessage);
  }

  static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }

  // Add Python path detection method
  private getPythonPath(): string {
    // Check if we're in Vercel environment
    if (process.env.VERCEL === '1') {
      this.log('Detected Vercel environment, using python3', 'debug');
      return 'python3';
    }
    
    // Check if we're in AWS Lambda environment
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.log('Detected AWS Lambda environment, using python3', 'debug');
      return 'python3';
    }

    // For local development, try to detect available Python
    try {
      const { execSync } = require('child_process');
      execSync('python3 --version', { stdio: 'ignore' });
      this.log('Found python3, using python3', 'debug');
      return 'python3';
    } catch (error) {
      this.log('python3 not found, falling back to python', 'debug');
      return 'python';
    }
  }

  async generateLayout(
    graphData: any,
    onPartialLayout?: PartialLayoutCallback
  ): Promise<GenerationResult> {
    try {
      this.log('Starting layout generation');
      this.log(`Input graph data: ${JSON.stringify(graphData, null, 2)}`, 'debug');

      return new Promise((resolve) => {
        const results: string[] = [];
        const errors: string[] = [];
        const MAX_LAYOUTS = 5;

        this.log(`Running Python script with args`, 'debug');
        const pythonPath = this.getPythonPath();
        const scriptPath = path.join(PYTHON_CONFIG.PYTHON_DIR, PYTHON_CONFIG.SCRIPTS.INFER);
        const graphArg = JSON.stringify(graphData);

        this.log(`Python path: ${pythonPath}`, 'debug');
        this.log(`Script path: ${scriptPath}`, 'debug');
        this.log(`Graph arg length: ${graphArg.length}`, 'debug');

        // Set a timeout to prevent hanging forever
        const timeout = setTimeout(() => {
          this.log(`Python script timed out after 120 seconds`, 'error');
          resolve({
            success: false,
            layouts: [],
            error: 'Python script execution timed out (120s)',
            logs: this.debugLogs,
          });
        }, 120000);

        // Use Node's native execFile instead of PythonShell for better control
        const child = execFile(
          pythonPath,
          [scriptPath, graphArg],
          {
            cwd: PYTHON_CONFIG.PYTHON_DIR,
            env: {
              ...process.env,
              PYTHONIOENCODING: 'utf-8',
              PYTHONUNBUFFERED: '1',
              PYTHONPATH: PYTHON_CONFIG.PYTHON_DIR,
              MODEL_PATH: PYTHON_CONFIG.MODEL_PATH,
            },
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large SVGs
            timeout: 120000, // 120 second timeout
          },
          (error, stdout, stderr) => {
            clearTimeout(timeout);

            if (stderr) {
              this.log(`Python STDERR: ${stderr}`, 'debug');
            }

            if (error) {
              this.log(`execFile error: ${error.message}`, 'error');
              if (stderr) {
                this.log(`Stderr output: ${stderr}`, 'error');
              }
              resolve({
                success: false,
                layouts: [],
                error: `Python execution failed: ${error.message}`,
                logs: this.debugLogs,
              });
              return;
            }

            // Parse stdout for SVG outputs
            const lines = stdout.split('\n');
            this.log(`Received ${lines.length} lines from Python`, 'debug');

            // Join all lines and look for SVG blocks marked with <stop>
            let fullOutput = lines.join('\n');
            let currentIndex = 0;

            while (true) {
              const stopIndex = fullOutput.indexOf('<stop>', currentIndex);
              if (stopIndex === -1) break;

              const svgStart = fullOutput.indexOf('<svg', stopIndex);
              const svgEnd = fullOutput.indexOf('</svg>', svgStart);

              if (svgStart >= 0 && svgEnd >= 0) {
                const svg = fullOutput.substring(svgStart, svgEnd + 6);
                const isValidSvg = svg.startsWith('<svg') && svg.includes('xmlns="http://www.w3.org/2000/svg"');

                if (isValidSvg) {
                  if (results.length < MAX_LAYOUTS) {
                    results.push(svg);
                    if (onPartialLayout) onPartialLayout(svg, results.length - 1);
                    this.log(`Captured SVG layout #${results.length}, length=${svg.length}`, 'info');
                  }
                  currentIndex = svgEnd + 6;
                } else {
                  currentIndex = svgStart + 4;
                }
              } else {
                break;
              }
            }

            if (results.length === 0) {
              this.log(`No SVGs found in output`, 'warn');
              // Debug: show what we got
              lines.forEach((line, idx) => {
                this.log(`Line ${idx}: ${line.substring(0, 100)}...`, 'debug');
              });
            }

            this.log(`Python run completed, captured ${results.length} layouts`, 'info');
            resolve({ success: true, layouts: results, logs: this.debugLogs });
          }
        );
      });
    } catch (error) {
      this.log(`Generation error: ${error}`, 'error');
      return {
        success: false,
        layouts: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        logs: this.debugLogs,
      };
    }
  }
}