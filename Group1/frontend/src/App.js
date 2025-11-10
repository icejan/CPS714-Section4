//add your imports above
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // save “not sent” booking here until backend is ready
  const [bookingDraft, setBookingDraft] = useState(null);
  // room options ranging from classrooms, lecture halls, and meeting rooms
  const rooms = {
    Classrooms: ["KHW-057", "ENG202", "ENG411"],
    "Lecture Halls": ["DSQ09", "LIB072", "ENG103"],
    "Meeting Rooms": ["ENG358", "ILC-224", "SLC-831"],
  };

  /* Date and Time */

  /* Projector Textfield Handler */
  //Initialize default projector to 0
  const [defaultProjector, setDefaultProjector] = useState(0);
  const [projectorNum, setProjector] = useState(defaultProjector);

  const handleProjectorChange = (event) => {
    setProjector(event.target.value);
  };

  /* Mic Textfield Handler */
  //Initialize default mic to 0
  const [defaultMic, setDefaultMic] = useState(0);
  const [micNum, setMic] = useState(defaultMic);

  const handleMicChange = (event) => {
    setMic(event.target.value);
  };

  /*  Catering Handler */
  //Initialize default catering to false
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

  const handleBookRoomButtonPressed = async () => {
    //setMessage("Book Room was pressed!");
    console.log("Room value:", roomSelected);
    console.log("Start Date time:", startDate);
    console.log("End Date time:", endDate);
    console.log("Projector value:", projectorNum);
    console.log("Mic value:", micNum);
    console.log("Catering value:", cateringSelected);
    console.log("Additional Resources value:", additionalResources);

    if (!roomSelected || roomSelected.trim() === "") {
      setMessage("Room number cannot be empty.");
      return;
    }

    if (!startDate || !endDate) {
      setMessage("Please select a start and end date/time.");
      return;
    }
    if (endDate <= startDate) {
      setMessage("End time must be after start time.");
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
      } else {
        setMessage(data.error || "Booking failed");
      }
    } catch (error) {
      setMessage("Error connecting to backend server");
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
          {Object.entries(rooms).map(([category, roomList]) => (
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
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <DateTimePicker
              label="Start date & time"
              value={startDate}
              onChange={setStartDate}
            />
            <DateTimePicker
              label="End date & time"
              value={endDate}
              onChange={setEndDate}
              minDateTime={startDate || undefined}
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
        <div>{message}</div>
      </div>
    </div>
  );
}

export default CreateRoomBookingPage;
