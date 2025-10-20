import { NextResponse } from 'next/server';
import { seedProducts } from '../../../lib/seedData';

export async function POST() {
  try {
    await seedProducts();
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!'
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
