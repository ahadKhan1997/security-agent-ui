# 💻 `security-agent-ui` — Cybersecurity AI Agent Dashboard

A modern, standalone React dashboard interface built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. It interfaces directly with the `security-agent-base` backend to provide real-time vulnerability analysis, live system health monitoring, and tool execution traces.

---

## 🌟 Key Features

* **💬 Interactive Chat Experience**: Smooth natural language query interface featuring animated loading indicators (`Loader2`), pulsing dots, and error alerts.
* **📜 Auto-Scrolling View Engine**: React `useRef` auto-scroll anchors that keep the user centered on the latest response stream.
* **🛠️ Tool Execution Trace Badges**: Visual indicators (`Executed LangGraph Tool Sequence`) highlighting when backend agentic tools (`cve_lookup`, `calculate_severity`) are executed.
* **💓 Real-time Health Polling**: Continuous 10-second backend health checks (`GET /health`) with Strict Mode lifecycle safety (`clearInterval`) and visual status badges (`Backend: Online (8000)`).
* **⚡ Modern Build Stack**: Powered by Vite and Tailwind CSS v4 (`@tailwindcss/vite`) for zero-config CSS compilation and instant HMR.

---

## 🛠️ Tech Stack

* **Framework**: React 18
* **Language**: TypeScript
* **Build System**: Vite
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
* **Icons**: Lucide React (`lucide-react`)
* **HTTP Client**: Axios

---

## 📁 Project Structure

```text
security-agent-ui/
├── src/
│   ├── components/
│   │   └── ChatWindow.tsx       # Message list, auto-scroller, & tool execution badges
│   ├── services/
│   │   └── api.ts               # Type-safe Axios client for FastAPI endpoints
│   ├── types/
│   │   └── agent.ts             # Shared TypeScript API contracts
│   ├── App.tsx                  # Main layout container & 10s health monitor
│   └── index.css                # Tailwind CSS v4 entry point (@import "tailwindcss";)
├── .env                         # Environment configuration
├── vite.config.ts               # Vite configuration with Tailwind plugin
└── package.json
```

---

## 🚀 Quickstart Guide

### 1. Repository Setup

```powershell
git clone https://github.com/your-username/security-agent-ui.git
cd security-agent-ui
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Development Server

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser. Ensure your `security-agent-base` FastAPI server is running on `http://localhost:8000`.

---

## 📦 Production Build

```powershell
npm run build
```
