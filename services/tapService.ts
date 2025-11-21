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
    capturedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
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
    latitude: 26.8145,
    longitude: 75.8025,
    capturedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=3',
    photo2Url: 'https://picsum.photos/400/300?random=4',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1003',
    householdId: 'HH-206',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8150,
    longitude: 75.8030,
    capturedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=5',
    photo2Url: 'https://picsum.photos/400/300?random=6',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  // -- New Mock Data Starts Here --
  {
    id: 'TC-1004',
    householdId: 'HH-207',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8155,
    longitude: 75.8035,
    capturedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=7',
    photo2Url: 'https://picsum.photos/400/300?random=8',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1005',
    householdId: 'HH-208',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8160,
    longitude: 75.8040,
    capturedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=9',
    photo2Url: 'https://picsum.photos/400/300?random=10',
    status: TapStatus.PENDING,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1006',
    householdId: 'HH-209',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8165,
    longitude: 75.8045,
    capturedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=11',
    photo2Url: 'https://picsum.photos/400/300?random=12',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1007',
    householdId: 'HH-210',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8170,
    longitude: 75.8050,
    capturedAt: new Date(Date.now() - 86400000 * 4.5).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=13',
    photo2Url: 'https://picsum.photos/400/300?random=14',
    status: TapStatus.PENDING,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1008',
    householdId: 'HH-211',
    village: 'Rampur',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8175,
    longitude: 75.8055,
    capturedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=15',
    photo2Url: 'https://picsum.photos/400/300?random=16',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1009',
    householdId: 'HH-305',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8200,
    longitude: 75.8100,
    capturedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=17',
    photo2Url: 'https://picsum.photos/400/300?random=18',
    status: TapStatus.REJECTED, // Rejected
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar',
    rejectionReason: 'Duplicate entry'
  },
  {
    id: 'TC-1010',
    householdId: 'HH-306',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8210,
    longitude: 75.8105,
    capturedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=19',
    photo2Url: 'https://picsum.photos/400/300?random=20',
    status: TapStatus.PENDING,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1011',
    householdId: 'HH-307',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8220,
    longitude: 75.8110,
    capturedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=21',
    photo2Url: 'https://picsum.photos/400/300?random=22',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1012',
    householdId: 'HH-308',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8230,
    longitude: 75.8115,
    capturedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=23',
    photo2Url: 'https://picsum.photos/400/300?random=24',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
  },
  {
    id: 'TC-1013',
    householdId: 'HH-309',
    village: 'Gopalpura',
    block: 'Sanganer',
    district: 'Jaipur',
    latitude: 26.8240,
    longitude: 75.8120,
    capturedAt: new Date().toISOString(),
    photo1Url: 'https://picsum.photos/400/300?random=25',
    photo2Url: 'https://picsum.photos/400/300?random=26',
    status: TapStatus.APPROVED,
    createdByUserId: 'u1',
    createdByName: 'Rajesh Kumar'
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