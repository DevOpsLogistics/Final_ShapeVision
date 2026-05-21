import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, drawingData } = body;

    if (!drawingData) {
      return NextResponse.json(
        { message: 'Drawing data is required' },
        { status: 400 }
      );
    }

    // Mock AI Evaluation processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock evaluation result
    const evaluation = {
      score: 88, // out of 100
      feedback: 'Cạnh bên trái hơi lệch so với cạnh bên phải.',
      isPassed: true
    };

    return NextResponse.json(
      { 
        message: 'Evaluation successful', 
        evaluation 
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
