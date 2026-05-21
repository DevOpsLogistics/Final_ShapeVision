import { NextResponse } from 'next/server';

export async function GET() {
  // Mock detection results for the multi-detect canvas
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

  const detections = [
    {
      id: 'mdet-1',
      type: 'polygon',
      subType: 'triangle',
      label: 'Tam giác đều',
      coordinates: 'x: 120, y: 340',
      points: '65,0 0,110 130,110',
      transform: 'translate(40, 90)',
      color: '#1A73E8',
      confidence: 0.96
    },
    {
      id: 'mdet-2',
      type: 'polygon',
      subType: 'square',
      label: 'Hình vuông',
      coordinates: 'x: 170, y: 20',
      width: 110,
      height: 110,
      transform: 'translate(170, 20)',
      color: '#727785',
      confidence: 0.94
    },
    {
      id: 'mdet-3',
      type: 'circle',
      label: 'Hình tròn lớn',
      coordinates: 'Bán kính: 45px',
      radius: 45,
      cx: 45,
      cy: 45,
      transform: 'translate(190, 150)',
      color: '#727785',
      confidence: 0.92
    },
    {
      id: 'mdet-4',
      type: 'circle',
      label: 'Hình tròn nhỏ',
      coordinates: 'Bán kính: 30px',
      radius: 30,
      cx: 30,
      cy: 30,
      transform: 'translate(130, 170)',
      color: '#727785',
      confidence: 0.89
    },
    {
      id: 'mdet-5',
      type: 'circle',
      label: 'Hình tròn (góc trái)',
      coordinates: 'Bán kính: 40px',
      radius: 40,
      cx: 40,
      cy: 40,
      transform: 'translate(60, 20)',
      color: '#727785',
      confidence: 0.91
    }
  ];

  return NextResponse.json({ detections });
}
