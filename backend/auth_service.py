"""
PromptLens Backend - Authentication Service
Handles user registration, login, JWT tokens, and Google OAuth
"""

import os
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import json

from pydantic import BaseModel, EmailStr, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
import httpx

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simple file-based user storage (in production, use a proper database)
USERS_FILE = os.path.join(os.path.dirname(__file__), "data", "users.json")


# ============================================================
# MODELS
# ============================================================

class UserCreate(BaseModel):
    """Request model for user registration"""
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2, max_length=100)


class UserLogin(BaseModel):
    """Request model for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response model for user data (no password)"""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    provider: str = "local"  # "local" or "google"
    created_at: str
    last_login: Optional[str] = None


class TokenResponse(BaseModel):
    """Response model for authentication token"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth"""
    credential: str  # Google ID token


# ============================================================
# USER STORAGE (File-based for simplicity)
# ============================================================

def _ensure_data_dir():
    """Ensure data directory exists"""
    data_dir = os.path.dirname(USERS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)


def _load_users() -> Dict[str, dict]:
    """Load users from file"""
    _ensure_data_dir()
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_users(users: Dict[str, dict]):
    """Save users to file"""
    _ensure_data_dir()
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def _get_user_by_email(email: str) -> Optional[dict]:
    """Find user by email"""
    users = _load_users()
    for user_id, user_data in users.items():
        if user_data.get("email", "").lower() == email.lower():
            return {**user_data, "id": user_id}
    return None


def _get_user_by_id(user_id: str) -> Optional[dict]:
    """Find user by ID"""
    users = _load_users()
    if user_id in users:
        return {**users[user_id], "id": user_id}
    return None


def _create_user(email: str, name: str, hashed_password: str, provider: str = "local", avatar_url: Optional[str] = None) -> dict:
    """Create a new user"""
    users = _load_users()
    user_id = str(uuid.uuid4())
    
    user_data = {
        "email": email.lower(),
        "name": name,
        "hashed_password": hashed_password,
        "provider": provider,
        "avatar_url": avatar_url,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    }
    
    users[user_id] = user_data
    _save_users(users)
    
    return {**user_data, "id": user_id}


def _update_last_login(user_id: str):
    """Update user's last login timestamp"""
    users = _load_users()
    if user_id in users:
        users[user_id]["last_login"] = datetime.utcnow().isoformat()
        _save_users(users)


# ============================================================
# PASSWORD UTILITIES
# ============================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================
# JWT UTILITIES
# ============================================================

def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def get_user_from_token(token: str) -> Optional[dict]:
    """Get user data from a valid token"""
    payload = verify_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    return _get_user_by_id(user_id)


# ============================================================
# AUTHENTICATION FUNCTIONS
# ============================================================

async def register_user(data: UserCreate) -> tuple[Optional[TokenResponse], Optional[str]]:
    """Register a new user"""
    # Check if email already exists
    existing_user = _get_user_by_email(data.email)
    if existing_user:
        return None, "Email already registered"
    
    # Hash password and create user
    hashed_password = hash_password(data.password)
    user = _create_user(
        email=data.email,
        name=data.name,
        hashed_password=hashed_password,
        provider="local"
    )
    
    # Update last login
    _update_last_login(user["id"])
    
    # Generate token
    access_token = create_access_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            avatar_url=user.get("avatar_url"),
            provider=user["provider"],
            created_at=user["created_at"],
            last_login=user.get("last_login"),
        )
    ), None


async def login_user(data: UserLogin) -> tuple[Optional[TokenResponse], Optional[str]]:
    """Login a user with email and password"""
    # Find user
    user = _get_user_by_email(data.email)
    if not user:
        return None, "Invalid email or password"
    
    # Check if user registered with Google
    if user.get("provider") == "google":
        return None, "This account uses Google Sign-In. Please login with Google."
    
    # Verify password
    if not verify_password(data.password, user.get("hashed_password", "")):
        return None, "Invalid email or password"
    
    # Update last login
    _update_last_login(user["id"])
    
    # Generate token
    access_token = create_access_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            avatar_url=user.get("avatar_url"),
            provider=user["provider"],
            created_at=user["created_at"],
            last_login=user.get("last_login"),
        )
    ), None


async def google_auth(credential: str) -> tuple[Optional[TokenResponse], Optional[str]]:
    """Authenticate or register user via Google OAuth"""
    try:
        # Verify Google ID token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            )
            
            if response.status_code != 200:
                return None, "Invalid Google token"
            
            google_data = response.json()
        
        # Extract user info from Google token
        email = google_data.get("email")
        name = google_data.get("name", email.split("@")[0])
        avatar_url = google_data.get("picture")
        
        if not email:
            return None, "Could not get email from Google"
        
        # Check if user exists
        user = _get_user_by_email(email)
        
        if user:
            # Update last login
            _update_last_login(user["id"])
            
            # Update avatar if changed
            if avatar_url and user.get("avatar_url") != avatar_url:
                users = _load_users()
                users[user["id"]]["avatar_url"] = avatar_url
                _save_users(users)
                user["avatar_url"] = avatar_url
        else:
            # Create new user from Google account
            user = _create_user(
                email=email,
                name=name,
                hashed_password="",  # No password for Google users
                provider="google",
                avatar_url=avatar_url,
            )
            _update_last_login(user["id"])
        
        # Generate token
        access_token = create_access_token(user["id"], user["email"])
        
        return TokenResponse(
            access_token=access_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                avatar_url=user.get("avatar_url"),
                provider=user.get("provider", "google"),
                created_at=user["created_at"],
                last_login=user.get("last_login"),
            )
        ), None
        
    except Exception as e:
        print(f"Google auth error: {e}")
        return None, f"Google authentication failed: {str(e)}"


async def get_current_user(token: str) -> tuple[Optional[UserResponse], Optional[str]]:
    """Get current user from token"""
    user = get_user_from_token(token)
    if not user:
        return None, "Invalid or expired token"
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        avatar_url=user.get("avatar_url"),
        provider=user.get("provider", "local"),
        created_at=user["created_at"],
        last_login=user.get("last_login"),
    ), None
