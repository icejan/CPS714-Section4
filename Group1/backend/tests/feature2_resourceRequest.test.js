const request = require('supertest');
const admin = require('firebase-admin');

// Mock firebase-admin
const mockRef = {
  once: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
};
const mockDatabase = {
  ref: jest.fn(() => mockRef),
};

jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    database: jest.fn(() => mockDatabase),
  };
});

// Mock ServerValue
admin.database.ServerValue = {
  TIMESTAMP: 'mock-timestamp',
};

const app = require('../src/app');

describe('Feature#2 Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.ref.mockReturnValue(mockRef);
    mockRef.push.mockReturnValue(mockRef);
  });

  describe('Testcase #2.0: successfully book a room with additional resources', () => {
    it('should successfully book a room with additional resources', async () => {
      const bookingData = {
        roomSelected: 'Room A',
        startDate: '2023-10-28T10:00:00.000Z',
        endDate: '2023-10-28T12:00:00.000Z',
        projectorNum: 1,
        micNum: 2,
        cateringSelected: 'true',
        additionalResources: 'Whiteboard, Markers'
      };

      // Mock no existing bookings to avoid conflict
      mockRef.once.mockResolvedValue({
        val: () => ({}),
      });

      const res = await request(app)
        .post('/api/book-room')
        .send(bookingData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Room booked successfully');

      // Verify that set was called with the correct data including additionalResources
      expect(mockRef.set).toHaveBeenCalledWith(expect.objectContaining({
        projectorNum: bookingData.projectorNum,
        micNum: bookingData.micNum,
        cateringSelected: bookingData.cateringSelected,
        additionalResources: bookingData.additionalResources,
      }));
    });
  });
});
