import { PlaneIssue, PlaneMember, PlaneModule, PlaneCycle } from '../data/planeData';
import type { StagedQuestion } from '../data/sampleStagedQuestions';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

let authToken: string | null = null;

export type StagedQuestionIngestionResult =
  | {
      status: 'created';
      question: StagedQuestion;
      processing: {
        mode: 'ai' | 'local';
        duplicateChecked: boolean;
        assetsGenerated: boolean;
        warnings: string[];
      };
    }
  | {
      status: 'duplicate';
      duplicate: { id: string; title: string; similarity: number };
      message: string;
    }
  | { status: 'error'; message: string };

function requestHeaders(initial?: HeadersInit): Headers {
  const headers = new Headers(initial || {});
  headers.set('Content-Type', 'application/json');

  if ((import.meta as any).env?.VITE_API_KEY) {
    headers.set('x-api-key', (import.meta as any).env.VITE_API_KEY);
  }
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  return headers;
}

// Generic fetcher with graceful offline fallback
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: requestHeaders(options?.headers)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.data ?? data;
  } catch (error) {
    console.warn(`[API Warning] Request to ${url} failed, using local mode:`, error);
    return null;
  }
}

export const api = {
  setAuthToken(token: string | null) {
    authToken = token;
  },

  // Healthcheck
  async checkHealth() {
    return fetchJson<{ status: string; stats: any }>(`${API_BASE_URL}/health`);
  },

  // Issues
  async getIssues() {
    return fetchJson<PlaneIssue[]>(`${API_BASE_URL}/issues`);
  },

  async createIssue(issue: Partial<PlaneIssue>) {
    return fetchJson<PlaneIssue>(`${API_BASE_URL}/issues`, {
      method: 'POST',
      body: JSON.stringify(issue)
    });
  },

  async updateIssue(id: string, updates: Partial<PlaneIssue>) {
    return fetchJson<PlaneIssue>(`${API_BASE_URL}/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteIssue(id: string) {
    return fetchJson<{ success: boolean }>(`${API_BASE_URL}/issues/${id}`, {
      method: 'DELETE'
    });
  },

  // Members
  async getMembers() {
    return fetchJson<PlaneMember[]>(`${API_BASE_URL}/members`);
  },

  async createMember(member: Partial<PlaneMember>) {
    return fetchJson<PlaneMember>(`${API_BASE_URL}/members`, {
      method: 'POST',
      body: JSON.stringify(member)
    });
  },

  async deleteMember(id: string) {
    return fetchJson<{ success: boolean }>(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE'
    });
  },

  // Modules
  async getModules() {
    return fetchJson<PlaneModule[]>(`${API_BASE_URL}/modules`);
  },

  async createModule(mod: Partial<PlaneModule>) {
    return fetchJson<PlaneModule>(`${API_BASE_URL}/modules`, {
      method: 'POST',
      body: JSON.stringify(mod)
    });
  },

  async deleteModule(id: string) {
    return fetchJson<{ success: boolean }>(`${API_BASE_URL}/modules/${id}`, {
      method: 'DELETE'
    });
  },

  // Cycles
  async getCycles() {
    return fetchJson<PlaneCycle[]>(`${API_BASE_URL}/cycles`);
  },

  async createCycle(cycle: Partial<PlaneCycle>) {
    return fetchJson<PlaneCycle>(`${API_BASE_URL}/cycles`, {
      method: 'POST',
      body: JSON.stringify(cycle)
    });
  },

  async deleteCycle(id: string) {
    return fetchJson<{ success: boolean }>(`${API_BASE_URL}/cycles/${id}`, {
      method: 'DELETE'
    });
  },

  // Staging (faculty review queue, fed by the nightly scraper)
  async getStagedQuestions(status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED') {
    const qs = status ? `?status=${status}&limit=100` : '?limit=100';
    return fetchJson<StagedQuestion[]>(`${API_BASE_URL}/staging/questions${qs}`);
  },

  async createStagedQuestion(input: {
    text: string;
    title: string;
  }): Promise<StagedQuestionIngestionResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/staging/questions`, {
        method: 'POST',
        headers: requestHeaders(),
        body: JSON.stringify({ ...input, source: 'Student_Interview' })
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 409 && payload.code === 'DUPLICATE_QUESTION' && payload.duplicate) {
        return { status: 'duplicate', duplicate: payload.duplicate, message: payload.error };
      }
      if (!response.ok || !payload.data) {
        return { status: 'error', message: payload.error || `Ingestion failed with HTTP ${response.status}.` };
      }
      return {
        status: 'created',
        question: payload.data,
        processing: {
          mode: payload.processing?.mode === 'ai' ? 'ai' : 'local',
          duplicateChecked: payload.processing?.duplicateChecked !== false,
          assetsGenerated: Boolean(payload.processing?.assetsGenerated),
          warnings: Array.isArray(payload.processing?.warnings) ? payload.processing.warnings : []
        }
      };
    } catch (error) {
      console.warn('[API Warning] Question ingestion failed:', error);
      return { status: 'error', message: 'The ingestion API is unavailable.' };
    }
  },

  async approveStagedQuestion(id: string, confirmedCategory: string, difficulty: 'Easy' | 'Medium' | 'Hard') {
    return fetchJson<StagedQuestion>(`${API_BASE_URL}/staging/questions/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmedCategory, difficulty })
    });
  },

  // AI
  async generateIssueCriteria(title: string, description: string) {
    return fetchJson<string[]>(`${API_BASE_URL}/ai/generate-criteria`, {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
  }
};
