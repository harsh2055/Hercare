# 🌸 FemCare - Women's Health App

A complete women's health companion with menstrual cycle tracking, pregnancy monitoring, diet & exercise plans, symptom logging, and smart reminders.

---

## 📁 Project Structure

```
project/
  server/           ← Node.js + Express + MongoDB backend
  client/           ← React + Vite + Tailwind frontend
```

---

## ⚙️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Framer Motion  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt  
**Auth:** Firebase Authentication (Email + Google OAuth)  
**Notifications:** Firebase Cloud Messaging

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Firebase project (optional, for Google login)

---

### 1. Clone / Set up the project

```bash
# Navigate to project folder
cd project
```

---

### 2. Backend Setup

```bash
cd server
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**Edit `server/.env`:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/femcare
JWT_SECRET=your_super_secret_key_at_least_32_chars
NODE_ENV=development
```

**Start the backend:**
```bash
npm run dev        # development with nodemon
# or
npm start          # production
```

Server runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd client
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your Firebase config (optional)
```

**Edit `client/.env`:**
```
VITE_API_URL=http://localhost:5000/api

# Firebase (optional - for Google login)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Start the frontend:**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/firebase` | Login/register with Firebase |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| DELETE | `/api/auth/account` | Delete account |

### Cycle Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cycle` | Log a new period |
| GET | `/api/cycle` | Get all cycle logs |
| PUT | `/api/cycle/:id` | Update a cycle log |
| POST | `/api/cycle/:id/symptom` | Add symptom to log |

### Pregnancy
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pregnancy` | Create pregnancy entry |
| GET | `/api/pregnancy` | Get active pregnancy |
| PUT | `/api/pregnancy` | Update pregnancy |

### Diet & Exercise
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diet?phase=follicular` | Get diet by cycle phase |
| GET | `/api/diet?trimester=1` | Get diet by trimester |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminder` | Create reminder |
| GET | `/api/reminder` | Get all reminders |
| PUT | `/api/reminder/:id` | Update reminder |
| DELETE | `/api/reminder/:id` | Delete reminder |

---

## 🌍 Supported Languages
- English (en)
- Hindi (hi) - हिंदी
- Marathi (mr) - मराठी

---

## 🔐 Security Features
- JWT authentication on all protected routes
- bcrypt password hashing (salt rounds: 12)
- User data isolation (can only access own data)
- Account deletion endpoint
- HTTPS-ready CORS configuration

---

## 🏥 Medical Disclaimer
FemCare is for **informational purposes only** and is **not a substitute** for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.

---

## 🔧 Firebase Setup (for Google Login)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication → Sign-in methods → Google + Email/Password
4. Get your config from Project Settings → Your apps
5. Add config values to `client/.env`

The app works without Firebase (email/password auth via JWT still works).

---

## 📱 Features Overview

| Feature | Description |
|---------|-------------|
| 🌙 Cycle Tracking | Log periods, predict next cycle, ovulation window |
| 🤰 Pregnancy | Week-by-week guidance, trimester info, baby size |
| 🥗 Diet Plans | Phase/trimester-specific nutrition & exercise |
| 😣 Symptoms | Log symptoms with severity rating |
| 🔔 Reminders | Smart reminders for periods, meds, appointments |
| 🌍 Multi-language | English, Hindi, Marathi |
| 🔒 Privacy | JWT-secured, encrypted passwords |
