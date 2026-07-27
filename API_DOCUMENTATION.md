# HackMatrix API Documentation

This document outlines the REST API endpoints provided by the HackMatrix MERN backend.

- **Base URL**: `http://localhost:5000/api`
- **Headers**: All protected endpoints require a JWT header:
  ```http
  Authorization: Bearer <jwt_token>
  ```

---

## 🔐 Authentication Module (`/api/auth`)

### 1. Register User
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "participant" 
  }
  ```
  *(Roles: `participant`, `organizer`, `judge`)*

### 2. Login User
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns user metadata along with the JWT authentication token.

### 3. Get Current User Info
- **Route**: `GET /api/auth/me`
- **Access**: Private (Protected)

### 4. Update Profile Info
- **Route**: `PUT /api/auth/profile`
- **Access**: Private (Protected)
- **Body**:
  ```json
  {
    "name": "Jane Smith",
    "profile": {
      "bio": "Fullstack web engineer.",
      "techStack": ["React", "TypeScript", "Node.js"],
      "github": "https://github.com/janesmith",
      "linkedin": "https://linkedin.com/in/janesmith",
      "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Jane"
    }
  }
  ```

---

## 🏆 Hackathon Module (`/api/hackathons`)

### 1. Create Hackathon
- **Route**: `POST /api/hackathons`
- **Access**: Private (Organizer/Admin only)
- **Body**:
  ```json
  {
    "title": "InnovateX Global",
    "description": "Develop software systems that improve human productivity.",
    "theme": "AI/Productivity",
    "mode": "online",
    "startDate": "2026-08-01T09:00:00.000Z",
    "endDate": "2026-08-03T18:00:00.000Z",
    "registrationDeadline": "2026-07-31T23:59:59.000Z",
    "prizePool": 20000,
    "maxTeamSize": 4,
    "rules": ["All code must be original.", "Submit video demo."],
    "judgingCriteria": [
      { "name": "Innovation", "maxScore": 10 },
      { "name": "Technical Depth", "maxScore": 10 }
    ]
  }
  ```

### 2. Get All Hackathons (with Filters/Search)
- **Route**: `GET /api/hackathons`
- **Access**: Public
- **Query Params (Optional)**:
  - `search` (Search by title/theme/description)
  - `mode` (`online`, `offline`)
  - `status` (`upcoming`, `ongoing`, `completed`)
  - `registrationOpen` (`true`, `false`)

### 3. Get Hackathon Details
- **Route**: `GET /api/hackathons/:id`
- **Access**: Public

### 4. Assign Judges to Hackathon
- **Route**: `PUT /api/hackathons/:id/judges`
- **Access**: Private (Organizer/Admin only)
- **Body**:
  ```json
  {
    "judgeIds": ["65f123456789abcdef012345"]
  }
  ```

---

## 👥 Team Module (`/api/teams`)

### 1. Create a Team
- **Route**: `POST /api/teams`
- **Access**: Private (Participant only)
- **Body**:
  ```json
  {
    "name": "Neural Knights",
    "hackathonId": "65f111222333abcdeff00001"
  }
  ```
- **Response**: Generates a unique 6-character `inviteCode` (e.g. `B8F12A`) for teammates to join.

### 2. Join Team via Invite Code
- **Route**: `POST /api/teams/join`
- **Access**: Private (Participant only)
- **Body**:
  ```json
  {
    "inviteCode": "B8F12A"
  }
  ```

### 3. Update Team Registration Status
- **Route**: `PUT /api/teams/:id/status`
- **Access**: Private (Organizer/Admin only)
- **Body**:
  ```json
  {
    "status": "approved" 
  }
  ```
  *(Status: `approved`, `rejected`, `pending`)*

---

## 📁 Submission Module (`/api/submissions`)

### 1. Submit Project
- **Route**: `POST /api/submissions`
- **Access**: Private (Participant/Leader only)
- **Body**:
  ```json
  {
    "teamId": "65f222333444abcdeff00002",
    "projectName": "BrainWave AI",
    "problemStatement": "Mental fatigue goes unnoticed in high-stress work environment.",
    "solution": "React dashboard showing cognitive stress levels computed using real-time API integrations.",
    "githubUrl": "https://github.com/alice/brainwave",
    "techStack": ["React", "Express", "Tailwind CSS"],
    "demoUrl": "https://brainwave.vercel.app"
  }
  ```

### 2. Update Project Review Status
- **Route**: `PUT /api/submissions/:id/status`
- **Access**: Private (Organizer/Admin only)
- **Body**:
  ```json
  {
    "status": "under_review"
  }
  ```
  *(Status: `pending`, `under_review`, `approved`, `rejected`)*

---

## 📝 Review & Evaluation Module (`/api/reviews`)

### 1. Submit Evaluation Review
- **Route**: `POST /api/reviews`
- **Access**: Private (Judge only)
- **Body**:
  ```json
  {
    "submissionId": "65f333444555abcdeff00003",
    "scores": [
      { "criterionName": "Innovation", "score": 9 },
      { "criterionName": "Technical Depth", "score": 8 }
    ],
    "feedback": "Outstanding prototype, backend database indexes were configured well."
  }
  ```

### 2. Get Leaderboard Standings
- **Route**: `GET /api/reviews/leaderboard/:hackathonId`
- **Access**: Public
- **Response**: Returns a sorted array of ranked teams based on their average judge scores.

---

## ⚙️ Administration Module (`/api/admin`)

### 1. Get System Analytics
- **Route**: `GET /api/admin/stats`
- **Access**: Private (Admin only)

### 2. Edit User Privileges
- **Route**: `PUT /api/admin/users/:id`
- **Access**: Private (Admin only)
- **Body**:
  ```json
  {
    "role": "organizer",
    "isBlocked": false
  }
  ```
