const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  responseTimeMs: number;
  services: {
    database: {
      provider: string;
      connected: boolean;
      message: string;
    };
    aiEngine: {
      provider: string;
      configured: boolean;
    };
    codeSandbox: {
      provider: string;
      configured: boolean;
      url: string;
    };
  };
}

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}
