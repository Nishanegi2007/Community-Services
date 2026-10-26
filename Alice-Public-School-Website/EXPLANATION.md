# How the upgraded website works

- React/Vite serves public pages and the admin dashboard.
- Express validates public admission enquiries and saves them in MongoDB. If Google Sheets is configured, it also appends the enquiry to `Sheet1`.
- Admin passwords are compared using bcrypt hashes. A JWT expires after eight hours and is required for every `/api/admin/*` route.
- MongoDB stores admissions, events, news/announcements, and gallery albums. Only published content is returned to public API routes.
- Uploaded images are stored in `Back-end/uploads` for local development. Production deployments should use persistent or cloud storage.

## Main API routes
- `POST /api/admissions` — public admission enquiry
- `GET /api/events`, `GET /api/news`, `GET /api/gallery` — public published content
- `POST /api/login` — admin login
- `/api/admin/admissions` and `/api/admin/admissions/:id/status` — enquiry management
- `/api/admin/events` — event CRUD
- `/api/admin/announcements` — news CRUD
- `/api/admin/gallery` — gallery album CRUD and image removal

See `README.md` for setup and environment variables.
