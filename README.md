# CodeSprint 🚀

CodeSprint is a full-stack, interactive **LeetCode Clone** designed for developers to practice programming questions. It features a compiler engine to run and submit code in multiple languages, user profile progress tracking, historical attempt reviews, and an interactive **Gemini AI Coding Assistant (via Groq Llama-3.3)** to review compiler errors and provide hints. It also includes an administrative panel for creating and validating problems.

---

## 🛠️ Tech Stack

### Frontend
* **React**: Component-driven architecture using hooks (`useState`, `useEffect`) for state management.
* **Vite**: Ultra-fast bundler and hot-reloading development server.
* **Vanilla CSS**: Premium, responsive layouts, glassmorphic navigations, and custom overlays.

### Backend
* **Node.js & Express**: RESTful API endpoints.
* **MongoDB & Mongoose**: Object modeling schemas for users, problems, and submissions.
* **Redis (RedisLabs Cloud)**: Fast in-memory caching to blacklist JWT tokens on user logout.
* **Groq API**: High-speed AI inference running the **Llama-3.3-70b** model for real-time coding hints.
* **JDoodle / Piston Execution API**: Underlying remote sandbox compilers evaluating user code execution.

---

## 🌟 Key Features

* **Secure Authentication & Session Authorization**: Logins, registrations, and HTTP-only token cookies separating user and admin views.
* **Programming Editor Workspace**: Controlled editing board supporting language selection, real-time code typing, test case dry-runs, and full compilation submissions.
* **Gemini AI Coding Assistant (AiDrawer)**: Floating panel offering context-aware suggestions (binds active code, selected language, and run outputs to chat queries).
* **Developer User Profile**: Historical log summarizing overall solved counts, submissions volume, and detailed inspectors of code scripts submitted per solved question.
* **Admin Control Panel**: Interface to add new problems (validating starter structures against invisible test cases), delete problems, monitor global platform logs, and register new admins.

---

## 📂 Project Structure

```
leetcode proj/
├── leetcode proj backend/      # Express API Server
│   ├── src/
│   │   ├── config/             # MongoDB & Redis configurations
│   │   ├── controllers/        # Auth, Problem CRUD, Submissions, AI help
│   │   ├── middleware/         # Admin & User JWT authorizers
│   │   ├── models/             # Schema definitions
│   │   ├── routes/             # Express routes maps
│   │   ├── utils/              # Validators and compiler utilities
│   │   └── index.js            # Express Entrypoint
│   └── package.json
│
└── leetcode proj frontend/     # React Single-Page Application
    ├── src/
    │   ├── components/         # Modular layout views (Header, AI Drawer, Workspace)
    │   ├── utils/              # fetch API wrappers
    │   ├── main.jsx            # React mount script
    │   └── styles.css          # Styling CSS
    ├── index.html              # HTML DOM target
    ├── vite.config.js          # Vite config (enforces port 5173)
    └── package.json
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisite
* Make sure you have **Node.js** and **npm** installed.
* You need access to a running **MongoDB** instance and a **Redis** instance.
* Get a **Groq API Key** (from [console.groq.com](https://console.groq.com/)).

### 2. Backend Setup
1. Open a terminal in the `leetcode proj backend` directory.
2. Run installation:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory and configure variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_KEY=your_secret_jwt_sign_key
   GROQ_API_KEY=your_groq_api_key
   redis_pass=your_redis_password
   ```
4. Start the server (uses nodemon for development auto-refresh):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a terminal in the `leetcode proj frontend` directory.
2. Run installation:
   ```bash
   npm install
   ```
3. Start the development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/`.
