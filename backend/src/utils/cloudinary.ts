import cloudinary from "../config/cloudinarySetup";

export const uploadImage = (
  buffer: Buffer,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        console.log("=== Cloudinary Callback ===");
        console.log("Error:", error);
        console.log("Result:", result);

        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.on("error", (err) => {
      console.log("Stream error:", err);
    });

    stream.end(buffer);
  });
};