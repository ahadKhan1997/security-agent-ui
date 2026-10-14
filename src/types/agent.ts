export interface QueryRequest {
  question: string;
}

export interface MessageState {
  type: 'human' | 'ai' | 'tool';
  content: string;
  name?: string;
  tool_calls?: Array<{
    name: string;
    args: Record<string, any>;
    id: string;
  }>;
}

export interface QueryResponse {
  response: string;
  full_history: MessageState[];
}

export interface HealthStatus {
  status: string;
}