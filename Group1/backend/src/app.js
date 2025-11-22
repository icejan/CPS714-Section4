const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //Note: databseURL only for Realtime DB
  databaseURL: "https://cps714-b56c0-default-rtdb.firebaseio.com/"
});

// admin.firestore() if using Firestore; admin.database() for Realtime DB
const db = admin.database(); 

app.post('/api/book-room', async (req, res) => {
  const { roomSelected, startDate, endDate, projectorNum, micNum, cateringSelected, additionalResources } = req.body;
  if (!roomSelected || roomSelected.trim() === '') {
    return res.status(400).json({ error: 'Room is required' });
  }

  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const snapshot = await db.ref('roomBookings').once('value');
    const bookings = snapshot.val() || {};

    for (const id in bookings) {
      const booking = bookings[id];
      if (booking.roomSelected === roomSelected.trim()) {
        const bookingStart = new Date(booking.startDate).getTime();
        const bookingEnd = new Date(booking.endDate).getTime();
        if (start < bookingEnd && end > bookingStart) {
          return res.status(409).json({ error: 'Room is already booked for this time slot' });
        }
      }
    }

    const ref = db.ref('roomBookings').push();
    await ref.set({
      roomSelected: roomSelected.trim(),
      startDate: startDate,
      endDate: endDate,
      projectorNum: projectorNum,
      micNum: micNum,
      cateringSelected: cateringSelected,
      additionalResources: additionalResources ? additionalResources : null,
      bookedAt: admin.database.ServerValue.TIMESTAMP,
      status: "Pending" //For faculty to approve booking
    });
    return res.json({ message: 'Room booked successfully' });
  } catch (error) {
    console.error('Error saving booking:', error);
    return res.status(500).json({ error: 'Failed to book room' });
  }
});

app.post('/api/room-availability', async (req, res) => {
    const { roomSelected, date } = req.body;

    if (!roomSelected || !date) {
        return res.status(400).json({ error: "Room and date are required." });
    }

    try {
        // Convert selected date to midnight of that day
        const selectedDay = new Date(date);
        selectedDay.setHours(0, 0, 0, 0);
        const startOfDay = selectedDay.getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

        // Fetch all bookings
        const snapshot = await db.ref("roomBookings").once("value");
        const bookings = snapshot.val() || {};

        // Collect all bookings for selecred room on selected day
        const todaysBookings = [];

        for (const id in bookings) {
            const b = bookings[id];
            if (b.roomSelected !== roomSelected) continue;

            const bStart = new Date(b.startDate).getTime();
            const bEnd = new Date(b.endDate).getTime();

            // Keep bookings that overlap this day
            if (bStart < endOfDay && bEnd > startOfDay) {
                todaysBookings.push({ start: bStart, end: bEnd });
            }
        }

        // Sort bookings by time
        todaysBookings.sort((a, b) => a.start - b.start);

        // Generate available slots for the day assumed 8am - 10pm
        const opening = new Date(date);
        opening.setHours(8, 0, 0, 0);
        const openingTime = opening.getTime();

        const closing = new Date(date);
        closing.setHours(22, 0, 0, 0);
        const closingTime = closing.getTime();

        const available = [];

        let current = openingTime;

        for (const booking of todaysBookings) {
            if (current < booking.start) {
                available.push({
                    start: new Date(current),
                    end: new Date(booking.start)
                });
            }
            current = Math.max(current, booking.end);
        }

        // Last gap of the day
        if (current < closingTime) {
            available.push({
                start: new Date(current),
                end: new Date(closingTime)
            });
        }

        return res.json({
            room: roomSelected,
            date: date,
            availableSlots: available
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

app.get('/api/check-availability', async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const snapshot = await db.ref('roomBookings').once('value');
    const bookings = snapshot.val() || {};
    const unavailableRooms = [];

    for (const id in bookings) {
      const booking = bookings[id];
      const bookingStart = new Date(booking.startDate).getTime();
      const bookingEnd = new Date(booking.endDate).getTime();

      if (start < bookingEnd && end > bookingStart) {
        unavailableRooms.push(booking.roomSelected);
      }
    }

    const uniqueUnavailableRooms = [...new Set(unavailableRooms)];

    return res.json({ unavailableRooms: uniqueUnavailableRooms });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ error: 'Failed to check availability' });
  }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
