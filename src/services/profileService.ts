import { doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { UserProfile } from '@types/user';

/**
 * Create a new user profile
 */
export const createUserProfile = async (
  userId: string,
  profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const profile = {
    ...profileData,
    id: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, profile);
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

/**
 * Update user profile (creates if doesn't exist)
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

/**
 * Delete user profile
 */
export const deleteUserProfile = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};
