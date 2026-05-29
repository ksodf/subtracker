# SubTracker

SubTracker is a small full-stack app for keeping track of paid subscriptions. The main idea is simple: add the services you pay for, see the monthly cost, check upcoming bills, and export a basic report when needed.

The project is built with a React frontend, an Express API, and Firebase Firestore for storage. It also has login/register, light and dark mode, currency display options, and CSV/PDF report exports.

## What It Does

- Create an account and sign in
- Add, edit, and cancel subscriptions
- Track price, currency, category, billing cycle, billing date, payment method, and notes
- See monthly spending and category breakdowns on the dashboard
- View bills that are due within the next 48 hours
- Export subscription reports as CSV or PDF
- Switch between light mode and dark mode

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Mobile: Expo React Native with Expo Go
- Backend: Node.js, Express
- Database: Firebase Firestore
- Auth: JWT with bcrypt password hashing
- Hosting: Firebase Hosting for the frontend, separate hosting for the API

## Project Structure

```text
subtracker/
  backend/        Express API, routes, controllers, Firestore models
  frontend/       React app
  mobile/         Expo React Native mobile app
  firebase.json   Firebase Hosting config for the frontend build
```

## Running It Locally

Install dependencies for both parts of the app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create a `backend/.env` file with the backend settings:

```bash
PORT=3001
JWT_SECRET=replace_this_with_a_long_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The React app runs at `http://localhost:5173`. During local development, Vite sends `/api` requests to `http://localhost:3001`.

## Running The Mobile App

The mobile app is in the `mobile/` folder. It is an Expo React Native app, so the easiest way to test it is with Expo Go on a phone.

Install the mobile dependencies:

```bash
cd mobile
npm install
```

Start Expo:

```bash
npx expo start
```

Then scan the QR code with Expo Go. The mobile app uses the deployed Render API by default:

```text
https://subtracker-ro14.onrender.com/api
```

If that API URL ever changes, update it in:

```text
mobile/src/config/api.js
```

## Deployment Notes

Before building the frontend for production, set `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

Then build and deploy:

```bash
npm --prefix frontend run build
firebase deploy --only hosting
```

## Notes

The app used to have local database files during development, but the current version uses Firestore as the main database. That keeps the deployed version simpler because the data lives in Firebase instead of a local file or local SQL server.
