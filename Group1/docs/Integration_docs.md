# Room and Resource Booking System - Integration Guide
Welcome to the guide for integrating with the Room and Resource Booking System
<a name="readme-top"></a>

## Table of Contents
* [Overview](#overview)
* [Authentication](#authentication)
* [API Endpoints](#api-endpoints)
* [Troubleshooting & FAQ](#troubleshooting-and-faq)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Overview
There are two API's used for creating and reading booking requests:
* Create room booking requests with `/api/book-room` <br> please see the next section: authentication
* Read room booking requests in our database URL: https://cps714-b56c0-default-rtdb.firebaseio.com/roomBookings.json

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Authentication
To create booking requests, you must have a serviceAccountKey.json in your project and be a member to our firebase project.

### How to getserviceAccountKey.json
1. Go to https://console.firebase.google.com/ and sign in with your account
2. If you are not a member to our firebase project, contact the project leader (email: janice.zhu@torontomu.ca)
3. Select the project 'cps714'
4. Open the Service Accounts tab.
5. Under the Firebase Admin SDK section, click **Generate new private key**.
6. A confirmation prompt will appear. Confirm to generate the key. 
7. This will automatically download a JSON file (your serviceAccountKey.json).
8. Rename the downloaded file to serviceAccountKey.json <br>
9. Place this serviceAccountKey.json file in your project <br>

## API Endpoints
### `/api/book-room`
* Description: books a room by creating a new entry in the database.
* URL: http://localhost:5000/api/book-room
* Method: POST
* Request headers: `Content-Type : application/json`
* Request body format:
    * roomSelected: string
    * startDate: Date
    * endDate: Date
    * projectorNum: integer
    * micNum: integer
    * cateringSelected: boolean
    * additionalResources: string

* Response: format: including success and error cases
    * Success (200): `message: Room Booked Succesfully`
    * Error (400); `error: Booking failed`

* Example request <br>

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
        })

### `/roomBookings.json`
* Description: Retrieves all room booking data stored in the Firebase Realtime Database at the /roomBookings node. This endpoint provides read-only access to the current state of room bookings in JSON format.
* URL: https://cps714-b56c0-default-rtdb.firebaseio.com/roomBookings.json
* Method: GET
* Request parameters: None required for basic read access. Optional Firebase query parameters may be used for filtering or sorting.

* Response: format: including success and error cases
    * Success (200 OK): Returns JSON data representing all room bookings. 
    * Error (401 Unauthorized): if access permissions are not granted.
    * Error (404 Not Found): if the specified path does not exist.

* Example request <br>
    
    `const response = await fetch("https://cps714-b56c0-default-rtdb.firebaseio.com/roomBookings.json")
    const data = await response.json()`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Troubleshooting and FAQ

### Q1: API /api/book-room returns 400 Bad Request
Solution: Verify that all required fields (roomId, startTime, endTime) are included in the POST request and follow the correct formats

### Q2: Can I filter or query bookings when reading from Firebase?
A: Yes, Firebase supports queries with parameters like orderBy, equalTo, etc. Refer to Firebase documentation for query usage.
