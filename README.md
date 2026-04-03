# PhotoTribe - Full-Stack Photo Sharing App

PhotoTribe is a full-stack web application where users can register, log in, upload photos, and browse a visually rich public gallery.

## Application Summary

PhotoTribe combines a secure Spring Boot backend with a React frontend to provide:

- JWT-based authentication (register/login)
- Photo upload with thumbnail generation
- Public gallery with sample and uploaded photos
- Auto-scrolling preview strip and modern card-based UI
- Upload preview with AI-style one-line description generated from photo title + image analysis
- Role-based Admin and Moderator dashboards
- Server-side pagination and filtering for admin tables
- Photo moderation queue with approve/reject actions
- Auto-approval for pending photos after 30 seconds when no admin action occurs
- Analytics dashboard with traffic, user activity, photo stats, and category distribution charts

## Latest Updates (April 2026)

- Added role permissions for `ROLE_ADMIN` and `ROLE_MODERATOR`
- Added server-side pagination/search/filter for Users, Photos, Pending Photos, Categories, and Activity Logs
- Added moderation flow for uploaded photos (`PENDING` -> `APPROVED`/`REJECTED`)
- Added scheduled auto-approval for photos that remain `PENDING` for over 30 seconds
- Added analytics charts section in admin dashboard and fixed chart rendering for all screen sizes
- Added real category distribution data in analytics based on uploaded photos

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
│        ├─ application-dev.properties
│        ├─ application-test.properties
│        ├─ application-prod.properties
│        └─ application-mysql.properties
│  ├─ api-templates.http
│  └─ rest-client.env.json
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  ├─ public/
│  └─ src/
│     ├─ components/
│     │  └─ AdminAnalyticsCharts.jsx
│     ├─ App.jsx
│     ├─ App.css
│     ├─ main.jsx
│     └─ pages/
│        ├─ About.jsx
│        ├─ AdminDashboard.jsx
│        ├─ Categories.jsx
│        ├─ Gallery.jsx
│        ├─ Login.jsx
│        ├─ Profile.jsx
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
run-backend.bat dev
```

`run-backend.bat` accepts profile argument: `dev`, `test`, or `prod`.

Profile examples with one command:

```bat
run-backend.bat dev
run-backend.bat test
run-backend.bat prod
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
- Frontend calls relative `/api` routes.
- In local development, Vite proxy forwards `/api` to backend (`http://localhost:8080`).
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

For production profile, prefer environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`) through `application-prod.properties`.

## Spring Profiles (dev / test / prod)

Profile segregation is configured with:

- `backend/src/main/resources/application.properties` (common + active profile selector)
- `backend/src/main/resources/application-dev.properties`
- `backend/src/main/resources/application-test.properties`
- `backend/src/main/resources/application-prod.properties`

Active profile behavior:

- Default profile: `dev`
- Controlled by env var: `SPRING_PROFILES_ACTIVE`

Examples:

```bash
# Run with dev profile (default)
cd backend
mvn spring-boot:run

# Run with test profile
mvn spring-boot:run -Dspring-boot.run.profiles=test

# Run with prod profile
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Windows batch shortcuts:

```bat
cd backend
run-backend.bat dev
run-backend.bat test
run-backend.bat prod
```

## REST Templates For All HTTP Methods

The project includes REST Client templates for GET, POST, PUT, PATCH, DELETE, OPTIONS, and HEAD.

Files:

- `backend/api-templates.http`
- `backend/rest-client.env.json`

Environment data included:

- `dev`
- `test`
- `prod`

How to use in VS Code:

1. Install the REST Client extension.
2. Open `backend/api-templates.http`.
3. Select environment (`dev`, `test`, or `prod`) from REST Client environment selector.
4. Update values in `backend/rest-client.env.json` (base URL, credentials, JWT).
5. Run any request template directly from the editor.

## API Overview

