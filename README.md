# Alice Public School Website

A group project for Alice Public School, serving Nursery through Class V in Molarband Extension, Badarpur, New Delhi. It includes public information pages and a single-admin dashboard for announcements, gallery photos, and admission/contact enquiries.

**School contact:** 155E, Khajoor Rd, Block C, Molarband Extension, Badarpur, New Delhi, Delhi 110044 · [+91 98991 37983](tel:+919899137983)

## Features

- Public pages: Home, About, Gallery, Admissions, Principal, Student Life, and Contact.
- Admin sign-in at `/admin`; public admin registration is disabled.
- Create, edit, publish/unpublish, and delete announcements.
- Upload and delete gallery photos. Uploads use Multer in memory and ImageKit for storage; JPEG, PNG, and WebP files up to 5 MB are accepted.
- Public contact and admissions forms save enquiries. Admins can review enquiries, change their status, and delete them.
- JWT authentication is stored in an HTTP-only cookie.

## Project structure

```text
frontend/   React, Vite, website pages, components, and admin dashboard
backend/    Express API, MongoDB models, authentication, and ImageKit integration
```

## Requirements

- Node.js and npm
- MongoDB (local or hosted)
- An ImageKit account and private key for gallery uploads

## Setup

### 1. Configure the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` inside `backend/`, then set the values for your environment:

```env
MONGO_URI=mongodb://127.0.0.1:27017/alice_public_school
JWT_SECRET=replace_with_a_random_secret_at_least_32_bytes_long
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
ADMIN_NAME=School Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_unique_password_of_at_least_12_bytes
```

Use a random `JWT_SECRET` of at least 32 bytes and a unique admin password of at least 12 bytes. Keep all real credentials in `backend/.env`; never put ImageKit's private key in frontend code or a `VITE_` variable, and never commit `.env` files. `FRONTEND_ORIGIN` must match the frontend's exact origin.

With MongoDB available and the environment configured, create the first admin account and start the API:

```bash
npm run seed:admin
npm start
```

The API runs at `http://localhost:3000` by default. Run the seed command once to create the admin. It does not overwrite an existing account or reset its password.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). The frontend uses `http://localhost:3000/api` by default. To use another API origin, create `frontend/.env` and set `VITE_API_URL`, for example:

```env
VITE_API_URL=http://localhost:3000/api
```

## Admin dashboard

Open `/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the backend environment. Admins can manage announcements and gallery items and process submitted enquiries. The login endpoint is rate-limited, and admin routes require the authenticated cookie.

## API overview

All routes are under `/api`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public, rate-limited | Sign in as admin |
| `POST` | `/auth/logout` | Public | Clear the session cookie |
| `GET` | `/auth/me` | Admin | Check the current session |
| `GET` | `/announcements` | Public | List current published announcements |
| `GET`, `POST` | `/announcements/admin` | Admin | List all, or create an announcement |
| `PATCH`, `DELETE` | `/announcements/admin/:id` | Admin | Update or delete an announcement |
| `GET` | `/gallery` | Public | List gallery photos |
| `GET`, `POST` | `/gallery/admin` | Admin | List photos, or upload one (`photo` field) |
| `DELETE` | `/gallery/admin/:id` | Admin | Remove a photo |
| `POST` | `/inquiries` | Public, rate-limited | Submit an enquiry |
| `GET` | `/inquiries/admin` | Admin | List enquiries |
| `PATCH` | `/inquiries/admin/:id/status` | Admin | Change enquiry status |
| `DELETE` | `/inquiries/admin/:id` | Admin | Delete an enquiry |

## Team workflow

Clone the repository and create a focused branch for each task:

```bash
git clone https://github.com/Nishanegi2007/Community-Services.git
cd Community-Services
git checkout -b feature/short-task-name
```

Pull the latest changes before starting, coordinate when editing shared files, and keep commits focused. Before opening a pull request:

```bash
git status
git add <file-or-folder>
git commit -m "Describe the change"
git push -u origin feature/short-task-name
```

Open a pull request into `main` and ask a teammate to review it.

## Before presenting the site

Confirm that school-specific details and any sample content in `frontend/src/data.js` are accurate. Gallery uploads require working MongoDB and ImageKit configuration. In production, use HTTPS and set `NODE_ENV=production` so authentication cookies are marked secure.
