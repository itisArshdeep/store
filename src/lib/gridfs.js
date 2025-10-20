import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

const MONGODB_URI = 'mongodb+srv://deepsingh13131212_db_user:loubZlYNxLsyJA0V@cluster0.szr3etm.mongodb.net/santa-di-hatti?retryWrites=true&w=majority&appName=Cluster0';

let client;
let bucket;

export async function connectGridFS() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('santa-di-hatti');
    bucket = new GridFSBucket(db, { bucketName: 'product-images' });
  }
  return { client, bucket };
}

export async function uploadImage(file, filename) {
  try {
    const { bucket } = await connectGridFS();
    
    // Convert buffer to readable stream
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);
    
    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      }
    });
    
    return new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream);
      
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });
      
      uploadStream.on('finish', () => {
        console.log('Upload finished, ID:', uploadStream.id.toString());
        resolve(uploadStream.id.toString());
      });
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function getImageStream(imageId) {
  try {
    const { bucket } = await connectGridFS();
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(imageId);
    
    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      throw new Error('Image not found');
    }
    
    return bucket.openDownloadStream(objectId);
  } catch (error) {
    console.error('Error getting image stream:', error);
    throw error;
  }
}

export async function deleteImage(imageId) {
  try {
    const { bucket } = await connectGridFS();
    const objectId = new ObjectId(imageId);
    await bucket.delete(objectId);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function getImageInfo(imageId) {
  try {
    const { bucket } = await connectGridFS();
    const objectId = new ObjectId(imageId);
    const files = await bucket.find({ _id: objectId }).toArray();
    return files[0] || null;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
}
