import { TapConnectionRecord, TapStatus } from '../types';

const STORAGE_KEY = 'geotag_taps';
const DRAFT_KEY = 'geotag_drafts';

// Initial seed data if storage is empty
const SEED_DATA: TapConnectionRecord[] = [
  {
    id: 'TC-1001',
    householdId: 'HH-204',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.814,
    longitude: 75.802,
    capturedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=1',
    photo2Url: 'https://picsum.photos/400/300?random=2',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1002',
    householdId: 'HH-205',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.820,
    longitude: 75.810,
    capturedAt: new Date(Date.now() - 86400000).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=3',
    photo2Url: 'https://picsum.photos/400/300?random=4',
    status: TapStatus.PENDING,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1003',
    householdId: 'HH-301',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.835,
    longitude: 75.790,
    capturedAt: new Date().toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=5',
    photo2Url: 'https://picsum.photos/400/300?random=6',
    status: TapStatus.REJECTED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar',
    rejectionReason: 'Image unclear',
    rejectionComment: 'Cannot verify the tap connection number.'
  }
];

const getStoredData = (): TapConnectionRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const tapService = {
  getAll: async (): Promise<TapConnectionRecord[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency
    return getStoredData();
  },

  create: async (data: Omit<TapConnectionRecord, 'id' | 'status' | 'capturedAt'>): Promise<TapConnectionRecord> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const current = getStoredData();
    const newRecord: TapConnectionRecord = {
      ...data,
      id: `TC-${1000 + current.length + 1}`,
      status: TapStatus.PENDING,
      capturedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newRecord, ...current]));
    return newRecord;
  },

  updateStatus: async (id: string, status: TapStatus, rejectionReason?: string, rejectionComment?: string): Promise<TapConnectionRecord> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = getStoredData();
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, status, rejectionReason, rejectionComment };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(x => x.id === id)!;
  }
};