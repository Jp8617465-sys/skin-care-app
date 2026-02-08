export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  skinConcerns?: string[];
  createdAt: Date;
}
