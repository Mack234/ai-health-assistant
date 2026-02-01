from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    token: str
    user: User

class ChatMessageCreate(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message: str
    response: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SymptomCheckRequest(BaseModel):
    symptoms: str
    duration: Optional[str] = None
    severity: Optional[str] = None

class SymptomCheckResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symptoms: str
    analysis: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HealthMetricCreate(BaseModel):
    metric_type: str  # weight, blood_pressure, glucose, heart_rate
    value: str
    unit: str
    notes: Optional[str] = None

class HealthMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    metric_type: str
    value: str
    unit: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReminderCreate(BaseModel):
    reminder_type: str  # medication or appointment
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    repeat: Optional[str] = "none"  # none, daily, weekly

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    reminder_type: str
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    repeat: str = "none"
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"user_id": user_id, "exp": expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['password_hash'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password_hash'})
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

# AI Chat Routes
@api_router.post("/chat/message", response_model=ChatMessageResponse)
async def send_chat_message(data: ChatMessageCreate, user_id: str = Depends(get_current_user)):
    session_id = data.session_id or str(uuid.uuid4())
    
    try:
        # Initialize AI Chat
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=session_id,
            system_message="You are a helpful AI health assistant. Provide informative, supportive health advice. Always remind users to consult healthcare professionals for serious concerns. Keep responses conversational and empathetic."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=data.message)
        ai_response = await chat.send_message(user_message)
        
        # Save to database
        chat_msg = ChatMessageResponse(
            user_id=user_id,
            session_id=session_id,
            message=data.message,
            response=ai_response
        )
        
        msg_dict = chat_msg.model_dump()
        msg_dict['created_at'] = msg_dict['created_at'].isoformat()
        await db.chat_messages.insert_one(msg_dict)
        
        return chat_msg
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/chat/history", response_model=List[ChatMessageResponse])
async def get_chat_history(session_id: Optional[str] = None, user_id: str = Depends(get_current_user)):
    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id
    
    messages = await db.chat_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(100)
    
    for msg in messages:
        if isinstance(msg['created_at'], str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

# Symptom Checker
@api_router.post("/symptoms/analyze", response_model=SymptomCheckResponse)
async def analyze_symptoms(data: SymptomCheckRequest, user_id: str = Depends(get_current_user)):
    try:
        # Create a focused prompt for symptom analysis
        prompt_text = f"Analyze these symptoms: {data.symptoms}"
        if data.duration:
            prompt_text += f" Duration: {data.duration}"
        if data.severity:
            prompt_text += f" Severity: {data.severity}"
        prompt_text += "\n\nProvide: 1) Possible conditions 2) When to seek medical care 3) Self-care tips. Keep it concise and clear."
        
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=str(uuid.uuid4()),
            system_message="You are a medical symptom analyzer. Provide helpful analysis but always emphasize consulting healthcare professionals."
        ).with_model("openai", "gpt-5.2")
        
        analysis = await chat.send_message(UserMessage(text=prompt_text))
        
        symptom_report = SymptomCheckResponse(
            user_id=user_id,
            symptoms=data.symptoms,
            analysis=analysis
        )
        
        report_dict = symptom_report.model_dump()
        report_dict['created_at'] = report_dict['created_at'].isoformat()
        await db.symptom_reports.insert_one(report_dict)
        
        return symptom_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@api_router.get("/symptoms/history", response_model=List[SymptomCheckResponse])
async def get_symptom_history(user_id: str = Depends(get_current_user)):
    reports = await db.symptom_reports.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    for report in reports:
        if isinstance(report['created_at'], str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    
    return reports

# Health Metrics
@api_router.post("/metrics", response_model=HealthMetric)
async def add_health_metric(data: HealthMetricCreate, user_id: str = Depends(get_current_user)):
    metric = HealthMetric(user_id=user_id, **data.model_dump())
    metric_dict = metric.model_dump()
    metric_dict['created_at'] = metric_dict['created_at'].isoformat()
    await db.health_metrics.insert_one(metric_dict)
    return metric

@api_router.get("/metrics", response_model=List[HealthMetric])
async def get_health_metrics(metric_type: Optional[str] = None, user_id: str = Depends(get_current_user)):
    query = {"user_id": user_id}
    if metric_type:
        query["metric_type"] = metric_type
    
    metrics = await db.health_metrics.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for metric in metrics:
        if isinstance(metric['created_at'], str):
            metric['created_at'] = datetime.fromisoformat(metric['created_at'])
    
    return metrics

@api_router.delete("/metrics/{metric_id}")
async def delete_health_metric(metric_id: str, user_id: str = Depends(get_current_user)):
    result = await db.health_metrics.delete_one({"id": metric_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Metric not found")
    return {"message": "Metric deleted"}

# Reminders
@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(data: ReminderCreate, user_id: str = Depends(get_current_user)):
    reminder = Reminder(user_id=user_id, **data.model_dump())
    reminder_dict = reminder.model_dump()
    reminder_dict['created_at'] = reminder_dict['created_at'].isoformat()
    reminder_dict['scheduled_time'] = reminder_dict['scheduled_time'].isoformat()
    await db.reminders.insert_one(reminder_dict)
    return reminder

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders(user_id: str = Depends(get_current_user)):
    reminders = await db.reminders.find({"user_id": user_id}, {"_id": 0}).sort("scheduled_time", 1).to_list(100)
    
    for reminder in reminders:
        if isinstance(reminder['created_at'], str):
            reminder['created_at'] = datetime.fromisoformat(reminder['created_at'])
        if isinstance(reminder['scheduled_time'], str):
            reminder['scheduled_time'] = datetime.fromisoformat(reminder['scheduled_time'])
    
    return reminders

@api_router.patch("/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: str, user_id: str = Depends(get_current_user)):
    result = await db.reminders.update_one(
        {"id": reminder_id, "user_id": user_id},
        {"$set": {"completed": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder completed"}

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, user_id: str = Depends(get_current_user)):
    result = await db.reminders.delete_one({"id": reminder_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted"}

# User Profile
@api_router.get("/profile", response_model=User)
async def get_profile(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()