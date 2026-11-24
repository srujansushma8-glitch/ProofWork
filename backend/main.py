import os
import json
import uuid
import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import UPLOAD_DIR, CORS_ORIGINS
from backend.database import get_db, init_db, haversine
from backend.scorer import score_video, generate_verification_hash, generate_qr_code_base64
from backend.seed import seed_database, LOCALITIES
from backend import schemas

app = FastAPI(
    title="ProofWork API",
    description="Skill passport & job matching platform for electricians in Bengaluru",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and seed database on startup
@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# Static files for video preview if present
app.mount("/media", StaticFiles(directory=str(UPLOAD_DIR)), name="media")


# ==========================================
# AUTH & PROFILE ENDPOINTS
# ==========================================

@app.post("/api/auth/otp")
def send_otp(req: schemas.SendOtpRequest):
    """
    Sends OTP to phone. In demo/development, standard mock OTP is 123456.
    """
    phone = req.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    return {
        "success": True,
        "message": "OTP sent successfully to " + phone,
        "dev_otp": "123456"
    }

@app.post("/api/auth/verify")
def verify_otp(req: schemas.VerifyOtpRequest):
    """
    Verifies OTP and returns user profile. Mock OTP '123456' always passes in dev.
    """
    phone = req.phone.strip()
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Please enter 123456.")

    now = datetime.datetime.utcnow().isoformat() + "Z"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
        user = cursor.fetchone()

        if not user:
            user_id = "user-" + str(uuid.uuid4())[:8]
            cursor.execute("INSERT INTO users (id, phone, role, created_at) VALUES (?, ?, ?, ?)",
                           (user_id, phone, req.role, now))
            
            # Default locality Jayanagar
            def_loc = "Jayanagar"
            lat = LOCALITIES[def_loc]["lat"]
            lon = LOCALITIES[def_loc]["lon"]

            if req.role == "worker":
                cursor.execute("""
                INSERT INTO worker_profiles (user_id, name, language, trade, locality, latitude, longitude, experience_years, bio, daily_rate, available)
                VALUES (?, ?, 'en', 'Electrician', ?, ?, ?, 2, 'Certified domestic wireman', 900, 1)
                """, (user_id, "New Electrician", def_loc, lat, lon))
            else:
                cursor.execute("""
                INSERT INTO contractor_profiles (user_id, company_name, contact_person, phone, locality, latitude, longitude)
                VALUES (?, 'Bengaluru Infra Projects', 'Project Manager', ?, ?, ?, ?)
                """, (user_id, phone, def_loc, lat, lon))
            conn.commit()

            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()

        user_dict = dict(user)

        # Fetch worker or contractor profile
        worker_profile = None
        contractor_profile = None

        if user_dict["role"] == "worker":
            cursor.execute("SELECT * FROM worker_profiles WHERE user_id = ?", (user_dict["id"],))
            w = cursor.fetchone()
            if w:
                worker_profile = dict(w)
        else:
            cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_dict["id"],))
            c = cursor.fetchone()
            if c:
                contractor_profile = dict(c)

        return {
            "token": f"bearer_{user_dict['id']}",
            "user": {
                "id": user_dict["id"],
                "phone": user_dict["phone"],
                "role": user_dict["role"],
                "created_at": user_dict["created_at"],
                "worker_profile": worker_profile,
                "contractor_profile": contractor_profile
            }
        }

@app.get("/api/me")
def get_current_user(user_id: str = Query(...)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_dict = dict(user)
        worker_profile = None
        contractor_profile = None

        cursor.execute("SELECT * FROM worker_profiles WHERE user_id = ?", (user_id,))
        w = cursor.fetchone()
        if w:
            worker_profile = dict(w)

        cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_id,))
        c = cursor.fetchone()
        if c:
            contractor_profile = dict(c)

        return {
            "id": user_dict["id"],
            "phone": user_dict["phone"],
            "role": user_dict["role"],
            "created_at": user_dict["created_at"],
            "worker_profile": worker_profile,
            "contractor_profile": contractor_profile
        }

