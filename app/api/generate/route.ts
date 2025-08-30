import { NextResponse } from 'next/server';
import { validateGraphData } from '@/lib/utils/validation';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validated = validateGraphData(data);

    // Call the Python function on Vercel
    const pythonFunctionUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.VERCEL_URL}/api/python/generate`
      : 'http://localhost:3000/api/python/generate';

    const response = await fetch(pythonFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      throw new Error(`Python function error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: String(error),
      fallback: "Using fallback mode" 
    }, { status: 500 });
  }
}