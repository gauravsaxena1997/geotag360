import { User, UserRole } from '../types';

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Rajesh Kumar',
    username: 'worker',
    role: UserRole.FIELD_WORKER,
    district: 'Jaipur',
    block: 'Sanganer'
  },
  {
    id: 'a1',
    name: 'Amit Verma',
    username: 'admin',
    role: UserRole.ADMIN,
    district: 'Jaipur'
  }
];

const STORAGE_KEY = 'geotag_auth_user';

export const authService = {
  login: async (username: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(u => u.username === username);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};