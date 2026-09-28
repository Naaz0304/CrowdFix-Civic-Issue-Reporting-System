// CrowdFix API Client
// Centralized HTTP client with JWT token management and auto-refresh

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      if (data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If 401, try refreshing the token
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
          response = await fetch(url, { ...options, headers });
        } else {
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return { success: false, error: 'Session expired. Please login again.' };
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  }

  // ─── Auth ─────────────────────────────────────────
  async register(name: string, email: string, password: string, role: string) {
    const mappedRole = role === 'authority' ? 'admin' : role;
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: mappedRole }),
    });
    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(result.data.user));
    }
    return result;
  }

  async login(email: string, password: string, role: string) {
    const mappedRole = role === 'authority' ? 'admin' : role;
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: mappedRole }),
    });
    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(result.data.user));
    }
    return result;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
    this.clearTokens();
  }

  // ─── Users ────────────────────────────────────────
  async getProfile() {
    return this.request('/users/me');
  }

  async updateProfile(data: any) {
    return this.request('/users/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ─── Issues ───────────────────────────────────────
  async createIssue(data: any) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIssues(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/issues${query ? `?${query}` : ''}`);
  }

  async getIssueById(id: string) {
    return this.request(`/issues/${id}`);
  }

  async updateIssue(id: string, data: any) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIssue(id: string) {
    return this.request(`/issues/${id}`, { method: 'DELETE' });
  }

  async toggleUpvote(issueId: string) {
    return this.request(`/issues/${issueId}/upvote`, { method: 'POST' });
  }

  async rateIssue(issueId: string, rating: number, feedback: string) {
    return this.request(`/issues/${issueId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async getHeatmapData() {
    return this.request('/issues/heatmap');
  }

  // ─── Admin ────────────────────────────────────────
  async getAdminIssues(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/issues${query ? `?${query}` : ''}`);
  }

  async assignIssue(issueId: string, assignedToId: string) {
    return this.request(`/admin/issues/${issueId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigned_to_id: assignedToId }),
    });
  }

  async updateIssueStatus(issueId: string, status: string, comment?: string, remarks?: string) {
    return this.request(`/admin/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment, remarks }),
    });
  }

  async getAdminList() {
    return this.request('/admin/list');
  }

  // ─── Notifications ────────────────────────────────
  async getNotifications(page = 1, limit = 50) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // ─── Dashboard ────────────────────────────────────
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
