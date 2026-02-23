
export interface Product {
  id: string;
  description: string;
  unit: string;
}

export interface ConfigOption {
  id: string;
  name: string;
  code: string;
  multiplier: number;
  note?: string;
  altezza?: string | number;
  // Added category to allow identifying the source category during synchronization logic
  category?: string;
}

export interface ConfigCategory {
  id: string;
  categoryName: string;
  options: ConfigOption[];
  isHeightCategorized?: boolean; // Flag per attivare il filtro altezza
}

export interface CalculationResult {
  code: string;
  description: string;
  total: number;
}

export interface SavedCalculation {
  id?: string;
  userId: string;
  userName: string;
  timestamp: number;
  label: string;
  selections: Record<string, number>; // optionId -> quantity
  results: CalculationResult[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}