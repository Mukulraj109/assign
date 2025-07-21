const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Shipment methods
  async getShipments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/shipments?${queryString}` : '/shipments';
    return this.request(endpoint);
  }

  async getShipment(id) {
    return this.request(`/shipments/${id}`);
  }

  async createShipment(shipmentData) {
    return this.request('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipment(id, updates) {
    return this.request(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteShipment(id) {
    return this.request(`/shipments/${id}`, {
      method: 'DELETE',
    });
  }

  // QC methods
  async completeLevel1QC(shipmentId, data) {
    return this.request(`/qc/level1/${shipmentId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeLevel2QC(shipmentId, itemId, data) {
    return this.request(`/qc/level2/${shipmentId}/items/${itemId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadQCPhotos(shipmentId, files, metadata = {}) {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await fetch(`${API_BASE_URL}/qc/photos/${shipmentId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async getQCHistory(shipmentId) {
    return this.request(`/qc/history/${shipmentId}`);
  }

  async getQCStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/qc/stats?${queryString}` : '/qc/stats';
    return this.request(endpoint);
  }
}

export default new ApiService();