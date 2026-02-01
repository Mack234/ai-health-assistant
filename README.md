# AI-Powered Health Assistant

A comprehensive AI-powered health management platform built with React, FastAPI, and MongoDB.

## Features

- 🤖 **AI Health Chat** - GPT-5.2 powered conversational health assistant
- 🔍 **Symptom Checker** - AI-powered symptom analysis with medical guidance
- 📊 **Health Metrics Tracking** - Track weight, blood pressure, glucose, heart rate with visualizations
- ⏰ **Smart Reminders** - Medication and appointment management
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS and Shadcn components

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Shadcn UI Components
- Recharts for data visualization
- Axios for API calls

### Backend
- FastAPI (Python)
- Motor (Async MongoDB driver)
- emergentintegrations (AI integration)
- JWT authentication
- bcrypt for password hashing

### Database
- MongoDB

## Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- OpenAI API key or Emergent LLM key

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-health-assistant
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="health_assistant"
JWT_SECRET="your-secure-random-secret-here"
EMERGENT_LLM_KEY="your-openai-key-here"
CORS_ORIGINS="http://localhost:3000"
EOF

# Run backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup

```bash
cd frontend
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Run frontend
yarn start
```

### 4. Access the Application

Open http://localhost:3000 in your browser

## Environment Variables

### Backend (.env)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `EMERGENT_LLM_KEY` - API key for AI integration
- `CORS_ORIGINS` - Allowed CORS origins

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL

## Deployment

### Using Docker (Recommended)

```bash
# Build and run with docker-compose
docker-compose up -d
```

### Traditional Deployment

1. Deploy backend to Railway/Render/AWS
2. Deploy frontend to Vercel/Netlify
3. Use MongoDB Atlas for database

## Project Structure

```
/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context
│   │   └── services/     # API services
│   ├── package.json      # Node dependencies
│   └── .env             # Environment variables
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/profile` - Get user profile

### Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Symptoms
- `POST /api/symptoms/analyze` - Analyze symptoms
- `GET /api/symptoms/history` - Get symptom history

### Health Metrics
- `POST /api/metrics` - Add health metric
- `GET /api/metrics` - Get health metrics
- `DELETE /api/metrics/{id}` - Delete metric

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - Get reminders
- `PATCH /api/reminders/{id}/complete` - Complete reminder
- `DELETE /api/reminders/{id}` - Delete reminder

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- CORS configured for security
- MongoDB queries use projections to exclude sensitive fields

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, FastAPI, and MongoDB
