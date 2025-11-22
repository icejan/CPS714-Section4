
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

describe('Feature#3 Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.ref.mockReturnValue(mockRef);
    mockRef.push.mockReturnValue(mockRef);
  });


  /* Test Case #3.0: */
  describe('Testcase #2.0: successfully book a room with additional resources', () => {
    it('should successfully book a room with additional resources', async () => {
      const bookingData = {
        roomSelected : 'ENG103',
        startDate: '2023-11-28T10:00:00.000Z',
        endDate: '2023-11-28T12:00:00.000Z',
        projectorNum: 1,
        micNum: 2,
        cateringSelected: 'false',
        additionalResources: 'Rulers'
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

  /* Test Case #3.1 */
  describe('Test Case #3.0: warning message appears when user tries to book room without selecting a room.', () => {
    it('should NOT successfully book a room with an empty room value', async () => {
      const bookingData = {
        roomSelected: '',
        startDate: '2023-10-28T10:00:00.000Z',
        endDate: '2023-10-28T12:00:00.000Z',
        projectorNum: 1,
        micNum: 2,
        cateringSelected: 0,
        additionalResources: 'Calculators'
      };

      // Mock no existing bookings to avoid conflict
      mockRef.once.mockResolvedValue({
        val: () => ({}),
      });

      const res = await request(app)
        .post('/api/book-room')
        .send(bookingData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Room is required');
    });
  });
});
