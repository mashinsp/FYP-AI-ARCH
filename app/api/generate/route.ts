// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { PythonBridge } from '@/python/bridge'; 
import { validateGraphData } from '@/lib/utils/validation';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Validate data if needed
    const validated = validateGraphData(data);

    // Now call Python from your server environment
    const bridge = PythonBridge.getInstance();
    // We'll do a final, single result (no partial callback).
    const result = await bridge.generateLayout(validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Generation failed' }, { status: 500 });
    }

    return NextResponse.json({
      layouts: result.layouts,
      logs: result.logs,
    });
  } catch (error) {
    console.error('API Error in /api/generate:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
