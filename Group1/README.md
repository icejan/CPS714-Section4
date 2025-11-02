# Room and Resources Booking App
<a name="readme-top"></a>
## Table of Contents
* [Prerequisites](#prerequisites)
* [How to run the backend server and React](#how-to-run-the-backend-server-and-react)
   * [get serviceAccountKey.json for Firebase](#1-ensure-serviceaccountkeyjson-is-inside-backendsrc)
   * [npm commands to run app](#2-in-the-backend-folder-on-terminal-enter)
   * [access the database data](#5-to-view-the-database-data)

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

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## How to run the backend server and React

### 1. Ensure serviceAccountKey.json is inside backend/src
* Go to https://console.firebase.google.com/ and sign in with your account

* If you are not a member to our firebase project, tell me (Janice) to add you

* Select the project 'cps714'
<img width="1440" height="900" alt="Screenshot 2025-11-02 at 3 07 37 PM" src="https://github.com/user-attachments/assets/ad951b0a-4689-4fec-bbc9-cafbc0cc391a" />

* Select the gear icon to go to project settings
<img width="1713" height="965" alt="image" src="https://github.com/user-attachments/assets/a2dcd23d-5324-4c80-9b13-d7a0d7e85c8a" />

* open the Service Accounts tab.
* Under the Firebase Admin SDK section, click **Generate new private key**.
* A confirmation prompt will appear. Confirm to generate the key. 
* This will automatically download a JSON file (your serviceAccountKey.json).
<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/1c992729-45ff-4815-ab3b-e393b228737d" />
* Rename the downloaded file to serviceAccountKey.json <br>
* Place this serviceAccountKey.json file in **CPS714-Section4/Group1/backend/src** <br>
<img width="313" height="375" alt="image" src="https://github.com/user-attachments/assets/1b47f37b-76b2-4576-8686-557aec129172" />

### 2. In the backend folder, on terminal enter
`npm install `

### 3. To start the backend server, on terminal enter
`npm run dev `

### 4. In a SECOND terminal, in the frontend folder enter
`npm install `
  
### 4. In the SECOND terminal, to run the app enter
   `npm start ` 

  (Open [http://localhost:3000](http://localhost:3000) to view it in your browser) <br>

  To stop the backend server, enter **CTRL+C** on terminal <br>
  To stop the frontend, enter **CTRL+C** on the SECOND terminal <br>
  
   FYI: keep BOTH terminals running while you work on the code: everytime you save changes to your code locally it will auto compile! Your browser will auto refresh with the new changes you made
   
### 5. To view the Database data
* Go to https://console.firebase.google.com/ and sign in with your account
* Select the project 'cps714'
* On the left under build, select RealTime Database

<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/a783e6c4-fbb3-4e65-b2e4-b885d13e95f4" />

