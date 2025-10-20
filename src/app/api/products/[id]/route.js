import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, basePrice, hasWeightPricing, description, category, isBestseller, available, image } = body;

    await connectDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product fields
    if (name !== undefined) product.name = name;
    if (basePrice !== undefined) product.basePrice = parseFloat(basePrice);
    if (hasWeightPricing !== undefined) product.hasWeightPricing = hasWeightPricing;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (isBestseller !== undefined) product.isBestseller = isBestseller;
    if (available !== undefined) product.available = available;
    if (image !== undefined) product.image = image;

    await product.save();

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Permanently delete the product
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
