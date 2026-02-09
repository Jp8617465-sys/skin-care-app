export interface Product {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other';
  ingredients: string[];
  usage: 'AM' | 'PM' | 'Both';
  purchaseDate?: Date;
  expiryDate?: Date;
  notes?: string;
  imageUrl?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
