import axios from 'axios';
import type { 
  QueryResponse, 
  HealthStatus, 
  ApprovalRequest, 
  ThreadHistoryResponse,
  ThreadInfo
} from '../types/agent';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const checkHealth = async (): Promise<HealthStatus> => {
  const res = await client.get<HealthStatus>('/health');
  return res.data;
};

export const createThread = async (): Promise<{ thread_id: string }> => {
  const res = await client.post<{ thread_id: string }>('/agent/threads');
  return res.data;
};

export const listThreads = async (): Promise<ThreadInfo[]> => {
  const res = await client.get<ThreadInfo[]>('/agent/threads');
  return res.data;
};

export const clearThreadHistory = async (threadId: string): Promise<void> => {
  await client.delete(`/agent/threads/${threadId}/history`);
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await client.delete(`/agent/threads/${threadId}`);
};

export const queryAgent = async (question: string, threadId: string): Promise<QueryResponse> => {
  const res = await client.post<QueryResponse>('/agent/query', { question, thread_id: threadId });
  return res.data;
};

export const fetchThreadHistory = async (threadId: string): Promise<ThreadHistoryResponse> => {
  const res = await client.get<ThreadHistoryResponse>(`/agent/threads/${threadId}/history`);
  return res.data;
};

export const approveAction = async (payload: ApprovalRequest): Promise<QueryResponse> => {
  const res = await client.post<QueryResponse>('/agent/approve', payload);
  return res.data;
};