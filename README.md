# ⚡ Gen AI Job Preparation

A full-stack AI-powered job preparation platform built with React, Node.js, MongoDB, and Google Gemini.

---

## 🗂 Project Structure

```
gen-ai-job-prep/
├── backend/
│   ├── config/          # DB + Gemini setup
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth + Upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Text extractor, scraper, token utils
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/  # Layout, UI primitives
    │   ├── hooks/       # useAuth context
    │   ├── pages/       # Login, Register, Dashboard, Resume, Job, Results
    │   └── services/    # Axios API layer
    ├── index.html
    └── .env.example
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (free at https://aistudio.google.com/apikey)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gen-ai-job-prep
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
GEMINI_API_KEY=AIzaSy...your_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev    # development with nodemon
# or
npm start      # production
```

Backend will run at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default 5000) | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | `development` or `production` | No |
| `FRONTEND_URL` | CORS allowed origin | No |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |

---

## 🌐 API Reference

### Auth
```
POST /api/auth/register    { name, email, password }
POST /api/auth/login       { email, password }
GET  /api/auth/me          (Bearer token required)
```

### Resume
```
POST /api/resume/upload    multipart/form-data { resume: File }
GET  /api/resume/:userId
```

### Job
```
POST /api/job/analyze      { url?, manualText?, title?, company? }
GET  /api/job/list
GET  /api/job/:jobId
```

### AI (all require resume to be uploaded first)
```
POST /api/ai/skill-gap            { jobId }
POST /api/ai/interview-questions  { jobId }
POST /api/ai/optimize-resume      { jobId }
```

---

## ☁️ Deployment

### Backend → Render / Railway

1. Push backend folder to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables in the dashboard
6. Set `NODE_ENV=production`

> **Note on Puppeteer**: Render's free tier supports Puppeteer. Add this env var:
> `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false`

### Frontend → Vercel / Netlify

1. Push frontend folder to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Framework preset: `Vite`
4. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy!

---

## 🧪 Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 🔧 Troubleshooting

| Issue | Fix |
|---|---|
| MongoDB connection error | Ensure mongod is running or Atlas URI is correct |
| Gemini API error | Verify `GEMINI_API_KEY` is valid and has quota |
| Puppeteer scraping fails | Use "Paste Text" tab instead |
| PDF parse returns empty | Ensure PDF is text-based, not a scanned image |
| CORS error | Set `FRONTEND_URL` in backend `.env` |

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| AI | Google Gemini 1.5 Flash |
| File Parsing | pdf-parse, mammoth |
| Scraping | Puppeteer |
| HTTP Client | Axios |
