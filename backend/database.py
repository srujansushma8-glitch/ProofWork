import sqlite3
import math
from contextlib import contextmanager
from typing import Generator
from backend.config import DB_PATH

def haversine(lat1, lon1, lat2, lon2) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    try:
        if None in (lat1, lon1, lat2, lon2):
            return 9999.0
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        r = 6371.0  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r * c, 2)
    except Exception:
        return 9999.0

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.create_function("haversine", 4, haversine)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'worker',
            created_at TEXT NOT NULL
        )
        """)

        # Worker Profiles table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS worker_profiles (
            user_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'en',
            trade TEXT NOT NULL DEFAULT 'Electrician',
            locality TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            experience_years INTEGER NOT NULL DEFAULT 1,
            bio TEXT,
            daily_rate INTEGER DEFAULT 900,
            available INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # Contractor Profiles table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contractor_profiles (
            user_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            phone TEXT NOT NULL,
            locality TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # Tasks table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title_en TEXT NOT NULL,
            title_kn TEXT NOT NULL,
            title_hi TEXT NOT NULL,
            description_en TEXT NOT NULL,
            description_kn TEXT NOT NULL,
            description_hi TEXT NOT NULL,
            guide_steps_json TEXT NOT NULL,
            spoken_phrases_json TEXT NOT NULL
        )
        """)

        # Videos table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            worker_id TEXT NOT NULL,
            task_id TEXT NOT NULL,
            file_path TEXT NOT NULL,
            duration_sec INTEGER DEFAULT 60,
            anti_fraud_phrase TEXT NOT NULL,
            consent_given_at TEXT NOT NULL,
            deleted_at TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks(id)
        )
        """)

        # Assessments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY,
            video_id TEXT NOT NULL,
            worker_id TEXT NOT NULL,
            task_id TEXT NOT NULL,
            checklist_json TEXT NOT NULL,
            score INTEGER NOT NULL,
            max_score INTEGER NOT NULL DEFAULT 6,
            confidence REAL NOT NULL DEFAULT 0.90,
            status TEXT NOT NULL DEFAULT 'pending_verification',
            ai_model TEXT NOT NULL DEFAULT 'gemini-mock',
            created_at TEXT NOT NULL,
            FOREIGN KEY (video_id) REFERENCES videos(id),
            FOREIGN KEY (worker_id) REFERENCES users(id),
            FOREIGN KEY (task_id) REFERENCES tasks(id)
        )
        """)

        # Verifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            assessment_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            verifier_name TEXT,
            verifier_phone TEXT,
            decision TEXT,
            note TEXT,
            verified_at TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
        )
        """)

        # Passports table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS passports (
            id TEXT PRIMARY KEY,
            worker_id TEXT NOT NULL,
            assessment_id TEXT NOT NULL,
            verification_id TEXT NOT NULL,
            verification_hash TEXT NOT NULL,
            qr_code_data TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            FOREIGN KEY (worker_id) REFERENCES users(id),
            FOREIGN KEY (assessment_id) REFERENCES assessments(id),
            FOREIGN KEY (verification_id) REFERENCES verifications(id)
        )
        """)

        # Jobs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            contractor_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            trade TEXT NOT NULL DEFAULT 'Electrician',
            locality TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            radius_km REAL DEFAULT 10.0,
            day_rate_min INTEGER DEFAULT 800,
            day_rate_max INTEGER DEFAULT 1200,
            duration_days INTEGER DEFAULT 1,
            status TEXT DEFAULT 'open',
            created_at TEXT NOT NULL,
            FOREIGN KEY (contractor_id) REFERENCES users(id)
        )
        """)

        # Job Responses table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_responses (
            id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL,
            worker_id TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (job_id, worker_id),
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)
        conn.commit()