@app.put("/api/me/worker")
def update_worker_profile(user_id: str, profile: schemas.WorkerProfileUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM worker_profiles WHERE user_id = ?", (user_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Worker profile not found")

        updates = []
        params = []
        for field, value in profile.model_dump(exclude_unset=True).items():
            if value is not None:
                updates.append(f"{field} = ?")
                params.append(value)

        # Update lat/lon automatically if locality is given without coordinates
        if profile.locality and profile.locality in LOCALITIES and (profile.latitude is None or profile.longitude is None):
            updates.append("latitude = ?")
            params.append(LOCALITIES[profile.locality]["lat"])
            updates.append("longitude = ?")
            params.append(LOCALITIES[profile.locality]["lon"])

        if updates:
            params.append(user_id)
            query = f"UPDATE worker_profiles SET {', '.join(updates)} WHERE user_id = ?"
            cursor.execute(query, params)
            conn.commit()

        cursor.execute("SELECT * FROM worker_profiles WHERE user_id = ?", (user_id,))
        return dict(cursor.fetchone())

@app.put("/api/me/contractor")
def update_contractor_profile(user_id: str, profile: schemas.ContractorProfileUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Contractor profile not found")

        updates = []
        params = []
        for field, value in profile.model_dump(exclude_unset=True).items():
            if value is not None:
                updates.append(f"{field} = ?")
                params.append(value)

        if profile.locality and profile.locality in LOCALITIES and (profile.latitude is None or profile.longitude is None):
            updates.append("latitude = ?")
            params.append(LOCALITIES[profile.locality]["lat"])
            updates.append("longitude = ?")
            params.append(LOCALITIES[profile.locality]["lon"])

        if updates:
            params.append(user_id)
            query = f"UPDATE contractor_profiles SET {', '.join(updates)} WHERE user_id = ?"
            cursor.execute(query, params)
            conn.commit()

        cursor.execute("SELECT * FROM contractor_profiles WHERE user_id = ?", (user_id,))
        return dict(cursor.fetchone())

@app.get("/api/localities")
def get_localities():
    """Returns Bengaluru localities with geocoded coordinates."""
    return [{"locality": k, "lat": v["lat"], "lon": v["lon"]} for k, v in LOCALITIES.items()]


# ==========================================
# TASKS & VIDEO UPLOAD
# ==========================================

@app.get("/api/tasks")
def list_tasks():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "slug": r["slug"],
                "title_en": r["title_en"],
                "title_kn": r["title_kn"],
                "title_hi": r["title_hi"],
                "description_en": r["description_en"],
                "description_kn": r["description_kn"],
                "description_hi": r["description_hi"],
                "guide_steps": json.loads(r["guide_steps_json"]),
                "spoken_phrases": json.loads(r["spoken_phrases_json"])
            })
        return result

@app.post("/api/videos", response_model=schemas.VideoUploadResponse)
async def upload_video(
    worker_id: str = Form(...),
    task_id: str = Form(...),
    anti_fraud_phrase: str = Form(...),
    duration_sec: int = Form(60),
    consent: bool = Form(...),
    video: UploadFile = File(...)
):
    if not consent:
        raise HTTPException(status_code=400, detail="Explicit consent is required to process video.")

    video_id = f"vid-{uuid.uuid4().hex[:10]}"
    file_extension = Path(video.filename).suffix or ".webm"
    saved_filename = f"{video_id}{file_extension}"
    file_path = UPLOAD_DIR / saved_filename

    # Save uploaded file
    contents = await video.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    now = datetime.datetime.utcnow().isoformat() + "Z"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO videos (id, worker_id, task_id, file_path, duration_sec, anti_fraud_phrase, consent_given_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            video_id,
            worker_id,
            task_id,
            f"/media/{saved_filename}",
            duration_sec,
            anti_fraud_phrase,
            now,
            now
        ))
        conn.commit()

    return schemas.VideoUploadResponse(
        video_id=video_id,
        file_path=f"/media/{saved_filename}",
        duration_sec=duration_sec,
        anti_fraud_phrase=anti_fraud_phrase
    )

