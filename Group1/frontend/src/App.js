import "./App.css";
import React, { Component, useState, useEffect } from "react";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  Checkbox,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function CreateRoomBookingPage() {
  /* Room Dropdown Button Handler */
  const [roomSelected, setRoomSelected] = useState("");

  // save “not sent” booking here until backend is ready
  const [bookingDraft, setBookingDraft] = useState(null);
  // room options ranging from classrooms, lecture halls, and meeting rooms
  const rooms = {
    Classrooms: ["KHW-057", "ENG202", "ENG411"],
    "Lecture Halls": ["DSQ09", "LIB072", "ENG103"],
    "Meeting Rooms": ["ENG358", "ILC-224", "SLC-831"],
    Gyms: ["KHW-271"],
    Venues: ["Sears Atrium"],
  };

  // rooms filtered by availability
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  /* Date and Time */
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const isInvalidRange = startDate && endDate && endDate <= startDate;

  // NEW: control picker open/close
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);

  // Whenever start/end change, ask backend (Firebase) which rooms are unavailable
  useEffect(() => {
    const fetchAvailability = async () => {
      // no valid range yet → show all rooms
      if (!startDate || !endDate || endDate <= startDate) {
        setFilteredRooms(rooms);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/check-availability",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate, // Date objects will serialize to ISO strings
              endDate,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Availability check failed:", data.error);
          setFilteredRooms(rooms);
          return;
        }

        const unavailable = data.unavailableRooms || [];

        // build new rooms object without unavailable rooms
        const updated = {};
        Object.entries(rooms).forEach(([category, roomList]) => {
          updated[category] = roomList.filter(
            (room) => !unavailable.includes(room)
          );
        });

        setFilteredRooms(updated);

        // if current selection became unavailable, clear it
        if (roomSelected && unavailable.includes(roomSelected)) {
          setRoomSelected("");
        }
      } catch (err) {
        console.error("Error checking availability:", err);
        setFilteredRooms(rooms);
      }
    };

    fetchAvailability();
  }, [startDate, endDate]);

  /* Projector Textfield Handler */
  const [defaultProjector, setDefaultProjector] = useState(0);
  const [projectorNum, setProjector] = useState(defaultProjector);

  const handleProjectorChange = (event) => {
    setProjector(event.target.value);
  };

  /* Mic Textfield Handler */
  const [defaultMic, setDefaultMic] = useState(0);
  const [micNum, setMic] = useState(defaultMic);

  const handleMicChange = (event) => {
    setMic(event.target.value);
  };

  /*  Catering Handler */
  const [cateringSelected, setCatering] = useState(false);

  const handleCateringChange = (event) => {
    setCatering(event.target.checked);
  };

  /* Additional Resources */
  const [additionalResources, setAdditionalResources] = useState("");

  const handleAdditionalResourcesChange = (e) => {
    setAdditionalResources(e.target.value);
  };

  /* Book Room Button */
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);

  const handleBookRoomButtonPressed = async () => {
    //Debug on console
    console.log("Room value:", roomSelected);
    console.log("Start Date time:", startDate);
    console.log("End Date time:", endDate);
    console.log("Projector value:", projectorNum);
    console.log("Mic value:", micNum);
    console.log("Catering value:", cateringSelected);
    console.log("Additional Resources value:", additionalResources);

    if (!roomSelected || roomSelected.trim() === "") {
      setMessage("Room number cannot be empty.");
      setMessageVisible(true);
      return;
    }

    if (!startDate || !endDate) {
      setMessage("Please select a start and end date/time.");
      setMessageVisible(true);
      return;
    }

    if (endDate <= startDate) {
      setMessage("End time must be after start time.");
      setMessageVisible(true);
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/book-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSelected: roomSelected.trim(),
          startDate: startDate,
          endDate: endDate,
          projectorNum: projectorNum,
          micNum: micNum,
          cateringSelected: cateringSelected,
          additionalResources: additionalResources,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Room booked successfully");
        setMessageVisible(true);

        // Reset form for a new booking
        setRoomSelected("");
        setStartDate(null);
        setEndDate(null);
        setProjector(defaultProjector);
        setMic(defaultMic);
        setCatering(false);
        setAdditionalResources("");

        setTimeout(() => {
          setMessageVisible(false);
        }, 5000);
      } else {
        setMessage(data.error || "Booking failed");
        setMessageVisible(true);
      }
    } catch (error) {
      setMessage("Error connecting to backend server");
      setMessageVisible(true);
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="RoomDropDown-wrapper">
        <label htmlFor="roomDropdown">Select a Room: </label>
        <select
          id="roomDropdown"
          value={roomSelected}
          onChange={(e) => setRoomSelected(e.target.value)}
        >
          <option value="" disabled>
            -- Choose Room --
          </option>
          {Object.entries(filteredRooms).map(([category, roomList]) => (
            <optgroup key={category} label={category}>
              {roomList.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="Calendar-wrapper">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* START DATE/TIME */}
            <DateTimePicker
              label="Start date & time"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);

                if (endDate && newValue && endDate <= newValue) {
                  setEndDate(null);
                }
              }}
              disablePast
              closeOnSelect
              slotProps={{
                textField: {
                  fullWidth: true,
                },

                actionBar: { actions: [] },
              }}
            />

            {/* END DATE/TIME */}
            <DateTimePicker
              label="End date & time"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue);
              }}
              disablePast
              minDateTime={startDate || undefined}
              closeOnSelect
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(isInvalidRange),
                  helperText: isInvalidRange
                    ? "End time must be after start time."
                    : "",
                },
                actionBar: { actions: [] },
              }}
            />
          </div>
        </LocalizationProvider>
      </div>

      <div className="ResourceButtons-wrapper">
        <div className="ResourceProjector-wrappper">
          <FormControl>
            <TextField
              required={true}
              type="number"
              onChange={handleProjectorChange}
              defaultValue={defaultProjector}
              inputProps={{
                min: 0,
                style: { textAlign: "center" },
              }}
            />
            <FormHelperText>
              <div align="center">Request number of projectors</div>
            </FormHelperText>
          </FormControl>
        </div>
        <div className="ResourceMic-wrappper">
          <FormControl>
            <TextField
              required={true}
              type="number"
              onChange={handleMicChange}
              defaultValue={defaultMic}
              inputProps={{
                min: 0,
                style: { textAlign: "center" },
              }}
            />
            <FormHelperText>
              <div align="center">Request number of mics</div>
            </FormHelperText>
          </FormControl>
        </div>
        <div className="ResourceCatering-wrappper">
          <FormControl>
            <FormControlLabel
              value="false"
              control={
                <Checkbox
                  checked={cateringSelected}
                  onChange={handleCateringChange}
                  color="primary"
                />
              }
              label="Catering"
            />
          </FormControl>
        </div>
      </div>
      <div className="ResourceTextfield-wrapper">
        <FormControl>
          <TextField
            label="Additional Resources"
            multiline
            rows={3}
            value={additionalResources}
            onChange={handleAdditionalResourcesChange}
            placeholder="Describe any additional resources or special requirements..."
            variant="outlined"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <FormHelperText>
            Specify any additional equipment, setup, or services required for
            your booking
          </FormHelperText>
        </FormControl>
      </div>
      <div className="BookRoomButton-wrapper">
        <Button
          color="primary"
          variant="contained"
          onClick={handleBookRoomButtonPressed}
        >
          Book Room
        </Button>
        {messageVisible && <div>{message}</div>}
      </div>
    </div>
  );
}

export default CreateRoomBookingPage;
