# PhotoTribe - Full-Stack Photo Sharing App

PhotoTribe is a full-stack web application where users can register, log in, upload photos, and browse a visually rich public gallery.

## Application Summary

PhotoTribe combines a secure Spring Boot backend with a React frontend to provide:

- JWT-based authentication (register/login)
- Photo upload with thumbnail generation
- Public gallery with sample and uploaded photos
- Auto-scrolling preview strip and modern card-based UI
- Upload preview with auto-generated one-line description based on photo title + image analysis

## Tech Stack

- Frontend: React 19, React Router, Vite
- Backend: Spring Boot 3, Spring Security, JPA, JWT
- Database (default): H2 in-memory
- Optional DB profile: MySQL
- Build tools: npm (frontend), Maven (backend)

## Project Structure

```
photo-sharing-app/
├─ backend/
│  ├─ pom.xml
│  ├─ run-backend.bat
│  └─ src/main/
│     ├─ java/com/photoshare/
│     │  ├─ controller/
│     │  ├─ dto/
│     │  ├─ exception/
│     │  ├─ model/
│     │  ├─ repository/
│     │  ├─ security/
│     │  ├─ service/
│     │  └─ PhotoSharingApplication.java
│     └─ resources/
│        ├─ application.properties
│        └─ application-mysql.properties
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  ├─ public/
│  └─ src/
│     ├─ App.jsx
│     ├─ App.css
│     ├─ main.jsx
│     └─ pages/
│        ├─ Gallery.jsx
│        ├─ Login.jsx
│        └─ Register.jsx
└─ uploads/
   └─ thumbnails/
```

## Prerequisites

- Java 17 or later
- Node.js 18 or later
- npm
- Git

Notes:

- Maven command-line is optional if you use `backend/run-backend.bat`.
- Default setup uses H2 in-memory DB, so MySQL is not required for local quick start.

## Clone From GitHub

```bash
git clone https://github.com/Bsrivamsi/PhotosharingApp.git
cd photo-sharing-app
```

## How To Run

### 1. Start Backend

Option A (Windows quick start):

```bat
cd backend
run-backend.bat
```

Option B (standard Maven):

```bash
cd backend
mvn spring-boot:run
```

Backend starts at:

- `http://localhost:8080`

### 2. Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at:

- `http://localhost:5173`

## Access URLs

- Gallery: `http://localhost:5173/`
- Register: `http://localhost:5173/register`
- Login: `http://localhost:5173/login`

## How Auth Works

- Register/Login endpoints are served by backend under `/api/auth/*`.
- Frontend uses Vite proxy for `/api` calls in development.
- On successful login/register, JWT token is saved in browser local storage.

## Database Information

### Default (H2)

- Runs in-memory
- Resets on backend restart
- Good for development/testing

### Optional MySQL Profile

You can run with MySQL profile using `application-mysql.properties` and:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## API Overview

- `POST /api/auth/register` - create account
- `POST /api/auth/login` - login and receive JWT
- `GET /api/photos` - list photos (public)
- `POST /api/photos/upload` - upload photo (requires JWT)

## Troubleshooting

If login/register fails:

1. Ensure backend is running on port `8080`.
2. Ensure frontend is running on port `5173`.
3. Restart both servers if needed.
4. Check browser devtools network tab for `/api/auth/*` errors.

If photos do not persist after restart:

- You are likely on H2 in-memory DB; this is expected.

## Current Feature Highlights

- Attractive responsive UI with hero, preview strip, and photo cards
- Smart upload preview card
- Auto-generated one-line description based on image analysis
- Latest uploads shown first in scrollers and card feeds
- "See more" progressive card reveal in gallery

## How To Push Code To GitHub

Use these steps from the project root folder:

