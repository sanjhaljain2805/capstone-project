# DeadlineOrbit — Deadline Manager

DeadlineOrbit is a full-stack web application for managing tasks and deadlines.

## Features
- Create, Read, Update, and Delete deadlines.
- "Antigravity" space-themed UI.
- Browser notifications for deadlines due within 24 hours.
- Simple Node.js/Express backend with file-based storage.

## How to Run

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```
2. **Start the Server**:
   ```bash
   node server.js
   ```
3. **Access the App**:
   Open `http://localhost:3000` in your browser.

## File Structure
- `backend/server.js`: API routes and server logic.
- `backend/deadlines.json`: Data storage.
- `frontend/`: Static assets (HTML, CSS, JS).
