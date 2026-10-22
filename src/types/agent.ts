export interface PendingActionDetail {
  tool_name: string;
  tool_args: Record<string, any>;
}

export interface QueryRequest {
  question: string;
  thread_id: string;
}

export interface QueryResponse {
  response: string;
  status: 'completed' | 'interrupted';
  thread_id: string;
  pending_action?: PendingActionDetail | null;
  full_history: string[];
}

export interface ApprovalRequest {
  thread_id: string;
  approve: boolean;
}

export interface ThreadHistoryResponse {
  thread_id: string;
  messages: string[];
  status: 'completed' | 'interrupted';
  pending_action?: PendingActionDetail | null;
}

export interface ThreadInfo {
  thread_id: string;
  message_count: any;
}

export interface HealthStatus {
  status: string;
}