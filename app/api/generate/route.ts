import { NextResponse } from 'next/server';
import { validateGraphData } from '@/lib/utils/validation';
import { PythonBridge } from '@/python/bridge';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validated = validateGraphData(data);

    // Use the Python bridge directly to generate the layout
    const pythonBridge = PythonBridge.getInstance();
    const result = await pythonBridge.generateLayout(validated);

    if (!result.success) {
      throw new Error(result.error || 'Layout generation failed');
    }

    // Ensure we only return up to 5 layouts and include logs for debugging
    const layouts = Array.isArray(result.layouts) ? result.layouts.slice(0, 5) : [];
    const payload = { success: true, layouts, logs: result.logs };
    console.log('Returning payload for /api/generate:', { layoutsCount: layouts.length });
    return NextResponse.json(payload);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: String(error),
      success: false
    }, { status: 500 });
  }
}