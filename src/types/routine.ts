import { Product } from './product';

export interface RoutineStep {
  id: string;
  productId: string;
  order: number;
  product?: Product;
}

export interface Routine {
  id: string;
  userId: string;
  type: 'AM' | 'PM';
  name: string;
  steps: RoutineStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
