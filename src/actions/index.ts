'use server';

import { createSessionClient } from '@/lib/appwrite/server';

export async function getImageAction(imageId: string) {
  const { storage } = await createSessionClient();

  const [info, arrayBuffer] = await Promise.all([
    storage.getFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    }),
    storage.getFileView({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      fileId: imageId,
    }),
  ]);

  const blob = new Blob([arrayBuffer], { type: info.mimeType });

  return { info, image: { blob, arrayBuffer } };
}
