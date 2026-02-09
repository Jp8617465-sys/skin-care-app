export interface ProgressEntry {
  id: string;
  userId: string;
  date: Date;
  photos: string[];
  skinCondition: {
    hydration: number;
    texture: number;
    clarity: number;
    irritation: number;
  };
  notes?: string;
  concerns: string[];
  createdAt: Date;
}
