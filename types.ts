export enum UserRole {
  FIELD_WORKER = 'FIELD_WORKER',
  ADMIN = 'ADMIN',
}

export enum TapStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  district?: string;
  block?: string;
}

export interface TapConnectionRecord {
  id: string;
  householdId: string;
  village: string;
  block: string;
  district: string;
  latitude: number;
  longitude: number;
  capturedAt: string; // ISO timestamp
  photo1Url: string;
  photo2Url: string;
  status: TapStatus;
  createdByUserId: string;
  createdByName: string;
  rejectionReason?: string;
  rejectionComment?: string;
}

export interface TapConnectionDraft extends Omit<TapConnectionRecord, 'id' | 'status' | 'capturedAt'> {
  localId: string;
  savedAt: string;
}

export interface FilterParams {
  status?: TapStatus | 'ALL';
  block?: string;
  district?: string;
}