```bash
git init
git add .
git commit -m "Initial PhotoTribe setup"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

For later updates:

```bash
git add .
git commit -m "Describe your update"
git push
```

## Make It Live On Free Services

You can deploy PhotoTribe fully on free-tier tools. The most common setup is:

- Frontend: Vercel or Netlify (free)
- Backend: Render Web Service (free)
- Database: H2 (quick demo) or Neon Postgres (free, persistent)
- Image storage: local filesystem for demo, Cloudinary free plan for production-like usage

### Option 1: Quick Demo Deployment (Fastest)

This is easiest to get online quickly.

1. Deploy backend to Render:
   - Create a new Web Service from your GitHub repo.
   - Root directory: `backend`
   - Build command: `mvn clean package -DskipTests`
   - Start command: `mvn spring-boot:run`
   - Add environment variables for JWT secret and any app configs.

2. Deploy frontend to Vercel:
   - Import your repo.
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add env var for backend URL (for example `VITE_API_BASE=https://your-backend.onrender.com/api`).

3. Update backend CORS settings:
   - Allow your deployed frontend domain (Vercel or Netlify URL), not only localhost.

4. Redeploy backend and frontend.

Important note:

- If backend runs with H2 in-memory DB, data resets on restart/sleep. Good for demo, not persistent.

### Option 2: Free Persistent Deployment (Recommended)

Use this setup for better real-world behavior.

1. Backend on Render (same as above).
2. Frontend on Vercel or Netlify (same as above).
3. Database on Neon (free Postgres):
   - Create Neon project and copy connection URL.
   - Add DB env vars in Render.
   - Configure Spring datasource for Postgres profile.
4. Optional image hosting on Cloudinary:
   - Store uploaded images remotely instead of local server disk.
   - This avoids file loss on container restarts.

## Suggested Environment Variables (Deployment)

Backend:

- `JWT_SECRET`
- `SPRING_PROFILES_ACTIVE` (for example `mysql` or another persistent profile)
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Frontend:

- `VITE_API_BASE` (for production API URL)

## Deployment Checklist

Before going live:

1. Verify backend CORS includes deployed frontend domain.
2. Verify frontend API base points to deployed backend.
3. Use a persistent DB for production-like behavior.
4. Test register, login, upload, and gallery browsing from live URL.
5. Confirm uploads persist after backend restart.

## Copy-Paste Deployment Setup

Use this section as a quick setup template.

### 1. Render Backend Settings

Create a new Web Service in Render with these values:

- Name: phototribe-backend
- Runtime: Java
- Region: nearest to your users
- Branch: main
- Root Directory: backend
- Build Command: mvn clean package -DskipTests
- Start Command: mvn spring-boot:run

Add these environment variables in Render:

- JWT_SECRET=replace_with_a_long_random_secret_key
- SPRING_PROFILES_ACTIVE=mysql
- SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/photosharing?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
- SPRING_DATASOURCE_USERNAME=your_db_username
- SPRING_DATASOURCE_PASSWORD=your_db_password

If you deploy with H2 (demo only), you can skip datasource variables and use:

- SPRING_PROFILES_ACTIVE=default

### 2. Vercel Frontend Settings

Create a new Project in Vercel with these values:

- Framework Preset: Vite
- Root Directory: frontend
- Install Command: npm install
- Build Command: npm run build
- Output Directory: dist

Add this environment variable in Vercel:

- VITE_API_BASE=https://your-render-service-name.onrender.com/api

Then redeploy.

### 3. Netlify Frontend Settings (Alternative)

If you use Netlify instead of Vercel:

- Base directory: frontend
- Build command: npm run build
- Publish directory: frontend/dist

Environment variable:

- VITE_API_BASE=https://your-render-service-name.onrender.com/api

### 4. Production CORS Update (Backend)

In backend CORS config, allow your deployed frontend domain(s), for example:

- https://your-app.vercel.app
- https://your-app.netlify.app

Do not keep only localhost entries for production.

### 5. Post-Deployment Smoke Test

After both services are live:

1. Open frontend deployed URL.
2. Register a new account.
3. Login with that account.
4. Upload one photo.
5. Confirm photo appears in gallery and remains after refresh.
