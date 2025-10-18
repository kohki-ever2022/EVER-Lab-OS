import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    roomId: string,
    file: File
  ): Promise<{ url: string; name: string; size: number }> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const timestamp = new Date().getTime();
      const uniqueFileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `chat-files/${roomId}/${uniqueFileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(currentProgress);
        },
        (uploadError) => {
          console.error("File upload error:", uploadError);
          setError(uploadError);
          setIsUploading(false);
          reject(uploadError);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setProgress(100);
            setIsUploading(false);
            resolve({
              url: downloadURL,
              name: file.name, // Store original name for display
              size: file.size,
            });
          } catch (getUrlError) {
            console.error("Error getting download URL:", getUrlError);
            setError(getUrlError as Error);
            setIsUploading(false);
            reject(getUrlError);
          }
        }
      );
    });
  };

  return {
    progress,
    error,
    isUploading,
    uploadFile,
  };
};
