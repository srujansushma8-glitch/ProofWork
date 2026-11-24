from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SendOtpRequest(BaseModel):
    phone: str

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    role: str = "worker"  # "worker" or "contractor"

class WorkerProfileSchema(BaseModel):
    user_id: str
    name: str
    language: str = "en"
    trade: str = "Electrician"
    locality: str
    latitude: float
    longitude: float
    experience_years: int = 1
    bio: Optional[str] = ""
    daily_rate: int = 900
    available: int = 1

class ContractorProfileSchema(BaseModel):
    user_id: str
    company_name: str
    contact_person: str
    phone: str
    locality: str
    latitude: float
    longitude: float

class UserProfileResponse(BaseModel):
    id: str
    phone: str
    role: str
    created_at: str
    worker_profile: Optional[WorkerProfileSchema] = None
    contractor_profile: Optional[ContractorProfileSchema] = None

class WorkerProfileUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    locality: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    daily_rate: Optional[int] = None
    available: Optional[int] = None

class ContractorProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    locality: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TaskSchema(BaseModel):
    id: str
    slug: str
    title_en: str
    title_kn: str
    title_hi: str
    description_en: str
    description_kn: str
    description_hi: str
    guide_steps: List[Dict[str, str]]
    spoken_phrases: List[Dict[str, str]]

class VideoUploadResponse(BaseModel):
    video_id: str
    file_path: str
    duration_sec: int
    anti_fraud_phrase: str

class ChecklistItem(BaseModel):
    id: int
    title_en: str
    title_kn: str
    title_hi: str
    passed: bool
    observation: str
    confidence: float
    timestamp_sec: Optional[int] = None

class AssessmentRequest(BaseModel):
    video_id: str
    task_id: str
    spoken_phrase: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: str
    video_id: str
    worker_id: str
    task_id: str
    score: int
    max_score: int
    confidence: float
    status: str  # pending_verification, verified, rejected
    checklist: List[ChecklistItem]
    verification_token: Optional[str] = None
    share_url: Optional[str] = None
    passport_id: Optional[str] = None
    created_at: str

class VerificationDecisionRequest(BaseModel):
    verifier_name: str
    verifier_phone: str
    decision: str  # "confirmed" or "rejected"
    note: Optional[str] = ""

class PublicPassportResponse(BaseModel):
    id: str
    worker_id: str
    worker_name: str
    worker_phone: str
    worker_locality: str
    worker_experience: int
    trade: str
    task_title: str
    score: int
    max_score: int
    confidence: float
    checklist: List[ChecklistItem]
    verifier_name: str
    verifier_phone: str
    decision: str
    verified_at: str
    verification_hash: str
    qr_code_data: str
    status: str

class CreateJobRequest(BaseModel):
    title: str
    description: str
    trade: str = "Electrician"
    locality: str
    latitude: float
    longitude: float
    radius_km: float = 12.0
    day_rate_min: int = 800
    day_rate_max: int = 1200
    duration_days: int = 1

class JobResponse(BaseModel):
    id: str
    contractor_id: str
    title: str
    description: str
    trade: str
    locality: str
    latitude: float
    longitude: float
    radius_km: float
    day_rate_min: int
    day_rate_max: int
    duration_days: int
    status: str
    created_at: str
    distance_km: Optional[float] = None
    user_response_status: Optional[str] = None
    matched_workers_count: Optional[int] = 0

class JobActionRequest(BaseModel):
    status: str  # "applied", "accepted", "declined"

class WorkerMatchItem(BaseModel):
    worker_id: str
    name: str
    phone: str
    locality: str
    distance_km: float
    experience_years: int
    daily_rate: int
    verified: bool
    skill_score: int
    confidence: float
    passport_id: Optional[str] = None
    latest_task: Optional[str] = None
    available: int
