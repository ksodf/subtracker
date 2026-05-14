# Firebase Hosting Deployment

Firebase Hosting serves the React app only. The Express API in `backend/` must
also be running somewhere reachable over HTTPS, otherwise login/register cannot
work.

## Build And Deploy Hosting

From the project root:

```bash
cd frontend
touch .env.production
```

Edit `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://your-deployed-api.example.com/api
```

Then deploy from the project root:

```bash
npm --prefix frontend run build
firebase deploy --only hosting
```

The root `firebase.json` points Hosting at `frontend/dist`.

## Backend Environment

Deploy the backend separately, then set these production environment variables:

```bash
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://subtracker-3b763.web.app,https://subtracker-3b763.firebaseapp.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

For local development, the frontend can keep using Vite's proxy and
`http://localhost:3001/api`.

## Why Login Gets Stuck

If `VITE_API_BASE_URL` is missing in the production build, the frontend calls
`/api/auth/login` on the Firebase Hosting domain. Firebase Hosting does not run
the Express API, so that request returns the hosted React app instead of JSON.
The app detects that case and shows a deployment configuration error.
