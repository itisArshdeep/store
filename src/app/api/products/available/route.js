import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function GET() {
  try {
    await connectDB();
    
    // Only return available products for the user menu
    const products = await Product.find({ available: true }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Available products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available products' },
      { status: 500 }
    );
  }
}
