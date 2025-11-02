# Room and Resources Booking App
## Prerequisites
### 1. Ensure you have node.js installed to be able to use npm. 
   (You can install it from https://nodejs.org/)
   
   You can verify its installed by typing in terminal `npm -v` <br>
   That should output the version number
   
   <img width="307" height="104" alt="image" src="https://github.com/user-attachments/assets/ba975bc9-6b9d-4326-b8aa-e8ae2482e9de" /><br>

### 2. Clone the repo

  You can use the command 
  `git clone https://github.com/icejan/CPS714-Section4.git`

  OR on the github desktop by clicking add > clone > enter URL of this repo
  <img width="567" height="176" alt="image" src="https://github.com/user-attachments/assets/e1364fad-1623-4e50-b5ae-f6e88b54d3f7" /><br>
  <img width="509" height="308" alt="image" src="https://github.com/user-attachments/assets/58c94a8a-c7fc-40ab-a590-f7e65942c968" /><br>
  <img width="491" height="466" alt="image" src="https://github.com/user-attachments/assets/fe978311-5fa1-4af6-8ee1-1eda6dd42376" /><br>

## How to run the backend server and React
### 1. Ensure serviceAccountKey.json is Inside backend/src
Go to https://console.firebase.google.com/ and sign in with your account

If you are not a member to our firebase project, tell me (Janice) to add you

Select the project 'cps714'

Select the gear icon to go to project settings

open the Service Accounts tab.

Under the Firebase Admin SDK section, click Generate new private key.

A confirmation prompt will appear. Confirm to generate the key. 
This will automatically download a JSON file (your serviceAccountKey.json).

Place this serviceAccountKey.json file in **CPS714-Section4/Group1/backend/src** 

### 2. In the backend folder, on terminal enter
`npm install `

### 3. To start the backend server, on terminal enter
`npm run dev `

### 4. In the frontend folder, on a SECOND terminal enter
`npm install `
  
### 4. To run the app, on the SECOND terminal enter
   `npm start ` 

  (Open [http://localhost:3000](http://localhost:3000) to view it in your browser) <br>

  To stop the backend server, enter **CTRL+C** on terminal
  To stop the frontend, enter **CTRL+C** on the SECOND terminal
  
   FYI: keep BOTH terminals running while you work on the code: everytime you save changes to your code locally it will auto compile! Your browser will auto refresh with the new changes you made
   
### 5. To view the Database data
Go to https://console.firebase.google.com/ and sign in with your account
Select the project 'cps714'
On the left under build, select RealTime Database


