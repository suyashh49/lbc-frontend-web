const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; admin: { id: string; name: string; email: string; role: string } }>(
      '/api/admin/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  }

  // Dashboard
  async getDashboard() {
    return this.request<import('@/types').DashboardStats>('/api/admin/dashboard');
  }

  // Riders
  async getRiders(params?: { search?: string; hub?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.hub) query.set('hub', params.hub);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return this.request<{ riders: import('@/types').Rider[]; total: number }>(
      `/api/admin/riders${qs ? `?${qs}` : ''}`
    );
  }

  async getRider(id: string) {
    return this.request<{ rider: import('@/types').Rider; recentManifests: import('@/types').Manifest[] }>(
      `/api/admin/riders/${id}`
    );
  }

  async createRider(data: Record<string, unknown>) {
    return this.request<{ rider: import('@/types').Rider }>(
      '/api/admin/riders',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async updateRider(id: string, data: Record<string, unknown>) {
    return this.request<{ rider: import('@/types').Rider }>(
      `/api/admin/riders/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteRider(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/riders/${id}`,
      { method: 'DELETE' }
    );
  }

  // Manifests
  async getManifests(params?: { status?: string; riderId?: string; date?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.riderId) query.set('riderId', params.riderId);
    if (params?.date) query.set('date', params.date);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request<{ manifests: import('@/types').Manifest[]; total: number }>(
      `/api/admin/manifests${qs ? `?${qs}` : ''}`
    );
  }

  async getManifest(id: string) {
    return this.request<{ manifest: import('@/types').Manifest }>(
      `/api/admin/manifests/${id}`
    );
  }

  async createManifest(data: Record<string, unknown>) {
    return this.request<{ manifest: import('@/types').Manifest }>(
      '/api/admin/manifests',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async updateManifest(id: string, data: Record<string, unknown>) {
    return this.request<{ manifest: import('@/types').Manifest }>(
      `/api/admin/manifests/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteManifest(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/manifests/${id}`,
      { method: 'DELETE' }
    );
  }

  // Stops
  async getStops(params?: { manifestId?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.manifestId) query.set('manifestId', params.manifestId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request<{ stops: import('@/types').Stop[]; total: number }>(
      `/api/admin/stops${qs ? `?${qs}` : ''}`
    );
  }

  async getStop(id: string) {
    return this.request<{ stop: import('@/types').Stop }>(
      `/api/admin/stops/${id}`
    );
  }

  async createStop(data: Record<string, unknown>) {
    return this.request<{ stop: import('@/types').Stop }>(
      '/api/admin/stops',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async updateStop(id: string, data: Record<string, unknown>) {
    return this.request<{ stop: import('@/types').Stop }>(
      `/api/admin/stops/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteStop(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/stops/${id}`,
      { method: 'DELETE' }
    );
  }

  // ─── Orders (NEW) ───────────────────────────────

  async getOrders(params?: { hub?: string; zone?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.hub) query.set('hub', params.hub);
    if (params?.zone) query.set('zone', params.zone);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request<{ orders: import('@/types').Order[]; total: number }>(
      `/api/admin/orders${qs ? `?${qs}` : ''}`
    );
  }

  async createOrder(data: Record<string, unknown>) {
    return this.request<{ order: import('@/types').Order }>(
      '/api/admin/orders',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async bulkImportOrders(orders: Record<string, unknown>[]) {
    return this.request<{ message: string; created: number; skipped: number; errors: string[] }>(
      '/api/admin/orders/bulk',
      { method: 'POST', body: JSON.stringify({ orders }) }
    );
  }

  async updateOrder(id: string, data: Record<string, unknown>) {
    return this.request<{ order: import('@/types').Order }>(
      `/api/admin/orders/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteOrder(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/orders/${id}`,
      { method: 'DELETE' }
    );
  }

  // ─── Hubs (NEW) ─────────────────────────────────

  async getHubs() {
    return this.request<{ hubs: import('@/types').Hub[]; total: number }>('/api/admin/hubs');
  }

  async createHub(data: Record<string, unknown>) {
    return this.request<{ hub: import('@/types').Hub }>(
      '/api/admin/hubs',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async updateHub(id: string, data: Record<string, unknown>) {
    return this.request<{ hub: import('@/types').Hub }>(
      `/api/admin/hubs/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteHub(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/hubs/${id}`,
      { method: 'DELETE' }
    );
  }

  // ─── Zones (NEW) ────────────────────────────────

  async getZones() {
    return this.request<{ zones: import('@/types').Zone[]; total: number }>('/api/admin/zones');
  }

  async createZone(data: Record<string, unknown>) {
    return this.request<{ zone: import('@/types').Zone }>(
      '/api/admin/zones',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async updateZone(id: string, data: Record<string, unknown>) {
    return this.request<{ zone: import('@/types').Zone }>(
      `/api/admin/zones/${id}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  }

  async deleteZone(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/zones/${id}`,
      { method: 'DELETE' }
    );
  }
}

export const api = new ApiClient();
