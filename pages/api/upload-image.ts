import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      console.log('No image data provided');
      return res.status(400).json({ error: 'No image data provided' });
    }

    console.log('Starting Cloudinary upload...');
    
    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'farmconnect',
      resource_type: 'image',
    });

    console.log('Cloudinary upload successful:', result.public_id);
    
    res.status(200).json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    // More specific error messages
    if (error.message.includes('Invalid Cloudinary credentials')) {
      return res.status(500).json({ error: 'Cloudinary configuration error' });
    }
    if (error.message.includes('File size too large')) {
      return res.status(400).json({ error: 'File size too large' });
    }
    
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
}