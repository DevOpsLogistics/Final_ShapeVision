import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock low-confidence queue
  const queue = [
    {
      id: 'al-1',
      imageUrl: '/mocks/square-drawn.png', // In reality, S3/Cloud Storage URL
      prediction: { label: 'Hình chữ nhật', confidence: 0.61 },
      options: ['Hình vuông', 'Hình tròn', 'Hình tam giác']
    },
    {
      id: 'al-2',
      imageUrl: '/mocks/ellipse-drawn.png',
      prediction: { label: 'Hình elip', confidence: 0.58 },
      options: ['Hình vuông', 'Hình tròn', 'Hình tam giác', 'Hình elip']
    },
    {
      id: 'al-3',
      imageUrl: '/mocks/triangle-drawn.png',
      prediction: { label: 'Hình tam giác', confidence: 0.70 },
      options: ['Hình vuông', 'Hình tròn', 'Hình tam giác']
    }
  ];

  return NextResponse.json(
    { queue },
    { status: 200 }
  );
}
