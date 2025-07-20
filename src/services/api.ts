// Saflair API Service
// Connects the frontend to the real backend instead of hardcoded data

const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  flrBalance: number;
  dailyStreak: number;
  totalVotes: number;
  accuracy: number;
}

interface SentimentData {
  bullish: number;
  bearish: number;
  neutral: number;
  totalVotes: number;
  rewardPool: number;
}

interface FlightPolicy {
  id: string;
  flightNumber: string;
  route: string;
  date: string;
  coverage: number;
  premium: number;
  status: 'active' | 'claimed' | 'expired';
  delayMinutes?: number;
  payoutAmount?: number;
}

interface FlightData {
  id: string;
  flightNumber: string;
  route: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  delayMinutes: number;
  status: string;
  confidenceScore: number;
}

interface PlatformStats {
  totalPolicies: number;
  totalCoverage: number;
  payoutsToday: number;
  avgResponseTime: number;
  successRate: number;
}

class ApiService {
  private token: string | null = null;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.token = localStorage.getItem('saflair_token');
    this.connectWebSocket();
  }

  // WebSocket connection for real-time updates
  private connectWebSocket() {
    try {
      this.wsConnection = new WebSocket(WS_URL);
      
      this.wsConnection.onopen = () => {
        console.log('🔌 Connected to Saflair WebSocket');
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('🔌 Disconnected from WebSocket, attempting to reconnect...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  // Event listener management
  addEventListener(eventType: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // HTTP request helper
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return { data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Authentication
  async register(username: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('saflair_token', this.token);
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('saflair_token', this.token);
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('saflair_token');
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Sentiment Voting
  async getCurrentSentiment(): Promise<ApiResponse<SentimentData>> {
    return this.request<SentimentData>('/sentiment/current');
  }

  async submitVote(sentiment: 'bullish' | 'bearish' | 'neutral'): Promise<ApiResponse<{ reward: number; sentiment: SentimentData }>> {
    return this.request('/sentiment/vote', {
      method: 'POST',
      body: JSON.stringify({ sentiment }),
    });
  }

  // Flight Insurance
  async getLiveFlights(): Promise<ApiResponse<FlightData[]>> {
    return this.request<FlightData[]>('/flights/live');
  }

  async searchFlights(from: string, to: string, date: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ from, to, date });
    return this.request<any[]>(`/flights/search?${params}`);
  }

  async purchaseInsurance(
    flightNumber: string,
    route: string,
    departureDate: string,
    coverageAmount: number,
    premium: number
  ): Promise<ApiResponse<{ policyId: string }>> {
    return this.request('/insurance/purchase', {
      method: 'POST',
      body: JSON.stringify({
        flightNumber,
        route,
        departureDate,
        coverageAmount,
        premium,
      }),
    });
  }

  async getUserPolicies(): Promise<ApiResponse<FlightPolicy[]>> {
    return this.request<FlightPolicy[]>('/insurance/policies');
  }

  // Platform Stats
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return this.request<PlatformStats>('/stats/platform');
  }

  async getLeaderboard(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/leaderboard');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export type { User, SentimentData, FlightPolicy, FlightData, PlatformStats }; 