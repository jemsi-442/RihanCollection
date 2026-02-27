let cloudinaryV2;

try {
  const cloudinaryModule = await import("cloudinary");
  cloudinaryV2 = cloudinaryModule.default.v2;

  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} catch (error) {
  console.warn(
    "[cloudinary] Package not available. Product image upload endpoints will be disabled until dependency is installed."
  );

  cloudinaryV2 = {
    uploader: {
      upload_stream: () => {
        throw new Error(
          "Cloudinary SDK is not installed. Run: npm install --prefix server"
        );
      },
    },
  };
}

export default cloudinaryV2;
