let imageKitClient;

async function getImageKitClient() {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not configured.');
  }
  if (!imageKitClient) {
    const { default: ImageKit } = await import('@imagekit/nodejs');
    imageKitClient = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });
  }
  return imageKitClient;
}

async function uploadImage(buffer, fileName) {
  const { default: ImageKit, toFile } = await import('@imagekit/nodejs');
  if (!process.env.IMAGEKIT_PRIVATE_KEY) throw new Error('IMAGEKIT_PRIVATE_KEY is not configured.');
  imageKitClient ||= new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

  return imageKitClient.files.upload({
    file: await toFile(buffer, fileName),
    fileName,
    folder: '/alice-public-school/gallery',
  });
}

async function deleteImage(fileId) {
  const client = await getImageKitClient();
  return client.files.delete(fileId);
}

module.exports = { uploadImage, deleteImage };