@app.delete("/api/videos/{video_id}")
def delete_video(video_id: str, worker_id: str = Query(...)):
    """
    Explicit user privacy control: removes the video file from storage and marks as deleted.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE id = ? AND worker_id = ?", (video_id, worker_id))
        video = cursor.fetchone()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found or access denied")

        # Delete physical file if exists
        try:
            rel_path = video["file_path"].replace("/media/", "")
            full_path = UPLOAD_DIR / rel_path
            if full_path.exists():
                full_path.unlink()
        except Exception:
            pass

        now = datetime.datetime.utcnow().isoformat() + "Z"
        cursor.execute("UPDATE videos SET deleted_at = ?, file_path = '' WHERE id = ?", (now, video_id))
        conn.commit()

    return {"success": True, "message": "Video successfully purged in compliance with privacy consent."}


# ==========================================
# AI SCORING & ASSESSMENTS
# ==========================================

@app.post("/api/assessments")
async def start_assessment(req: schemas.AssessmentRequest):
    """
    Evaluates recorded video against the 6-point electrician checklist.
    Generates verification token and link for peer/contractor verification.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE id = ?", (req.video_id,))
        video = cursor.fetchone()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")

        cursor.execute("SELECT * FROM tasks WHERE id = ?", (req.task_id,))
        task = cursor.fetchone()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Run AI scoring engine
        checklist, score, conf, model_name = await score_video(
            video_id=video["id"],
            video_path=video["file_path"],
            task_slug=task["slug"],
            anti_fraud_phrase=video["anti_fraud_phrase"]
        )

        assessment_id = f"asmt-{uuid.uuid4().hex[:10]}"
        verif_id = f"verif-{uuid.uuid4().hex[:10]}"
        verif_token = f"pwv_{uuid.uuid4().hex[:12]}"
        now = datetime.datetime.utcnow().isoformat() + "Z"

        # Create assessment in 'pending_verification' status
        cursor.execute("""
        INSERT INTO assessments (id, video_id, worker_id, task_id, checklist_json, score, max_score, confidence, status, ai_model, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 6, ?, 'pending_verification', ?, ?)
        """, (
            assessment_id,
            video["id"],
            video["worker_id"],
            task["id"],
            json.dumps(checklist),
            score,
            conf,
            model_name,
            now
        ))

        # Create verification token record
        cursor.execute("""
        INSERT INTO verifications (id, assessment_id, token, decision, created_at)
        VALUES (?, ?, ?, 'pending', ?)
        """, (
            verif_id,
            assessment_id,
            verif_token,
            now
        ))
        conn.commit()

        share_url = f"/verify/{verif_token}"

        return {
            "id": assessment_id,
            "video_id": video["id"],
            "worker_id": video["worker_id"],
            "task_id": task["id"],
            "score": score,
            "max_score": 6,
            "confidence": conf,
            "status": "pending_verification",
            "checklist": checklist,
            "verification_token": verif_token,
            "share_url": share_url,
            "passport_id": None,
            "created_at": now
        }

@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
        asmt = cursor.fetchone()
        if not asmt:
            raise HTTPException(status_code=404, detail="Assessment not found")

        cursor.execute("SELECT token FROM verifications WHERE assessment_id = ?", (assessment_id,))
        v = cursor.fetchone()
        token = v["token"] if v else None

        cursor.execute("SELECT id FROM passports WHERE assessment_id = ?", (assessment_id,))
        p = cursor.fetchone()
        passport_id = p["id"] if p else None

        return {
            "id": asmt["id"],
            "video_id": asmt["video_id"],
            "worker_id": asmt["worker_id"],
            "task_id": asmt["task_id"],
            "score": asmt["score"],
            "max_score": asmt["max_score"],
            "confidence": asmt["confidence"],
            "status": asmt["status"],
            "checklist": json.loads(asmt["checklist_json"]),
            "verification_token": token,
            "share_url": f"/verify/{token}" if token else None,
            "passport_id": passport_id,
            "created_at": asmt["created_at"]
        }


