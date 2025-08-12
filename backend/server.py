from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from supabase import create_client, Client
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY]):
    raise ValueError("Missing Supabase configuration")

# Initialize Supabase clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(
    title="SkillHub API",
    description="API for the SkillHub service marketplace",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class UserRole(str):
    CUSTOMER = "customer"
    TECHNICIAN = "technician"

class UserProfile(BaseModel):
    id: str
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class ServiceCategory(BaseModel):
    id: str
    name: str
    icon: str
    description: str

class BookingStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Booking(BaseModel):
    id: str
    customer_id: str
    technician_id: Optional[str] = None
    service_type: str
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: str = BookingStatus.PENDING
    created_at: datetime
    updated_at: datetime
    location: Optional[Dict[str, Any]] = None

class CreateBooking(BaseModel):
    service_type: str
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    location: Optional[Dict[str, Any]] = None

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # For now, we'll use a simple token validation
        # In production, you'd validate the JWT token properly
        token = credentials.credentials
        
        # Simple validation - in production, decode and validate JWT
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
            
        # For demo purposes, extract user ID from token
        # In production, decode JWT and extract user info
        return {
            "id": "demo-user-id",
            "email": "demo@example.com",
            "role": "customer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Routes
@api_router.get("/")
async def root():
    return {"message": "SkillHub API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    try:
        # Test Supabase connection
        response = supabase.table('profiles').select('id').limit(1).execute()
        supabase_status = "connected"
    except:
        supabase_status = "disconnected"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "supabase": supabase_status
        }
    }

@api_router.post("/setup-database")
async def setup_database():
    """Setup the database schema for TaskRabbit-like app"""
    try:
        # Create profiles table
        profiles_sql = """
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email text UNIQUE NOT NULL,
          full_name text NOT NULL,
          username text UNIQUE NOT NULL,
          avatar_url text,
          phone text,
          role text CHECK (role IN ('customer', 'tasker')) NOT NULL DEFAULT 'customer',
          hourly_rate decimal(10,2),
          bio text,
          skills text[],
          available boolean DEFAULT true,
          verification_status text CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
          address text,
          city text,
          state text,
          zip_code text,
          latitude decimal(10, 8),
          longitude decimal(11, 8),
          total_tasks_completed integer DEFAULT 0,
          average_rating decimal(3,2) DEFAULT 0,
          total_reviews integer DEFAULT 0,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        """
        
        # Execute using service role
        result = supabase_admin.rpc('exec_sql', {'sql': profiles_sql}).execute()
        
        return {"message": "Database setup completed", "result": result.data}
    except Exception as e:
        logger.error(f"Database setup error: {e}")
        return {"message": "Database setup failed", "error": str(e)}

@api_router.get("/service-categories")
async def get_service_categories():
    """Get TaskRabbit-style service categories"""
    categories = [
        {
            "id": "1",
            "name": "Mounting & Installation", 
            "slug": "mounting",
            "icon": "construct", 
            "color": "#FF6B35",
            "description": "TV mounting, shelves, art, mirrors"
        },
        {
            "id": "2", 
            "name": "Furniture Assembly", 
            "slug": "furniture",
            "icon": "construct", 
            "color": "#4ECDC4",
            "description": "IKEA and other furniture assembly"
        },
        {
            "id": "3", 
            "name": "Moving Help", 
            "slug": "moving",
            "icon": "car", 
            "color": "#45B7D1",
            "description": "Loading, unloading, packing assistance"
        },
        {
            "id": "4", 
            "name": "Cleaning", 
            "slug": "cleaning",
            "icon": "sparkles", 
            "color": "#96CEB4",
            "description": "Home cleaning, deep cleaning, organizing"
        },
        {
            "id": "5", 
            "name": "Delivery", 
            "slug": "delivery",
            "icon": "bicycle", 
            "color": "#FFEAA7",
            "description": "Pick up and delivery services"
        },
        {
            "id": "6", 
            "name": "Handyman", 
            "slug": "handyman",
            "icon": "hammer", 
            "color": "#DDA0DD",
            "description": "General repairs and maintenance"
        },
        {
            "id": "7", 
            "name": "Electrical", 
            "slug": "electrical",
            "icon": "flash", 
            "color": "#FFD93D",
            "description": "Light fixtures, outlets, switches"
        },
        {
            "id": "8", 
            "name": "Plumbing", 
            "slug": "plumbing",
            "icon": "water", 
            "color": "#6C5CE7",
            "description": "Faucets, toilets, minor repairs"
        },
        {
            "id": "9", 
            "name": "Painting", 
            "slug": "painting",
            "icon": "color-palette", 
            "color": "#FF7675",
            "description": "Interior painting, touch-ups"
        },
        {
            "id": "10", 
            "name": "Yard Work", 
            "slug": "yard",
            "icon": "leaf", 
            "color": "#00B894",
            "description": "Lawn care, gardening, landscaping"
        }
    ]
    return categories

@api_router.get("/profiles/{user_id}")
async def get_profile(user_id: str):
    try:
        response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/bookings")
async def get_bookings(current_user: dict = Depends(get_current_user)):
    try:
        # For demo, return empty list
        # In production, query Supabase based on user role
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/bookings")
async def create_booking(booking: CreateBooking, current_user: dict = Depends(get_current_user)):
    try:
        # For demo, return a mock booking
        # In production, create booking in Supabase
        new_booking = {
            "id": str(uuid.uuid4()),
            "customer_id": current_user["id"],
            "service_type": booking.service_type,
            "description": booking.description,
            "scheduled_at": booking.scheduled_at,
            "status": BookingStatus.PENDING,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "location": booking.location
        }
        return new_booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


