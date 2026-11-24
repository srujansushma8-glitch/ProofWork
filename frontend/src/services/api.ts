import {
  User,
  WorkerProfile,
  ContractorProfile,
  Task,
  Assessment,
  VerificationDetails,
  PublicPassport,
  Job,
  WorkerMatchItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; dev_otp: string }> {
    const res = await fetch(`${API_BASE}/auth/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
      throw new Error(err.detail || 'Failed to send OTP');
    }
    return res.json();
  },

  async verifyOtp(phone: string, otp: string, role: string = 'worker'): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid OTP' }));
      throw new Error(err.detail || 'Invalid OTP');
    }
    return res.json();
  },

  async getMe(userId: string): Promise<User> {
    const res = await fetch(`${API_BASE}/me?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async updateWorkerProfile(userId: string, profile: Partial<WorkerProfile>): Promise<WorkerProfile> {
    const res = await fetch(`${API_BASE}/me/worker?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update worker profile');
    return res.json();
  },

  async updateContractorProfile(userId: string, profile: Partial<ContractorProfile>): Promise<ContractorProfile> {
    const res = await fetch(`${API_BASE}/me/contractor?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update contractor profile');
    return res.json();
  },

  // Tasks & Video
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async uploadVideo(
    workerId: string,
    taskId: string,
    antiFraudPhrase: string,
    durationSec: number,
    consent: boolean,
    videoBlob: Blob,
    onProgress?: (percent: number) => void
  ): Promise<{ video_id: string; file_path: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/videos`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Invalid upload response'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.detail || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      const formData = new FormData();
      formData.append('worker_id', workerId);
      formData.append('task_id', taskId);
      formData.append('anti_fraud_phrase', antiFraudPhrase);
      formData.append('duration_sec', durationSec.toString());
      formData.append('consent', consent ? 'true' : 'false');
      formData.append('video', videoBlob, 'task_record.webm');

      xhr.send(formData);
    });
  },

  async deleteVideo(videoId: string, workerId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/videos/${videoId}?worker_id=${encodeURIComponent(workerId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  },

  // Assessments & Verification
  async startAssessment(videoId: string, taskId: string, spokenPhrase?: string): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, task_id: taskId, spoken_phrase: spokenPhrase }),
    });
    if (!res.ok) throw new Error('Assessment failed');
    return res.json();
  },

  async getAssessment(assessmentId: string): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}`);
    if (!res.ok) throw new Error('Failed to fetch assessment');
    return res.json();
  },

  async getVerificationByToken(token: string): Promise<VerificationDetails> {
    const res = await fetch(`${API_BASE}/verifications/token/${token}`);
    if (!res.ok) throw new Error('Verification request not found');
    return res.json();
  },

  async submitVerificationDecision(
    token: string,
    verifierName: string,
    verifierPhone: string,
    decision: 'confirmed' | 'rejected',
    note?: string
  ): Promise<{ success: boolean; decision: string; status: string; passport_id?: string }> {
    const res = await fetch(`${API_BASE}/verifications/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verifier_name: verifierName,
        verifier_phone: verifierPhone,
        decision,
        note
      }),
    });
    if (!res.ok) throw new Error('Failed to submit decision');
    return res.json();
  },

  // Passports
  async getPublicPassport(passportId: string): Promise<PublicPassport> {
    const res = await fetch(`${API_BASE}/passports/${passportId}`);
    if (!res.ok) throw new Error('Passport not found');
    return res.json();
  },

  async getWorkerPassport(workerId: string): Promise<{ has_passport: boolean; passport_id?: string }> {
    const res = await fetch(`${API_BASE}/passports/worker/${workerId}`);
    if (!res.ok) return { has_passport: false };
    return res.json();
  },

  // Jobs
  async createJob(contractorId: string, jobData: any): Promise<Job> {
    const res = await fetch(`${API_BASE}/jobs?contractor_id=${encodeURIComponent(contractorId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async listJobs(contractorId?: string): Promise<Job[]> {
    const url = contractorId ? `${API_BASE}/jobs?contractor_id=${encodeURIComponent(contractorId)}` : `${API_BASE}/jobs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async getNearbyJobs(workerId?: string): Promise<Job[]> {
    const url = workerId ? `${API_BASE}/jobs/nearby?worker_id=${encodeURIComponent(workerId)}` : `${API_BASE}/jobs/nearby`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch nearby jobs');
    return res.json();
  },

  async getJobWorkerMatches(jobId: string): Promise<WorkerMatchItem[]> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async respondToJob(jobId: string, workerId: string, status: 'applied' | 'accepted' | 'declined'): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/respond?worker_id=${encodeURIComponent(workerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update job response');
    return res.json();
  },

  async getLocalities(): Promise<{ locality: string; lat: number; lon: number }[]> {
    const res = await fetch(`${API_BASE}/localities`);
    if (!res.ok) return [];
    return res.json();
  }
};
