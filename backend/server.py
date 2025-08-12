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

# ======================================
# TASKRABBIT-STYLE API ENDPOINTS
# ======================================

# Task Management
@api_router.get("/tasks")
async def get_tasks(
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get tasks based on user role and filters"""
    try:
        query = supabase.table('tasks').select("""
            *,
            task_categories (name, slug, icon, color),
            customer_profile:profiles!customer_id (full_name, username, avatar_url, average_rating, total_reviews),
            tasker_profile:profiles!tasker_id (full_name, username, avatar_url, average_rating, total_reviews)
        """)
        
        # Filter by category if specified
        if category_id:
            query = query.eq('category_id', category_id)
            
        # Filter by status if specified
        if status:
            query = query.eq('status', status)
        
        # Apply role-based filtering
        user_role = current_user.get("role", "customer")
        if user_role == "customer":
            query = query.eq('customer_id', current_user["id"])
        elif user_role == "tasker":
            # Taskers see unassigned tasks or tasks assigned to them
            query = query.or_(f"tasker_id.is.null,tasker_id.eq.{current_user['id']}")
        
        result = query.order('created_at', {'ascending': False}).execute()
        
        if result.data:
            # Get application counts for each task
            task_ids = [task['id'] for task in result.data]
            if task_ids:
                app_result = supabase.table('task_applications').select('task_id').in_('task_id', task_ids).execute()
                app_counts = {}
                if app_result.data:
                    for app in app_result.data:
                        app_counts[app['task_id']] = app_counts.get(app['task_id'], 0) + 1
                
                # Add application counts
                for task in result.data:
                    task['applications_count'] = app_counts.get(task['id'], 0)
        
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/tasks")
async def create_task(task_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new task"""
    try:
        # Ensure user is a customer
        if current_user.get("role") != "customer":
            raise HTTPException(status_code=403, detail="Only customers can create tasks")
        
        task_data["customer_id"] = current_user["id"]
        task_data["status"] = "posted"
        
        result = supabase.table('tasks').insert(task_data).select().execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create task")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/tasks/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific task with detailed information"""
    try:
        result = supabase.table('tasks').select("""
            *,
            task_categories (name, slug, icon, color),
            customer_profile:profiles!customer_id (full_name, username, avatar_url, average_rating, total_reviews),
            tasker_profile:profiles!tasker_id (full_name, username, avatar_url, average_rating, total_reviews)
        """).eq('id', task_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task = result.data[0]
        
        # Get applications for this task
        app_result = supabase.table('task_applications').select("""
            *,
            tasker_profile:profiles!tasker_id (full_name, username, avatar_url, average_rating, total_reviews, hourly_rate, bio, skills)
        """).eq('task_id', task_id).execute()
        
        task['applications'] = app_result.data or []
        task['applications_count'] = len(task['applications'])
        
        return task
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update a task"""
    try:
        # Check if user owns the task or is assigned to it
        task_result = supabase.table('tasks').select('customer_id, tasker_id').eq('id', task_id).execute()
        
        if not task_result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task = task_result.data[0]
        user_id = current_user["id"]
        
        if task['customer_id'] != user_id and task.get('tasker_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table('tasks').update(update_data).eq('id', task_id).select().execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update task")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Task Applications
@api_router.get("/tasks/{task_id}/applications")
async def get_task_applications(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get applications for a specific task"""
    try:
        # Check if user owns the task
        task_result = supabase.table('tasks').select('customer_id').eq('id', task_id).execute()
        
        if not task_result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        if task_result.data[0]['customer_id'] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view applications")
        
        result = supabase.table('task_applications').select("""
            *,
            tasker_profile:profiles!tasker_id (full_name, username, avatar_url, average_rating, total_reviews, hourly_rate, bio, skills)
        """).eq('task_id', task_id).execute()
        
        return result.data or []
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/tasks/{task_id}/applications")
async def apply_to_task(task_id: str, application_data: dict, current_user: dict = Depends(get_current_user)):
    """Apply to a task"""
    try:
        # Ensure user is a tasker
        if current_user.get("role") != "tasker":
            raise HTTPException(status_code=403, detail="Only taskers can apply to tasks")
        
        # Check if task exists and is available
        task_result = supabase.table('tasks').select('status, customer_id').eq('id', task_id).execute()
        
        if not task_result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task = task_result.data[0]
        if task['status'] != 'posted':
            raise HTTPException(status_code=400, detail="Task is not available for applications")
            
        if task['customer_id'] == current_user["id"]:
            raise HTTPException(status_code=400, detail="Cannot apply to your own task")
        
        application_data["task_id"] = task_id
        application_data["tasker_id"] = current_user["id"]
        application_data["status"] = "pending"
        
        result = supabase.table('task_applications').insert(application_data).select().execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to create application")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/applications/{application_id}")
async def update_application(application_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update an application status (accept/reject)"""
    try:
        # Get application details
        app_result = supabase.table('task_applications').select("""
            *,
            task:tasks!task_id (customer_id, tasker_id)
        """).eq('id', application_id).execute()
        
        if not app_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
            
        application = app_result.data[0]
        user_id = current_user["id"]
        
        # Check permissions
        if application['task']['customer_id'] != user_id and application['tasker_id'] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this application")
        
        # If accepting an application, assign the tasker to the task
        if update_data.get('status') == 'accepted' and application['task']['customer_id'] == user_id:
            # Update task to assign tasker
            supabase.table('tasks').update({
                'tasker_id': application['tasker_id'],
                'status': 'assigned',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', application['task_id']).execute()
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table('task_applications').update(update_data).eq('id', application_id).select().execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update application")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Messaging
@api_router.get("/tasks/{task_id}/messages")
async def get_task_messages(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a specific task"""
    try:
        # Check if user has access to this task
        task_result = supabase.table('tasks').select('customer_id, tasker_id').eq('id', task_id).execute()
        
        if not task_result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task = task_result.data[0]
        user_id = current_user["id"]
        
        if task['customer_id'] != user_id and task.get('tasker_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view messages")
        
        result = supabase.table('messages').select("""
            *,
            sender_profile:profiles!sender_id (full_name, username, avatar_url)
        """).eq('task_id', task_id).order('created_at').execute()
        
        # Mark messages as read
        supabase.table('messages').update({
            'read_at': datetime.utcnow().isoformat()
        }).eq('task_id', task_id).eq('receiver_id', user_id).is_('read_at', 'null').execute()
        
        return result.data or []
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/tasks/{task_id}/messages")
async def send_message(task_id: str, message_data: dict, current_user: dict = Depends(get_current_user)):
    """Send a message for a specific task"""
    try:
        # Check if user has access to this task
        task_result = supabase.table('tasks').select('customer_id, tasker_id').eq('id', task_id).execute()
        
        if not task_result.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task = task_result.data[0]
        user_id = current_user["id"]
        
        if task['customer_id'] != user_id and task.get('tasker_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to send messages")
        
        # Determine receiver
        receiver_id = task['tasker_id'] if task['customer_id'] == user_id else task['customer_id']
        
        if not receiver_id:
            raise HTTPException(status_code=400, detail="Task must have both customer and tasker to send messages")
        
        message_data.update({
            "task_id": task_id,
            "sender_id": user_id,
            "receiver_id": receiver_id,
            "message_type": message_data.get("message_type", "text")
        })
        
        result = supabase.table('messages').insert(message_data).select("""
            *,
            sender_profile:profiles!sender_id (full_name, username, avatar_url)
        """).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to send message")
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# Profile Management
@api_router.get("/profile")
async def get_current_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        result = supabase.table('profiles').select('*').eq('id', current_user["id"]).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/profile")
async def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    try:
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table('profiles').update(profile_data).eq('id', current_user["id"]).select().execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to update profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Task Categories
@api_router.get("/categories")
async def get_categories():
    """Get all active task categories"""
    try:
        result = supabase.table('task_categories').select('*').eq('is_active', True).order('sort_order').execute()
        return result.data or []
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


