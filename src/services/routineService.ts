import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { Routine, RoutineStep } from '@types/routine';

/**
 * Create a new routine for a user
 */
export const createRoutine = async (
  userId: string,
  routineData: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const routineRef = doc(collection(db, `users/${userId}/routines`));

  const routine: any = {
    userId,
    name: routineData.name,
    type: routineData.type,
    steps: routineData.steps,
    isActive: routineData.isActive || false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(routineRef, routine);
  return routineRef.id;
};

/**
 * Get all routines for a user
 */
export const getUserRoutines = async (userId: string): Promise<Routine[]> => {
  const routinesRef = collection(db, `users/${userId}/routines`);
  const q = query(routinesRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      type: data.type,
      steps: data.steps || [],
      isActive: data.isActive || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Routine;
  });
};

/**
 * Get a specific routine by ID
 */
export const getRoutineById = async (
  userId: string,
  routineId: string
): Promise<Routine | null> => {
  const routineRef = doc(db, `users/${userId}/routines`, routineId);
  const routineSnap = await getDoc(routineRef);

  if (!routineSnap.exists()) {
    return null;
  }

  const data = routineSnap.data();
  return {
    id: routineSnap.id,
    userId: data.userId,
    name: data.name,
    type: data.type,
    steps: data.steps || [],
    isActive: data.isActive || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Routine;
};

/**
 * Update an existing routine
 */
export const updateRoutine = async (
  userId: string,
  routineId: string,
  updates: Partial<Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const routineRef = doc(db, `users/${userId}/routines`, routineId);

  const updateData: any = {
    updatedAt: Timestamp.now(),
  };

  // Only include fields that are defined
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.steps !== undefined) updateData.steps = updates.steps;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

  await updateDoc(routineRef, updateData);
};

/**
 * Delete a routine
 */
export const deleteRoutine = async (
  userId: string,
  routineId: string
): Promise<void> => {
  const routineRef = doc(db, `users/${userId}/routines`, routineId);
  await deleteDoc(routineRef);
};

/**
 * Set a routine as active (and deactivate others of the same type)
 */
export const setActiveRoutine = async (
  userId: string,
  routineId: string,
  routineType: 'AM' | 'PM'
): Promise<void> => {
  // First, deactivate all routines of the same type
  const routinesRef = collection(db, `users/${userId}/routines`);
  const q = query(routinesRef, where('type', '==', routineType));
  const querySnapshot = await getDocs(q);

  const updatePromises = querySnapshot.docs.map(doc => {
    const routineRef = doc.ref;
    return updateDoc(routineRef, { isActive: false, updatedAt: Timestamp.now() });
  });

  await Promise.all(updatePromises);

  // Then, activate the selected routine
  const routineRef = doc(db, `users/${userId}/routines`, routineId);
  await updateDoc(routineRef, { isActive: true, updatedAt: Timestamp.now() });
};

/**
 * Get active routine for a specific type (AM or PM)
 */
export const getActiveRoutine = async (
  userId: string,
  routineType: 'AM' | 'PM'
): Promise<Routine | null> => {
  const routinesRef = collection(db, `users/${userId}/routines`);
  const q = query(
    routinesRef,
    where('type', '==', routineType),
    where('isActive', '==', true)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    name: data.name,
    type: data.type,
    steps: data.steps || [],
    isActive: data.isActive || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Routine;
};
