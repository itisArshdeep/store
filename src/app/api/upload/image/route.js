import { NextResponse } from 'next/server';
import { uploadImage } from '../../../../lib/gridfs';

export async function POST(request) {
  try {
    console.log('Image upload request received');
    
    const formData = await request.formData();
    const file = formData.get('image');
    
    console.log('File received:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No file');
    
    if (!file) {
      console.log('No image file provided');
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('File size too large:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    console.log('Converting file to buffer...');
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('Buffer created, size:', buffer.length);
    
    // Upload to GridFS
    console.log('Starting GridFS upload...');
    const imageId = await uploadImage({
      buffer,
      originalname: file.name,
      mimetype: file.type,
      size: file.size
    }, filename);
    
    console.log('Upload successful, imageId:', imageId);
    
    return NextResponse.json({
      success: true,
      data: {
        imageId,
        filename,
        url: `/api/images/${imageId}`
      }
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to upload image: ${error.message}` },
      { status: 500 }
    );
  }
}
