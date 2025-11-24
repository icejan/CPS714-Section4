const request = require("supertest");
const admin = require("firebase-admin");

const mockRef = {
  once: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
};

const mockDatabase = {
  ref: jest.fn(() => mockRef),
};

jest.mock("firebase-admin", () => {
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    database: jest.fn(() => mockDatabase),
  };
});

admin.database.ServerValue = {
  TIMESTAMP: "mock-timestamp",
};

const app = require("../src/app");

describe("Feature #1 Test Suite - Room Availability Check", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.ref.mockReturnValue(mockRef);
  });

  describe("Test #1.0: date range → available rooms", () => {
    it("should only mark overlapping rooms as unavailable", async () => {
      mockRef.once.mockResolvedValue({
        val: () => ({
          booking1: {
            roomSelected: "ENG103",
            startDate: "2025-11-25T09:00:00.000Z",
            endDate: "2025-11-25T11:00:00.000Z",
          },
          booking2: {
            roomSelected: "KHW-057",
            startDate: "2025-11-25T13:00:00.000Z",
            endDate: "2025-11-25T15:00:00.000Z",
          },
        }),
      });

      const res = await request(app).get("/api/check-availability").query({
        startDate: "2025-11-25T10:00:00.000Z",
        endDate: "2025-11-25T12:00:00.000Z",
      });

      expect(res.status).toBe(200);
      expect(res.body.unavailableRooms).toEqual(["ENG103"]);
    });
  });

  describe("Test #1.1: chosen room → available times", () => {
    it("should correctly detect when a chosen room is unavailable due to overlap", async () => {
      mockRef.once.mockResolvedValue({
        val: () => ({
          booking1: {
            roomSelected: "ENG103",
            startDate: "2025-11-25T09:00:00.000Z",
            endDate: "2025-11-25T11:00:00.000Z",
          },
        }),
      });

      const res = await request(app).get("/api/check-availability").query({
        startDate: "2025-11-25T09:30:00.000Z",
        endDate: "2025-11-25T10:30:00.000Z",
      });

      expect(res.status).toBe(200);
      expect(res.body.unavailableRooms).toContain("ENG103");
    });
  });
});
