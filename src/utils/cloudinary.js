const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBuffer(buffer, folder = 'ai-kannada', resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function deleteImage(publicId) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

// Convenience wrappers
async function uploadImageBuffer(buffer, folder = 'ai-kannada') {
  return uploadBuffer(buffer, folder, 'image');
}

async function uploadVideoBuffer(buffer, folder = 'ai-kannada') {
  return uploadBuffer(buffer, folder, 'video');
}

module.exports = { cloudinary, uploadBuffer, uploadImageBuffer, uploadVideoBuffer, deleteImage };
