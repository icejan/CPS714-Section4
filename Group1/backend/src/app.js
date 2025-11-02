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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
