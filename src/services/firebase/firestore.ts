import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import { Product } from '@types/product';
import { Routine } from '@types/routine';
import { ProgressEntry } from '@types/progress';

export const createDocument = async (collectionPath: string, data: any): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionPath), {
    ...data,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getDocument = async (collectionPath: string, docId: string): Promise<any> => {
  const docRef = doc(db, collectionPath, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const getDocuments = async (collectionPath: string, constraints: QueryConstraint[] = []): Promise<any[]> => {
  const q = query(collection(db, collectionPath), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionPath: string, docId: string, data: any): Promise<void> => {
  const docRef = doc(db, collectionPath, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const deleteDocument = async (collectionPath: string, docId: string): Promise<void> => {
  const docRef = doc(db, collectionPath, docId);
  await deleteDoc(docRef);
};

export const getUserProducts = async (userId: string): Promise<Product[]> => {
  return getDocuments(`users/${userId}/products`, [orderBy('createdAt', 'desc')]);
};

export const getUserRoutines = async (userId: string): Promise<Routine[]> => {
  return getDocuments(`users/${userId}/routines`, [orderBy('createdAt', 'desc')]);
};

export const getUserProgress = async (userId: string): Promise<ProgressEntry[]> => {
  return getDocuments(`users/${userId}/progress`, [orderBy('date', 'desc')]);
};