# ==========================================
# VERIFICATION & PEER REVIEW (NO LOGIN REQUIRED)
# ==========================================

@app.get("/api/verifications/token/{token}")
def get_verification_by_token(token: str):
    """
    Public token endpoint: allows a senior peer electrician or licensed contractor
    to review the clip and AI safety observations without logging in.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT v.*, a.score, a.max_score, a.confidence, a.status as assessment_status,
               a.checklist_json, a.video_id, a.task_id, a.worker_id,
               w.name as worker_name, w.locality as worker_locality, w.experience_years,
               vid.file_path as video_file_path, vid.anti_fraud_phrase,
               t.title_en as task_title_en, t.title_kn as task_title_kn, t.title_hi as task_title_hi
        FROM verifications v
        JOIN assessments a ON v.assessment_id = a.id
        JOIN worker_profiles w ON a.worker_id = w.user_id
        JOIN videos vid ON a.video_id = vid.id
        JOIN tasks t ON a.task_id = t.id
        WHERE v.token = ?
        """, (token,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Verification request not found or expired")

        # Check if already has passport
        cursor.execute("SELECT id FROM passports WHERE assessment_id = ?", (row["assessment_id"],))
        p = cursor.fetchone()

        return {
            "verification_id": row["id"],
            "assessment_id": row["assessment_id"],
            "token": row["token"],
            "decision": row["decision"],
            "note": row["note"],
            "verified_at": row["verified_at"],
            "status": row["assessment_status"],
            "score": row["score"],
            "max_score": row["max_score"],
            "confidence": row["confidence"],
            "checklist": json.loads(row["checklist_json"]),
            "worker_id": row["worker_id"],
            "worker_name": row["worker_name"],
            "worker_locality": row["worker_locality"],
            "worker_experience": row["experience_years"],
            "video_url": row["video_file_path"],
            "anti_fraud_phrase": row["anti_fraud_phrase"],
            "task_title": row["task_title_en"],
            "task_title_kn": row["task_title_kn"],
            "task_title_hi": row["task_title_hi"],
            "passport_id": p["id"] if p else None
        }

@app.post("/api/verifications/{token}")
def submit_verification_decision(token: str, req: schemas.VerificationDecisionRequest):
    """
    Verifier clicks Confirm or Reject.
    Upon confirmation, the official Skill Passport with SHA-256 hash and QR code is issued!
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM verifications WHERE token = ?", (token,))
        verif = cursor.fetchone()
        if not verif:
            raise HTTPException(status_code=404, detail="Verification link not found")

        cursor.execute("SELECT * FROM assessments WHERE id = ?", (verif["assessment_id"],))
        asmt = cursor.fetchone()
        if not asmt:
            raise HTTPException(status_code=404, detail="Assessment not found")

        now = datetime.datetime.utcnow().isoformat() + "Z"
        decision = "confirmed" if req.decision.lower() == "confirmed" else "rejected"
        status = "verified" if decision == "confirmed" else "rejected"

        cursor.execute("""
        UPDATE verifications
        SET verifier_name = ?, verifier_phone = ?, decision = ?, note = ?, verified_at = ?
        WHERE token = ?
        """, (
            req.verifier_name.strip() or "Senior Electrician / Contractor",
            req.verifier_phone.strip() or "+919800000000",
            decision,
            req.note or "Verified compliance with Indian standard electrical safety rules.",
            now,
            token
        ))

        cursor.execute("UPDATE assessments SET status = ? WHERE id = ?", (status, asmt["id"]))

        passport_id = None
        if decision == "confirmed":
            passport_id = f"PW-BLR-{datetime.datetime.now().strftime('%y%m')}-{uuid.uuid4().hex[:6].upper()}"
            v_hash = generate_verification_hash(
                worker_id=asmt["worker_id"],
                assessment_id=asmt["id"],
                score=asmt["score"],
                verifier_token=token,
                timestamp=now
            )
            # Local URL or frontend URL for QR code
            passport_url = f"http://localhost:5173/p/{passport_id}"
            qr_code = generate_qr_code_base64(passport_url)

            cursor.execute("""
            INSERT INTO passports (id, worker_id, assessment_id, verification_id, verification_hash, qr_code_data, issued_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                passport_id,
                asmt["worker_id"],
                asmt["id"],
                verif["id"],
                v_hash,
                qr_code,
                now
            ))

        conn.commit()

        return {
            "success": True,
            "decision": decision,
            "status": status,
            "passport_id": passport_id,
            "verified_at": now
        }


