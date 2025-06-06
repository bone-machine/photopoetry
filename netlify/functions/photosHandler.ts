import { Handler } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const handler: Handler = async (event) => {
  try {
    const photosFolderName = event.queryStringParameters?.photosFolderName;
    const searchQuery = photosFolderName ? `folder:${photosFolderName}` : 'resource_type=image' // Fetch all photos with resource_type=image, also could be just ''
    const searchResult = await cloudinary.search
      .expression(searchQuery)
      .sort_by('public_id', 'asc')
      .max_results(100)
      .execute();
    const photoUrls = searchResult.resources.map((file: { secure_url: string }) => file.secure_url);
    return {
      statusCode: 200,
      body: JSON.stringify(photoUrls),
    };
  } catch (err) {
    console.error('Cloudinary error: ', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ err: 'Failed to fetch photos' }),
    };
  }
};
