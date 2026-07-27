# HackMatrix — Hackathon Management Platform

HackMatrix is a centralized Capstone Platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js) to streamline registration, team formation, project submission, and judge evaluations for hackathons.

It replaces fragmented tools like Google Forms, WhatsApp, Excel Sheets, and Google Drive with one unified workspace.

---

## 🚀 Key Features

### 👤 Four Specialized User Roles

1. **Administrator (Platform Owner)**
   - Dashboard statistics and system counters.
   - User control desk (manage profile roles, block/unblock accounts, delete users).
   - Global hackathon override (delete any event).
   
2. **Organizer (Event Creator)**
   - Create, edit, and publish hackathons (custom themes, timelines, banners, rulebooks, and judging rubrics).
   - Review team registrations (approve, reject, or mark pending).
   - Assign judges to events.
   - Monitor submissions and publish final standings.

3. **Participant (Student/Developer)**
   - Custom developer profile with biography and tech stack tags.
   - Browse events and register.
   - **Team Management Workspace**: Create teams, invite teammates via unique invite codes, transfer leadership, or remove members.
   - Project Submissions: Upload repo links, live demo URLs, screenshots, problem/solution sheets, and presentation PDFs before the deadline.

4. **Judge (Evaluator)**
   - Dedicated evaluation panel showing assigned projects.
   - Grade projects based on specific criteria (e.g., Innovation, UI/UX, Complexity) with comment support.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router DOM, Axios, Tailwind CSS, Recharts (analytics), Lucide React (icons)
- **Backend**: Node.js, Express.js, JWT (authentication), bcryptjs (password hashing)
- **Database**: MongoDB (Mongoose schemas)

---

## 📂 Project Structure

```text
/hackmatrix
  /backend
    /config           # Database connection setup
    /middleware       # JWT token verification and authorization checks
    /models           # Mongoose schemas (User, Hackathon, Team, Submission, Review)
    /controllers      # API request handlers
    /routes           # API endpoints routing
    seed.js           # Database seeder script
    server.js         # Entry server file
  /frontend
    /src
      /components     # Common cards, buttons, layouts
      /context        # Global auth state and Axios configurations
      /pages          # Home, Auth, Listings, and Dashboards
      App.jsx         # Router setup and Route guards
      main.jsx        # App renderer
      index.css       # Custom styles
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- Active MongoDB database cluster (local or MongoDB Atlas)

### 1. Database Configuration
In the `backend/` folder, create/open the `.env` file and configure your variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 2. Seed Sample Data
Populate the database with sample data (organizers, judges, teams, and submissions) so you can test immediately:
1. Navigate to the `backend/` directory.
2. Run:
   ```bash
   npm run seed
   ```

### 3. Run Backend Server
From the `backend/` directory, launch the API server:
```bash
npm start
```
The server starts listening on `http://localhost:5000/`.

### 4. Run Frontend Client
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🔑 Seeded Test Accounts

All accounts share the password **`password123`**:

| Role | Email |
| :--- | :--- |
| **Admin** | `admin@hackmatrix.com` |
| **Organizer** | `org1@hackmatrix.com` |
| **Judge** | `judge1@hackmatrix.com` |
| **Participant** | `part1@hackmatrix.com` |
| **Teammate** | `part2@hackmatrix.com` |
