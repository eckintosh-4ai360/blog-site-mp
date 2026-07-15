import { v2 as cloudinary } from 'cloudinary';

// 1. Configure Cloudinary inline
cloudinary.config({
  cloud_name: 't3wvpyo8',
  api_key: '879727156825485',
  api_secret: '2DEECi00gScMG50LInzHCVOuIOc',
  secure: true
});

async function runOnboarding() {
  try {
    console.log('Starting Cloudinary onboarding script...');

    // 2. Upload an image from Cloudinary's demo domain
    const imageUrl = 'https://res.cloudinary.com/demo/image/upload/dog.jpg';
    console.log(`Uploading image from: ${imageUrl}`);
    
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: 'cloudinary_onboarding'
    });

    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);

    // 3. Get image details by fetching metadata from Cloudinary API
    console.log('Fetching image details...');
    const details = await cloudinary.api.resource(uploadResult.public_id);
    
    console.log('Width:', details.width);
    console.log('Height:', details.height);
    console.log('Format:', details.format);
    console.log('File Size (bytes):', details.bytes);

    // 4. Transform the image
    // f_auto: Automatically selects the optimal image format (e.g., WebP, AVIF) depending on the browser.
    // q_auto: Automatically optimizes the quality to reduce file size without visible quality loss.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      secure: true,
      transformation: [
        { fetch_format: 'auto', quality: 'auto' }
      ]
    });

    console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
    console.log('Transformed URL:', transformedUrl);

  } catch (error) {
    console.error('Error during onboarding script execution:', error);
  }
}

runOnboarding();
