import { PlaneIssue, PlaneMember, PlaneModule, PlaneCycle } from '../data/planeData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

let authToken: string | null = null;

// Generic fetcher with graceful offline fallback
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const headers = new Headers(options?.headers || {});
    headers.set('Content-Type', 'application/json');
    
    // Use VITE_API_KEY for legacy routes if present
    if ((import.meta as any).env?.VITE_API_KEY) {
      headers.set('x-api-key', (import.meta as any).env.VITE_API_KEY);
    }
    
    // Attach Supabase JWT for protected routes
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const res = await fetch(url, {
      ...options,
      headers
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

  // AI
  async generateIssueCriteria(title: string, description: string) {
    return fetchJson<string[]>(`${API_BASE_URL}/ai/generate-criteria`, {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
  }
};