- `POST /api/auth/register` - create account
- `POST /api/auth/login` - login and receive JWT
- `GET /api/photos` - list photos (public)
- `POST /api/photos/upload` - upload photo (requires JWT)
- `GET /api/admin/analytics/dashboard` - admin analytics summary and chart data
- `GET /api/admin/users` - paginated users list with search/filter
- `GET /api/admin/photos` - paginated photos list with search/filter
- `GET /api/admin/photos/pending` - paginated moderation queue
- `POST /api/admin/photos/{id}/approve` - approve pending photo
- `POST /api/admin/photos/{id}/reject` - reject pending photo
- `GET /api/admin/categories` - paginated categories list
- `GET /api/admin/activity-logs` - paginated activity logs

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
- AI-style one-line description based on title + image analysis (orientation, mood, color, contrast)
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

Important for production routing:

- Frontend supports `VITE_API_BASE` for deployed backend URLs.
- Example file: `frontend/.env.example`
- Backend CORS is controlled by `APP_CORS_ALLOWED_ORIGIN_PATTERNS`.

### Option 1: Quick Demo Deployment (Fastest)

This is easiest to get online quickly.

1. Deploy backend to Render:
   - Create a new Web Service from your GitHub repo.
   - Root directory: `backend`
   - Build command: `mvn clean package -DskipTests`
   - Start command: `mvn spring-boot:run`
   - Add environment variables for JWT secret and any app configs.
   - You can also use the included `render.yaml` blueprint from repo root.

2. Deploy frontend to Vercel:
   - Import your repo.
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add env var for backend URL (for example `VITE_API_BASE=https://your-backend.onrender.com/api`).

3. Update backend CORS settings:
   - Allow your deployed frontend domain (Vercel or Netlify URL), not only localhost.

4. Redeploy backend and frontend.

For Netlify instead of Vercel:

- Use `frontend/netlify.toml`
- Set frontend environment variable `VITE_API_BASE`

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
- APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://your-netlify-site.netlify.app

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

## Render + Netlify Deployment (Recommended)

Use this exact flow to deploy backend on Render and frontend on Netlify.

### 1. Push latest code

```bash
git add .
git commit -m "Prepare Render and Netlify deployment"
git push origin main
```

### 2. Deploy backend on Render

1. Open Render and choose **New +** -> **Blueprint**.
2. Connect this GitHub repository.
3. Render will detect `render.yaml` and create `phototribe-backend`.
4. In Render service environment variables, set:
   - `SPRING_PROFILES_ACTIVE=dev`
   - `JWT_SECRET_BASE64=<your base64 secret>`
   - `JWT_EXPIRATION_MS=86400000`
   - `APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://<your-site>.netlify.app`
5. Deploy and wait for service status **Live**.
6. Copy backend URL, for example: `https://phototribe-backend.onrender.com`.

Generate a base64 secret locally (PowerShell):

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("replace-this-with-a-very-long-random-secret-at-least-32-chars"))
```

### 3. Deploy frontend on Netlify

1. Open Netlify and choose **Add new site** -> **Import an existing project**.
2. Select this repository.
3. Set base directory to `frontend`.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Add environment variable:
   - `VITE_API_BASE=https://phototribe-backend.onrender.com/api`
7. Deploy site.

### 4. Final CORS update on Render

After Netlify gives your final URL, update Render env var:

- `APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://<your-final-site>.netlify.app`

Then redeploy backend once.

### 5. Verify deployment

1. Open Netlify URL.
2. Register a new user.
3. Login and upload a photo.
4. Open admin dashboard and verify moderation/analytics pages load.

### Notes

- `dev` profile uses H2 in-memory database. Data resets on backend restart/sleep.
- For persistent data later, switch to managed database and set datasource env vars.

Do not keep only localhost entries for production.

### 5. Post-Deployment Smoke Test

After both services are live:

1. Open frontend deployed URL.
2. Register a new account.
3. Login with that account.
4. Upload one photo.
5. Confirm photo appears in gallery and remains after refresh.
