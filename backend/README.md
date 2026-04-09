# 🦷 DentCare Pro — Backend

## ▶️ How to start the server

```bash
node server.js
```

That's it. No npm install needed — node_modules is already included.

## 🌐 Access

- Frontend: http://localhost:3000
- API:       http://localhost:3000/api

## 📋 Requirements

- Node.js v16 or higher
- Download from: https://nodejs.org

## 🔑 Default Login

Check the seed data in database/seeds/seed.sql for usernames and passwords.

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Login |
| GET/POST/PUT/DELETE | /api/patients | Patients CRUD |
| GET/POST/PUT/DELETE | /api/appointments | Appointments CRUD |
| GET/POST/PUT/DELETE | /api/doctors | Doctors CRUD |
| GET/POST/PUT/DELETE | /api/treatments | Treatments CRUD |
| GET/POST/DELETE | /api/transactions | Finance CRUD |
| GET/POST/PUT/DELETE | /api/inventory | Inventory CRUD |
| GET/POST/PUT/DELETE | /api/users | Users CRUD |
| GET/PUT | /api/settings | Settings |
| GET | /api/stats | Dashboard stats |
