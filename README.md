# Umbrella English Quiz Platform

Public version of the site shows sample quizzes, a leaderboard and a join page for live rooms.

## Stack

- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + Socket.IO
- Data layer: PostgreSQL when `DATABASE_URL` is set, otherwise in-memory fallback for local development

## Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and is now also available from other devices in the same local network.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` and accepts connections from your local network.

### PostgreSQL / Railway

- Set `DATABASE_URL` in Railway or in your local environment.
- On startup the backend now creates the required tables automatically:
  - `quizzes`
  - `quiz_questions`
  - `live_rooms`
  - `live_room_players`
  - `quiz_results`
- The default sample quizzes are seeded automatically into PostgreSQL.
- If `DATABASE_URL` is missing, the app falls back to the previous in-memory mode.

## Open from another device

1. Start both servers:

```bash
cd backend
npm run dev

cd frontend
npm run dev
```

2. Find your computer's local IP address, for example `192.168.1.25`.
3. Open `http://YOUR_IP:5173` on the phone, tablet, or laptop connected to the same Wi-Fi/router.
4. If Windows asks about firewall access for Node.js, allow it for private networks.

The frontend automatically connects to the backend on the same IP using port `4000`.

## Teacher access

- Teacher tools are hidden from the public navigation
- Open `/teacher` directly to enter the protected area
- Login credentials:
  - Username: `admin`
  - Password: `teacher`

## Public site

- Sample quizzes on the main page
- Public sample leaderboard on the main page
- `Join` page for live rooms at `/live`

## Features

- Solo quiz mode with shuffled questions and answers
- Anti-cheat tracking for `visibilitychange` and `blur`
- Warning after more than 2 violations and auto-finish after more than 3
- Separate protected teacher area for hosting live exams
- Teacher-selected timer per question
- Speed-based scoring with a maximum of `100` points per question
- Instructor-paced and student-paced live modes
- QR code generation for student entry
- Local result history in the browser
- Pleasant sound feedback for correct and wrong answers
- Leaderboard for live sessions

## Structure

```text
frontend/
  src/
    components/
    hooks/
    lib/
    pages/
backend/
  data/
  models/
  routes/
  socket/
```
