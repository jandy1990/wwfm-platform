import { NextResponse } from 'next/server';
import { detectCategory } from '@/lib/solutions/categorization';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || 'vitamin';
  
  console.log('Testing category detection for:', term);
  
  try {
    const results = await detectCategory(term);
    return NextResponse.json({ term, results });
  } catch (error) {
    console.error('Error in test-category:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}