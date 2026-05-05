from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class PushTokenRequest(BaseModel):
    expo_push_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: str

    class Config:
        from_attributes = True