# ==========================================
# PUBLIC SKILL PASSPORT (/p/:passportId)
# ==========================================

@app.get("/api/passports/{passport_id}")
def get_public_passport(passport_id: str):
    """
    Public skill passport document. Shows verified electrical competencies,
    peer/contractor verifier endorsement, and tamper-evident cryptographic hash.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT p.*, a.score, a.max_score, a.confidence, a.checklist_json,
               w.name as worker_name, u.phone as worker_phone, w.locality as worker_locality,
               w.experience_years as worker_experience, w.trade,
               t.title_en as task_title,
               v.verifier_name, v.verifier_phone, v.decision, v.verified_at, v.note as verifier_note
        FROM passports p
        JOIN assessments a ON p.assessment_id = a.id
        JOIN worker_profiles w ON p.worker_id = w.user_id
        JOIN users u ON w.user_id = u.id
        JOIN tasks t ON a.task_id = t.id
        JOIN verifications v ON p.verification_id = v.id
        WHERE p.id = ?
        """, (passport_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Skill passport not found")

        checklist = json.loads(row["checklist_json"])

        return {
            "id": row["id"],
            "worker_id": row["worker_id"],
            "worker_name": row["worker_name"],
            "worker_phone": row["worker_phone"],
            "worker_locality": row["worker_locality"],
            "worker_experience": row["worker_experience"],
            "trade": row["trade"],
            "task_title": row["task_title"],
            "score": row["score"],
            "max_score": row["max_score"],
            "confidence": row["confidence"],
            "checklist": checklist,
            "verifier_name": row["verifier_name"],
            "verifier_phone": row["verifier_phone"],
            "verifier_note": row["verifier_note"],
            "decision": row["decision"],
            "verified_at": row["verified_at"],
            "verification_hash": row["verification_hash"],
            "qr_code_data": row["qr_code_data"],
            "status": "Verified"
        }

@app.get("/api/passports/worker/{worker_id}")
def get_worker_passport(worker_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT p.id
        FROM passports p
        WHERE p.worker_id = ?
        ORDER BY p.issued_at DESC
        LIMIT 1
        """, (worker_id,))
        row = cursor.fetchone()
        if not row:
            return {"has_passport": False, "passport_id": None}
        return {"has_passport": True, "passport_id": row["id"]}


# ==========================================
# CONTRACTOR JOBS & WORKER MATCHING
# ==========================================

@app.post("/api/jobs", response_model=schemas.JobResponse)
def create_job(req: schemas.CreateJobRequest, contractor_id: str = Query(...)):
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO jobs (id, contractor_id, title, description, trade, locality, latitude, longitude, radius_km, day_rate_min, day_rate_max, duration_days, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        """, (
            job_id,
            contractor_id,
            req.title,
            req.description,
            req.trade,
            req.locality,
            req.latitude,
            req.longitude,
            req.radius_km,
            req.day_rate_min,
            req.day_rate_max,
            req.duration_days,
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        return dict(row)

@app.get("/api/jobs")
def list_jobs(contractor_id: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if contractor_id:
            cursor.execute("SELECT * FROM jobs WHERE contractor_id = ? ORDER BY created_at DESC", (contractor_id,))
        else:
            cursor.execute("SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            # count responses
            cursor.execute("SELECT count(*) as count FROM job_responses WHERE job_id = ?", (r["id"],))
            cnt = cursor.fetchone()["count"]
            d = dict(r)
            d["matched_workers_count"] = cnt
            result.append(d)
        return result

@app.get("/api/jobs/nearby")
def get_nearby_jobs(worker_id: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None):
    """
    Returns open electrician jobs sorted by Haversine distance from worker's locality.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # If worker_id provided, look up their coordinates
        if worker_id and (lat is None or lon is None):
            cursor.execute("SELECT latitude, longitude FROM worker_profiles WHERE user_id = ?", (worker_id,))
            w = cursor.fetchone()
            if w:
                lat = w["latitude"]
                lon = w["longitude"]

        if lat is None or lon is None:
            # Default to Jayanagar coordinates
            lat = LOCALITIES["Jayanagar"]["lat"]
            lon = LOCALITIES["Jayanagar"]["lon"]

        cursor.execute("""
        SELECT j.*,
               haversine(?, ?, j.latitude, j.longitude) as distance_km,
               jr.status as user_response_status
        FROM jobs j
        LEFT JOIN job_responses jr ON j.id = jr.job_id AND jr.worker_id = ?
        WHERE j.status = 'open'
        ORDER BY distance_km ASC
        """, (lat, lon, worker_id or ""))

        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@app.get("/api/jobs/{job_id}/matches")
def get_job_worker_matches(job_id: str):
    """
    Contractor view: ranks verified electricians by proximity (Haversine),
    AI skill score (0-6), and years of field experience.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        job = cursor.fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        job_lat = job["latitude"]
        job_lon = job["longitude"]
        radius = job["radius_km"] or 15.0

        cursor.execute("""
        SELECT w.user_id as worker_id, w.name, u.phone, w.locality, w.experience_years,
               w.daily_rate, w.available,
               haversine(?, ?, w.latitude, w.longitude) as distance_km,
               p.id as passport_id,
               a.score as skill_score,
               a.confidence,
               t.title_en as latest_task,
               CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END as verified
        FROM worker_profiles w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN passports p ON w.user_id = p.worker_id
        LEFT JOIN assessments a ON p.assessment_id = a.id
        LEFT JOIN tasks t ON a.task_id = t.id
        WHERE haversine(?, ?, w.latitude, w.longitude) <= ?
        ORDER BY verified DESC, skill_score DESC, distance_km ASC, w.experience_years DESC
        """, (job_lat, job_lon, job_lat, job_lon, radius))

        rows = cursor.fetchall()
        matches = []
        for r in rows:
            matches.append({
                "worker_id": r["worker_id"],
                "name": r["name"],
                "phone": r["phone"],
                "locality": r["locality"],
                "distance_km": r["distance_km"],
                "experience_years": r["experience_years"],
                "daily_rate": r["daily_rate"],
                "verified": bool(r["verified"]),
                "skill_score": r["skill_score"] if r["skill_score"] is not None else 0,
                "confidence": r["confidence"] if r["confidence"] is not None else 0.0,
                "passport_id": r["passport_id"],
                "latest_task": r["latest_task"],
                "available": r["available"]
            })
        return matches

@app.post("/api/jobs/{job_id}/respond")
def respond_to_job(job_id: str, worker_id: str, req: schemas.JobActionRequest):
    """
    Worker accepts, declines, or applies for a job.
    """
    now = datetime.datetime.utcnow().isoformat() + "Z"
    with get_db() as conn:
        cursor = conn.cursor()
        resp_id = f"resp-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO job_responses (id, job_id, worker_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_id, worker_id) DO UPDATE SET
            status = excluded.status,
            updated_at = excluded.updated_at
        """, (resp_id, job_id, worker_id, req.status, now, now))
        conn.commit()

    return {"success": True, "job_id": job_id, "worker_id": worker_id, "status": req.status}
