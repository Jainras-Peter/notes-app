import { User as UserType, Note as NoteType } from '@shared/api';

// In-memory storage for development
let mockUsers: Array<any> = [];
let mockNotes: Array<any> = [];
let userIdCounter = 1;
let noteIdCounter = 1;

export const mockUserService = {
  async findOne(query: any) {
    const user = mockUsers.find(u => {
      if (query.email) return u.email === query.email;
      if (query.googleId) return u.googleId === query.googleId;
      if (query._id) return u._id.toString() === query._id.toString();
      if (query.$or) {
        return query.$or.some((condition: any) => {
          if (condition.email) return u.email === condition.email;
          if (condition.googleId) return u.googleId === condition.googleId;
          return false;
        });
      }
      return false;
    });
    return user || null;
  },

  async findById(id: string) {
    const user = mockUsers.find(u => u._id.toString() === id.toString());
    return user ? { ...user, select: () => ({ ...user, password: undefined, otp: undefined }) } : null;
  },

  async create(userData: any) {
    const user = {
      _id: (userIdCounter++).toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const mockUser = {
      ...user,
      save: async () => user,
    };
    
    mockUsers.push(user);
    return mockUser;
  }
};

export const mockNoteService = {
  async find(query: any) {
    let filteredNotes = mockNotes.filter(note => {
      if (query.userId) return note.userId.toString() === query.userId.toString();
      return true;
    });

    return {
      sort: () => ({
        lean: () => filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      })
    };
  },

  async create(noteData: any) {
    const note = {
      _id: (noteIdCounter++).toString(),
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockNote = {
      ...note,
      save: async () => {
        mockNotes.push(note);
        return note;
      }
    };

    return mockNote;
  },

  async findOneAndUpdate(query: any, update: any) {
    const noteIndex = mockNotes.findIndex(note => {
      return note._id.toString() === query._id.toString() && 
             note.userId.toString() === query.userId.toString();
    });

    if (noteIndex !== -1) {
      mockNotes[noteIndex] = { ...mockNotes[noteIndex], ...update, updatedAt: new Date() };
      return mockNotes[noteIndex];
    }
    return null;
  },

  async findOneAndDelete(query: any) {
    const noteIndex = mockNotes.findIndex(note => {
      return note._id.toString() === query._id.toString() && 
             note.userId.toString() === query.userId.toString();
    });

    if (noteIndex !== -1) {
      const deletedNote = mockNotes[noteIndex];
      mockNotes.splice(noteIndex, 1);
      return deletedNote;
    }
    return null;
  }
};

// Initialize with some sample data
export const getMockUsers = () => mockUsers;

export const updateMockUser = (email: string, updates: any) => {
  const userIndex = mockUsers.findIndex(u => u.email === email);
  if (userIndex >= 0) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }
  return null;
};

export const initializeMockData = () => {
  // Add a sample user
  mockUsers.push({
    _id: '1',
    email: 'demo@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj40YmKjq1qi', // "password"
    name: 'Demo User',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Add sample notes
  mockNotes.push(
    {
      _id: '1',
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can create, edit, and delete notes here.\n\nThis app is running in development mode with mock data since no MongoDB connection is available.',
      userId: '1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      _id: '2',
      title: 'Getting Started',
      content: 'Here are some tips to get started:\n\n• Click "Create Note" to add new notes\n• Use the search bar to find specific notes\n• Click the trash icon to delete notes\n\nTo use a real database, set the MONGODB_URI environment variable.',
      userId: '1',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    }
  );

  console.log('📝 Mock data initialized with demo user and sample notes');
};
