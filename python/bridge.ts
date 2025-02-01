// python/bridge.ts
import { PythonShell, Options as PythonShellOptions } from 'python-shell';
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

  private log(message: string, type: 'info' | 'error' | 'debug' = 'info') {
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

  private getPythonOptions(scriptName: string): PythonShellOptions {
    const options = {
      mode: 'text' as const,
      pythonPath: PYTHON_CONFIG.PYTHON_PATH,
      pythonOptions: ['-u'],
      scriptPath: PYTHON_CONFIG.PYTHON_DIR,
      env: {
        ...PYTHON_CONFIG.ENV,
        PYTHONPATH: PYTHON_CONFIG.PYTHON_DIR,
        MODEL_PATH: PYTHON_CONFIG.MODEL_PATH,
      },
    };
    this.log(`Python options for ${scriptName}: ${JSON.stringify(options, null, 2)}`, 'debug');
    return options;
  }

  async generateLayout(
    graphData: any,
    onPartialLayout?: PartialLayoutCallback
  ): Promise<GenerationResult> {
    try {
      this.log('Starting layout generation');
      this.log(`Input graph data: ${JSON.stringify(graphData, null, 2)}`, 'debug');

      return new Promise((resolve) => {
        const pyshell = new PythonShell(
          PYTHON_CONFIG.SCRIPTS.INFER,
          this.getPythonOptions(PYTHON_CONFIG.SCRIPTS.INFER)
        );

        const results: string[] = [];
        const errors: string[] = [];

        this.log(`Sending graph data to Python script`, 'debug');
        pyshell.send(JSON.stringify(graphData));

        pyshell.on('message', (message) => {
          this.log(`Python STDOUT: ${message}`, 'debug');

          // Check if the message contains an SVG chunk.
          if (message.includes('<svg') && message.includes('</svg>')) {
            const svgStart = message.indexOf('<svg');
            const svgEnd = message.indexOf('</svg>') + 6;
            const svg = message.substring(svgStart, svgEnd);

            const isValidSvg =
              svg.startsWith('<svg') &&
              svg.endsWith('</svg>') &&
              svg.includes('width="') &&
              svg.includes('height="') &&
              svg.includes('xmlns="http://www.w3.org/2000/svg"');

            if (isValidSvg) {
              this.log('Detected valid SVG output from Python.', 'debug');
              results.push(svg);

              // Invoke the partial callback so the client can update UI immediately.
              if (onPartialLayout) {
                const layoutIndex = results.length - 1;
                onPartialLayout(svg, layoutIndex);
              }
            } else {
              const errMsg = `Invalid SVG structure: ${svg}`;
              this.log(errMsg, 'error');
              errors.push(errMsg);
            }
          }
        });

        pyshell.on('stderr', (stderr) => {
          this.log(`Python STDERR: ${stderr}`, 'error');
          errors.push(stderr);
        });

        pyshell.end((err) => {
          if (err) {
            this.log(`PythonShell error: ${err}`, 'error');
            resolve({
              success: false,
              layouts: [],
              error: err.message,
              logs: this.debugLogs,
            });
            return;
          }

          if (results.length === 0) {
            if (errors.length > 0) {
              this.log('Generation failed with errors', 'error');
              resolve({
                success: false,
                layouts: [],
                error: errors.join('\n'),
                logs: this.debugLogs,
              });
            } else {
              this.log('No layouts generated, no errors occurred', 'info');
              resolve({
                success: true,
                layouts: [],
                logs: this.debugLogs,
              });
            }
          } else {
            this.log(`Successfully generated ${results.length} layouts`, 'info');
            resolve({
              success: true,
              layouts: results,
              logs: this.debugLogs,
            });
          }
        });
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
