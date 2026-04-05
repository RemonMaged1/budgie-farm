export interface Bird {
  id: string;
  ringNumber: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  mutation: string;
  birthDate: string;
  status: 'available' | 'paired' | 'sick' | 'sold' | 'dead';
  fatherId?: string;
  motherId?: string;
  weight?: number;
  notes?: string;
  photoUrl?: string;
  addedDate: string;
  cageNumber?: string;
}

export interface Pair {
  id: string;
  maleId: string;
  femaleId: string;
  pairDate: string;
  cageNumber: string;
  status: 'active' | 'separated' | 'resting';
  notes?: string;
}

export interface BreedingRecord {
  id: string;
  pairId: string;
  eggDate: string;
  eggCount: number;
  fertileEggs: number;
  expectedHatchDate: string;
  actualHatchDate?: string;
  hatchedCount: number;
  expectedWeanDate?: string;
  actualWeanDate?: string;
  chickIds: string[];
  status: 'eggs' | 'hatching' | 'feeding' | 'weaned' | 'failed';
  notes?: string;
}

export interface HealthRecord {
  id: string;
  birdId: string;
  date: string;
  type: 'checkup' | 'illness' | 'treatment' | 'vaccination' | 'weight';
  description: string;
  treatment?: string;
  weight?: number;
  notes?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  birdId?: string;
}

export interface Alert {
  id: string;
  type: 'hatch' | 'wean' | 'inbreeding' | 'health' | 'general';
  message: string;
  date: string;
  relatedId?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type Page = 'dashboard' | 'birds' | 'pairs' | 'breeding' | 'family' | 'health' | 'finance' | 'alerts';
