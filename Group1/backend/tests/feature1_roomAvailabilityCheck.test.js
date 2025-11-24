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

describe("Feature#1 Test Suite - Room Availability Check", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.ref.mockReturnValue(mockRef);
  });

  describe("Requirement #1: room -> available date/times", () => {
    it("should reject booking when the chosen room is already booked for that time range", async () => {
      // Existing booking in DB for ENG103 (9:00–11:00)
      mockRef.once.mockResolvedValue({
        val: () => ({
          existingBooking: {
            roomSelected: "ENG103",
            startDate: "2025-11-25T09:00:00.000Z",
            endDate: "2025-11-25T11:00:00.000Z",
          },
        }),
      });

      const newBooking = {
        roomSelected: "ENG103",
        // Overlaps with existing booking (10:00–12:00)
        startDate: "2025-11-25T10:00:00.000Z",
        endDate: "2025-11-25T12:00:00.000Z",
        projectorNum: 1,
        micNum: 1,
        cateringSelected: false,
        additionalResources: "",
      };

      const res = await request(app).post("/api/book-room").send(newBooking);

      // Backend should reject this as a conflict
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/already booked/i);

      expect(mockRef.set).not.toHaveBeenCalled();
    });
  });

  describe("Requirement #2: time range -> available rooms", () => {
    describe("Testcase #1.0: returns 400 if startDate or endDate missing", () => {
      it("should return 400 when dates are missing", async () => {
        const res = await request(app)
          .post("/api/check-availability")
          .send({ startDate: null, endDate: null });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
      });
    });

    describe("Testcase #1.1: returns empty unavailableRooms when there are no bookings", () => {
      it("should return empty unavailableRooms when there are no bookings", async () => {
        mockRef.once.mockResolvedValue({
          val: () => null, // no bookings in DB
        });

        const res = await request(app).post("/api/check-availability").send({
          startDate: "2025-11-25T10:00:00.000Z",
          endDate: "2025-11-25T12:00:00.000Z",
        });

        expect(res.status).toBe(200);
        expect(res.body.unavailableRooms).toEqual([]);
      });
    });

    describe("Testcase #1.2: marks a room as unavailable when the time overlaps", () => {
      it("should mark ENG103 as unavailable when the time overlaps", async () => {
        // fake bookings in Firebase
        mockRef.once.mockResolvedValue({
          val: () => ({
            booking1: {
              roomSelected: "ENG103",
              startDate: "2025-11-25T09:00:00.000Z",
              endDate: "2025-11-25T11:00:00.000Z",
            },
            booking2: {
              roomSelected: "KHW-057",
              startDate: "2025-11-26T13:00:00.000Z",
              endDate: "2025-11-26T15:00:00.000Z",
            },
          }),
        });

        const res = await request(app).post("/api/check-availability").send({
          // This window overlaps ENG103’s booking but not KHW-057
          startDate: "2025-11-25T10:00:00.000Z",
          endDate: "2025-11-25T12:00:00.000Z",
        });

        expect(res.status).toBe(200);
        expect(res.body.unavailableRooms).toContain("ENG103");
        expect(res.body.unavailableRooms).not.toContain("KHW-057");
      });
    });

    describe("Testcase #1.3: deduplicates unavailable rooms when multiple bookings overlap", () => {
      it("should deduplicate unavailable rooms when multiple bookings overlap", async () => {
        mockRef.once.mockResolvedValue({
          val: () => ({
            booking1: {
              roomSelected: "ENG103",
              startDate: "2025-11-25T09:00:00.000Z",
              endDate: "2025-11-25T11:00:00.000Z",
            },
            booking2: {
              roomSelected: "ENG103",
              startDate: "2025-11-25T11:30:00.000Z",
              endDate: "2025-11-25T13:00:00.000Z",
            },
          }),
        });

        const res = await request(app).post("/api/check-availability").send({
          startDate: "2025-11-25T10:30:00.000Z",
          endDate: "2025-11-25T12:30:00.000Z",
        });

        expect(res.status).toBe(200);
        expect(res.body.unavailableRooms).toEqual(["ENG103"]);
      });
    });
  });
});
