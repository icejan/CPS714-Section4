const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();

app.use(cors());
app.use(express.json());

//Intitialize database connection
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //Note: databseURL only for Realtime DB
  databaseURL: "https://cps714-b56c0-default-rtdb.firebaseio.com/",
});

const db = admin.database();

//Book a room through POST API 
app.post("/api/book-room", async (req, res) => {
  const {
    roomSelected,
    startDate,
    endDate,
    projectorNum,
    micNum,
    cateringSelected,
    additionalResources,
  } = req.body;
  //Verify room field is not empty
  if (!roomSelected || roomSelected.trim() === "") {
    return res.status(400).json({ error: "Room is required" });
  }

  //Verify room is not already booked for the timeslot
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const snapshot = await db.ref("roomBookings").once("value");
    const bookings = snapshot.val() || {};

    for (const id in bookings) {
      const booking = bookings[id];
      if (booking.roomSelected === roomSelected.trim()) {
        const bookingStart = new Date(booking.startDate).getTime();
        const bookingEnd = new Date(booking.endDate).getTime();
        if (start < bookingEnd && end > bookingStart) {
          return res
            .status(409)
            .json({ error: "Room is already booked for this time slot" });
        }
      }
    }
    //push room data into database
    const ref = db.ref("roomBookings").push();
    await ref.set({
      roomSelected: roomSelected.trim(),
      startDate: startDate,
      endDate: endDate,
      projectorNum: projectorNum,
      micNum: micNum,
      cateringSelected: cateringSelected,
      additionalResources: additionalResources ? additionalResources : null,
      bookedAt: admin.database.ServerValue.TIMESTAMP,
      status: "Pending", //For faculty to approve booking
    });
    return res.json({ message: "Room booked successfully" });
  } catch (error) {
    console.error("Error saving booking:", error);
    return res.status(500).json({ error: "Failed to book room" });
  }
});

//Get all unavailable dates/times for a room
app.get("/api/room-schedule", async (req, res) => {
  try {
    const room = req.query.room;
    if (!room) {
      return res.status(400).json({ error: "Room parameter required" });
    }

    // Read all bookings, then filter by room
    const snapshot = await db.ref("roomBookings").once("value");
    const all = snapshot.val() || {};

    const bookings = Object.values(all).filter(
      (booking) => booking.roomSelected === room
    );

    return res.json({
      room,
      bookings,
    });
  } catch (error) {
    console.error("Error checking schedule:", error);
    res.status(500).json({ error: "Failed to retrieve schedule" });
  }
});

// Check which rooms are unavailable for the given time range
app.get("/api/check-availability", async (req, res) => {
  // read from query instead of body
  const { startDate, endDate, roomSelected } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required" });
  }

  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const snapshot = await db.ref("roomBookings").once("value");
    const bookings = snapshot.val() || {};

    const unavailableRooms = new Set();

    for (const id in bookings) {
      const booking = bookings[id];

      // Optional: filter by room if you want to support that
      if (roomSelected && booking.roomSelected !== roomSelected.trim()) {
        continue;
      }

      const bookingStart = new Date(booking.startDate).getTime();
      const bookingEnd = new Date(booking.endDate).getTime();

      if (start < bookingEnd && end > bookingStart) {
        unavailableRooms.add(booking.roomSelected);
      }
    }

    return res.json({ unavailableRooms: [...unavailableRooms] });
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({ error: "Failed to check availability" });
  }
});

//Ensure backend server always starts in port 5000
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
