import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, humanLabel } = body;

    if (!caseId || !humanLabel) {
      return NextResponse.json(
        { message: 'Case ID and Human Label are required' },
        { status: 400 }
      );
    }

    // In a real app, save this human label to DB for model retraining
    
    return NextResponse.json(
      { 
        message: 'Label submitted successfully. Thank you for your contribution!',
        stats: {
          contributions: 125, // Mock incremented stat
          dailyGoalProgress: 81
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
