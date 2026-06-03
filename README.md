# Placement Recruitment Management System Backend

Express + MongoDB Atlas backend for user authentication and protected REST APIs.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Your local `.env` should include:

```env
EXTERNAL_API_BASE_URL=https://t4e-testserver.onrender.com/api
EXTERNAL_STUDENT_ID=ROSHANSANJAY D
EXTERNAL_STUDENT_PASSWORD=141874
```

## MongoDB Atlas Cluster

1. Open MongoDB Atlas and create a free M0 cluster.
2. Create a database user with a strong password.
3. Add your IP address under Network Access.
4. Copy the Node.js connection string.
5. Put it in `.env` as `MONGO_URI`.

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/placement_recruitment?retryWrites=true&w=majority
```

## Auth APIs

### Register

`POST /auth/register`

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

Roles: `admin`, `placement_officer`, `student`

### Login

`POST /auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Current User

`GET /auth/me`

Header:

```http
Authorization: Bearer <token>
```

## Dataset APIs

The server fetches the assessment dataset once during startup and keeps it available for the frontend.

```http
GET /dataset
GET /dataset/count
```
