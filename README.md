Great job completing all the functionalities! Here's a professional and complete `README.md` for your full-stack note-taking application project:

---

````markdown
# ✍️ Notes App

A full-stack note-taking application where users can sign up using email + OTP or Google login, securely create/delete notes, and view their user profile. The app is built with modern technologies and fully mobile-responsive following the provided UI design.

---

## 🚀 Live Demo

🌐 [Visit the Deployed App](https://your-deployment-url.com)

---

## 📸 Preview

> ![App Preview](./assets/preview.png)  
*(Replace with actual screenshots or GIFs)*

---

## 🧰 Tech Stack

### Frontend
- ⚛️ React.js (TypeScript)
- 📱 Fully responsive (mobile-first)
- 🔐 Form validation and error handling

### Backend
- 🟦 Node.js + Express (TypeScript)
- 🔐 JWT for authentication and authorization
- 📤 SendGrid for OTP email verification
- 📦 Google OAuth2 integration

### Database
- 🍃 MongoDB (Mongoose ORM)

---

## 🔑 Features

- ✅ Email + OTP signup with validation
- ✅ Google account login/signup (OAuth2)
- ✅ JWT-based authentication
- ✅ Create/Delete personal notes
- ✅ Display welcome page with user info
- ✅ Mobile-friendly, pixel-perfect UI
- ✅ API error handling with toast/messages

---

## 📁 Folder Structure

```bash
📦 root
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── index.ts
│   ├── .env
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   ├── public/
│   └── vite.config.ts
├── .gitignore
├── README.md
└── package.json
````

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/notes-app.git
cd notes-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Create `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_SENDER=verified_email@example.com
```

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Update `.env` in frontend if needed:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Google OAuth Setup

* Go to [Google Cloud Console](https://console.cloud.google.com/)
* Create OAuth credentials
* Add `http://localhost:5173` and your deployed URL as redirect URIs
* Save `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`

---

## 🧪 API Endpoints

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/verify-otp`
* `POST /api/auth/google`
* `POST /api/auth/login`

### Notes

* `GET /api/notes`
* `POST /api/notes`
* `DELETE /api/notes/:id`

All notes routes require a valid JWT in the `Authorization` header.

---

## 🛡️ Security

* Passwords and OTPs never stored in plain text
* JWT-based authorization
* Input validation and sanitization
* Environment variables excluded via `.gitignore`

---

## ✅ Todos

* [x] Email + OTP signup
* [x] Google OAuth
* [x] Note creation/deletion
* [x] JWT auth
* [x] Mobile responsive
* [x] Deployment

---

## 📤 Deployment

You can deploy using:

### Frontend

* [Vercel](https://vercel.com/)


### Backend

* [Render](https://render.com/)

---

## 📄 License

MIT License

---





```


