import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const uploadImage = async (
  userId: string,
  path: string,
  uri: string,
  filename: string
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`);
  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const deleteImage = async (userId: string, path: string, filename: string): Promise<void> => {
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`);
  await deleteObject(storageRef);
};

export const getImageURL = async (userId: string, path: string, filename: string): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/${path}/${filename}`);
  return await getDownloadURL(storageRef);
};
