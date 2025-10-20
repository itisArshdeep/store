import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

export async function GET() {
  try {
    await connectDB();
    
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, basePrice, hasWeightPricing, description, category, isBestseller, image } = body;

    // Validate required fields
    if (!name || !basePrice) {
      return NextResponse.json(
        { success: false, error: 'Name and base price are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new product
    const newProduct = new Product({
      name,
      basePrice: parseFloat(basePrice),
      hasWeightPricing: hasWeightPricing || false,
      description: description || '',
      category: category || 'snacks',
      isBestseller: isBestseller || false,
      available: true,
      image: image || ''
    });

    await newProduct.save();

    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
