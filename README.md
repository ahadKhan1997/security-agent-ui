# Security AI Agent UI (security-agent-ui) — Version 1.0.0 Technical Documentation

## Executive Overview
`security-agent-ui` is a standalone, client-side web application built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. It serves as the primary user interface for interacting with the `security-agent-base` FastAPI/LangGraph backend, providing real-time health monitoring, interactive chat capabilities, visual tool trace execution badges, and automated autoscrolling.

---

## 1. Technology Stack & Dependencies

| Category | Technology / Package | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 18 | Declarative UI rendering & state management |
| **Language** | TypeScript | Compile-time type safety & API contract enforcement |
| **Build Tooling** | Vite | Dev server with instant HMR & production bundler |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Cyberpunk-themed utility-first styling (`@import "tailwindcss";`) |
| **Icons** | Lucide React (`lucide-react`) | Cyber-themed icons (`Shield`, `Bot`, `Loader2`, `Wrench`, `User`) |
| **HTTP Client** | Axios (`axios`) | Asynchronous REST API requests to FastAPI backend |

---

## 2. Directory Structure

```text
security-agent-ui/
├── src/
│   ├── components/
│   │   └── ChatWindow.tsx       # Primary message output, autoscroll anchor, & loading state
│   ├── services/
│   │   └── api.ts               # Axios API client (/health and /agent/query)
│   ├── types/
│   │   └── agent.ts             # TypeScript interface contracts
│   ├── App.tsx                  # Main layout container & 10s health polling monitor
│   ├── main.tsx                 # React DOM entry point
│   └── index.css                # Tailwind CSS v4 CSS entry point
├── .env                         # Environment configuration (VITE_API_BASE_URL)
├── package.json
├── vite.config.ts               # Vite setup with @tailwindcss/vite plugin
└── tsconfig.json
```

---

## 3. Core Component Architecture

### A. Root Header & Health Monitor (`src/App.tsx`)
* **10-Second Polling Loop**: Continuously verifies backend status at `GET /health`.
* **Clean Lifecycle Management**: Executed inside `useEffect` with explicit `clearInterval` return cleanup to prevent double-execution timers during React 18 Strict Mode.
* **Live Status Badge**: Header displays real-time connection status (**Backend: Online (8000)** in green vs. **Backend: Offline** in red).

### B. Interactive Chat Window (`src/components/ChatWindow.tsx`)
* **Automated Autoscroll (`useRef`)**: Uses `messagesEndRef` attached to a bottom anchor `<div>`. A `useEffect` hook listening to `[messages, loading]` automatically executes `scrollIntoView({ behavior: 'smooth' })` whenever new messages are rendered or loading toggles.
* **Animated Loading Indicator**: Displays a spinning `Loader2` icon and animated pulsing dots while waiting for the FastAPI / LangGraph state machine to return responses.
* **Tool Execution Trace Badges**: Parses backend message history for tool executions and renders a visual badge (**Executed LangGraph Tool Sequence**) when `cve_lookup` or `calculate_severity` tools were invoked.
* **Error States**: Displays inline styled error alerts when API connectivity fails.

### C. Type-Safe API Client (`src/services/api.ts` & `src/types/agent.ts`)
* **Type-Only Imports**: Uses `import type { QueryResponse, HealthStatus }` in `api.ts` to prevent esbuild runtime export stripping errors.
* **Configurable Base URL**: Reads `import.meta.env.VITE_API_BASE_URL` with fallback to `http://localhost:8000`.

---

## 4. API Integration Contracts

### 1. Backend Health Check
* **Endpoint**: `GET /health`
* **Function**: `checkHealth()`
* **Response Contract (`HealthStatus`)**:
  ```typescript
  export interface HealthStatus {
    status: string;
  }
  ```

### 2. Query Agent Engine
* **Endpoint**: `POST /agent/query`
* **Function**: `queryAgent(question: string)`
* **Request Contract (`QueryRequest`)**:
  ```typescript
  export interface QueryRequest {
    question: string;
  }
  ```
* **Response Contract (`QueryResponse`)**:
  ```typescript
  export interface QueryResponse {
    response: string;
    full_history: Array<{
      type: 'human' | 'ai' | 'tool';
      content: string;
      name?: string;
    }>;
  }
  ```

---

## 5. Operations & Setup

### Environment Variable (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Commands
```powershell
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Build for production deployment
npm run build
```