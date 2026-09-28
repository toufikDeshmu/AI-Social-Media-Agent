# AI Social Media Agent

An AI-powered social media content management system that automates **content generation, review, improvement, approval, repurposing, scheduling, and publishing** through an agent-based workflow.

> **Note:** Publishing is currently simulated locally through the database. Real social-media API integration is planned as future work.

---

## 🚀 Features

* 🤖 **AI Content Generation** — Generate posts based on platform, topic, tone, audience, and custom instructions.
* 🔍 **AI Review Agent** — Provides a quality score, feedback, and improvement suggestions.
* ✨ **AI Improvement** — Improves content based on review feedback.
* 👤 **Human Approval** — Requires approval before repurposing, scheduling, or publishing.
* 🔄 **Content Repurposing** — Generates platform-specific content for LinkedIn, Instagram, X, and Facebook.
* 📅 **Post Scheduling** — Schedule approved posts for a future date and time.
* ⚙️ **Automatic Publishing** — Automatically changes scheduled posts to published when their scheduled time is reached.
* 📊 **Post History & Analytics** — Track generated, reviewed, approved, scheduled, and published posts.

---

## 🧠 AI Workflow

```text
Content Agent
      ↓
Review Agent
      ↓
Quality Decision
      ↓
Improve Agent (if required)
      ↓
Human Approval
      ↓
Repurpose Agent
      ↓
Schedule / Publish
      ↓
Published
```

---

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* React Router
* Lucide React

**Backend**

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Groq API

**Database**

* SQLite

---

## 📁 Project Structure

```text
AI-Social-Media-Agent/
│
├── backend/
│   ├── main.py
│   └── database.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/toufikDeshmu/AI-Social-Media-Agent.git
cd AI-Social-Media-Agent
```

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv groq
```

Create `.env` inside `backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the backend:

```powershell
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 📅 Automatic Scheduling

Approved posts can be scheduled for a future time.

```text
Scheduled
    ↓
Scheduled time reached
    ↓
Automatically published
```

The current implementation simulates publishing by updating the post status in SQLite.

---

## 🔮 Future Scope

* Real LinkedIn publishing
* Instagram, X, and Facebook API integration
* OAuth authentication
* Advanced analytics
* Engagement tracking
* AI-generated hashtags and images
* Cloud deployment

---

## 👨‍💻 Author

**Toufik Deshmukh**
BTech Artificial Intelligence and Machine Learning
MGM University

GitHub: [@toufikDeshmu](https://github.com/toufikDeshmu)

---

## 📄 License

This project is intended for educational and project-development purposes.
