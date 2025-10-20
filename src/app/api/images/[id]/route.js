import { NextResponse } from 'next/server';
import { getImageStream, getImageInfo } from '../../../../lib/gridfs';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }
    
    // Get image info
    const imageInfo = await getImageInfo(id);
    if (!imageInfo) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Get image stream
    const imageStream = await getImageStream(id);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of imageStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Return image with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': imageInfo.metadata?.mimetype || 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
    
  } catch (error) {
    console.error('Image retrieval error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to retrieve image: ${error.message}` },
      { status: 500 }
    );
  }
}
