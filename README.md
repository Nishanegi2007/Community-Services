# Alice Public School Website

A group project to build a website for Alice Public School. The current code includes a React and Vite frontend with school information pages, plus an Express backend with starter register, login, and logout routes. The project is still in progress; see [Project status](#project-status).

## Project structure

```text
frontend/   React, Vite, and school website pages/components
backend/    Express server and authentication-related code
```

## Requirements

- Node.js and npm
- MongoDB, if you are working on the backend

## Getting started

### Join the repository

If you have been invited as a collaborator, accept the invitation in your email or GitHub notifications. The repository is [Community-Services](https://github.com/Nishanegi2007/Community-Services).

### Clone and create a branch

Clone the repository once, then create a separate branch for each task:

```bash
git clone https://github.com/Nishanegi2007/Community-Services.git
cd Community-Services
git checkout main
git pull origin main
git checkout -b feature/short-task-name
```

Use a descriptive branch name, such as `feature/admissions-page` or `fix/gallery-images`.

### Commit, push, and open a pull request

After making your changes, review them and commit only the files related to your task:

```bash
git status
git add <file-or-folder>
git commit -m "Describe the change"
git push -u origin feature/short-task-name
```

On GitHub, open the repository and create a pull request from your branch into `main`. Add a short summary and ask a teammate to review it before merging.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`).

### Backend

```bash
cd backend
npm install
npm start
```

The server is configured to listen on port `3000`. Create a `backend/.env` file with your MongoDB connection string before starting the backend:

```env
MONGO_URI=your_mongodb_connection_string
```

Do not commit `.env` files or real credentials. Confirm the backend dependencies are installed; the current server code imports `dotenv`, `cookie-parser`, and `mongoose`.

## Current frontend pages

- Home
- About
- Gallery
- Admissions
- Principal
- Student Life
- Contact

## Project status

This is an unfinished group project. Before building or running, the team should review and resolve these known gaps:

- `frontend/src/App.jsx` imports a `Principal` page that is not currently present in `frontend/src/pages/`.
- The frontend uses `react-router-dom`, but it is not currently listed in `frontend/package.json`.
- The backend imports `dotenv`, `cookie-parser`, and `mongoose`, but they are not currently listed in `backend/package.json`.
- The gallery data refers to `/images/photo*.svg`; add those assets or update the paths.
- The backend connects to MongoDB and exposes authentication routes, but the API and frontend are not yet wired together.
- Some school details and sample content in `frontend/src/data.js` may be placeholders. Confirm them before presenting the site as factual.

## Working as a team

- Pull the latest changes before starting work and commit changes in small, focused updates.
- Coordinate before editing the same files, especially shared styles, routes, and data.
- Keep secrets and local environment files out of Git.
- Update this README when setup steps, features, or project structure change.
