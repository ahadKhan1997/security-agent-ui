import axios from 'axios';
// Add 'type' keyword to explicit type imports
import type { QueryRequest, QueryResponse, HealthStatus } from '../types/agent';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async (): Promise<HealthStatus> => {
  const res = await client.get<HealthStatus>('/health');
  return res.data;
};

export const queryAgent = async (question: string): Promise<QueryResponse> => {
  const res = await client.post<QueryResponse>('/agent/query', { question });
  return res.data;
};