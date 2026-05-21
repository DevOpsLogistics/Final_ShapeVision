import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock daily quiz question
  const currentQuiz = {
    id: 'quiz-daily-123',
    questionText: 'Hãy vẽ một hình thang cân.',
    targetShape: 'Isosceles Trapezoid',
    timeLimit: 60, // seconds
  };

  return NextResponse.json(
    { quiz: currentQuiz },
    { status: 200 }
  );
}
