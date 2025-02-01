// app/api/session/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth(); // or however you get the session
    // Return just the user data you need
    return NextResponse.json({ 
      user: {
        name: session?.user?.name || 'Guest',
        email: session?.user?.email,
        image: session?.user?.image,
      },
      expires: session?.expires,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({
      user: null,
      error: 'Failed to fetch session',
    }, { status: 500 });
  }
}
