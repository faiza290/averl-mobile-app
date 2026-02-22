from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import hashlib
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional
from bson import ObjectId
import jwt

load_dotenv()

app = FastAPI(title="Rescue AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client.rescue_ai

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

class UserRole(str, Enum):
    regular = "regular"
    ambulance = "ambulance"
    admin = "admin"

class UserCreate(BaseModel):
    full_name: str = Field(min_length=2)
    username: str = Field(min_length=3)
    phone: str
    password: str = Field(min_length=8)
    role: UserRole
    address: str | None = None

# We will return the same shape as login
class LoginResponse(BaseModel):
    message: str
    token: str
    user: dict

@app.post("/api/signup", response_model=LoginResponse)
async def signup(user: UserCreate):
    users_collection = db.users
    
    existing = await users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username taken")
    
    salt = user.username.encode('utf-8')
    password_bytes = user.password.encode('utf-8')
    hashed_password = hashlib.sha256(salt + password_bytes).hexdigest()
    
    user_dict = {
        "full_name": user.full_name,
        "username": user.username,
        "phone": user.phone,
        "password": hashed_password,
        "role": user.role.value,
        "address": user.address,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    
    # Generate JWT token (same as login)
    token_data = {
        "sub": user.username,
        "role": user.role.value,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "message": "Account created and logged in successfully",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "full_name": user.full_name,
            "username": user.username,
            "phone": user.phone,
            "role": user.role.value,
            "address": user.address,
            "created_at": user_dict["created_at"].isoformat()
        }
    }


class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login", response_model=LoginResponse)
async def login(login: LoginRequest):
    users_collection = db.users
    
    user = await users_collection.find_one({"username": login.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    salt = login.username.encode('utf-8')
    password_bytes = login.password.encode('utf-8')
    hashed_password = hashlib.sha256(salt + password_bytes).hexdigest()
    
    if hashed_password != user["password"]:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    token_data = {
        "sub": user["username"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "username": user["username"],
            "phone": user["phone"],
            "role": user["role"],
            "address": user.get("address"),
        }
    }

class CallRecord(BaseModel):
    user_id: str
    timestamp: datetime
    duration: str  # Format: "MM:SS"

class CallRecordCreate(BaseModel):
    duration: str

class CallHistoryResponse(BaseModel):
    calls: List[dict]

# Add authentication dependency
from fastapi import Depends, Header
import jwt
from jwt import PyJWTError

async def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return username
    except (PyJWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Add these new endpoints after your existing ones
@app.post("/api/call-records")
async def save_call_record(
    record: CallRecordCreate,
    username: str = Depends(get_current_user)
):
    """Save a call record when user ends a call"""
    calls_collection = db.calls
    
    # Get user info
    users_collection = db.users
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    call_record = {
        "user_id": str(user["_id"]),
        "username": username,
        "timestamp": datetime.utcnow(),
        "duration": record.duration
    }
    
    result = await calls_collection.insert_one(call_record)
    
    return {
        "message": "Call record saved",
        "id": str(result.inserted_id)
    }

@app.get("/api/call-history", response_model=CallHistoryResponse)
async def get_call_history(
    username: str = Depends(get_current_user)
):
    """Get call history for the current user"""
    calls_collection = db.calls
    
    # Get user info
    users_collection = db.users
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find all calls for this user
    cursor = calls_collection.find({"user_id": str(user["_id"])})
    calls = await cursor.sort("timestamp", -1).to_list(length=None)  # Sort by newest first
    
    # Format the response
    formatted_calls = []
    for call in calls:
        formatted_calls.append({
            "id": str(call["_id"]),
            "timestamp": call["timestamp"].isoformat(),
            "duration": call["duration"]
        })
    
    return {"calls": formatted_calls}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)