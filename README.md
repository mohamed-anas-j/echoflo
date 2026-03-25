# EchoFlo

**EchoFlo** is a modern, AI-powered productivity application designed to help you capture, organize, and execute tasks with rhythm and focus. It combines the structured efficiency of a traditional task manager (like Todoist) with the generative intelligence of Google's Gemini models.

## 🚀 Live Demo

Try the app now (Login as guest as authentication API is not setup): **[https://echoflo-705765506241.us-west1.run.app/](https://echoflo-705765506241.us-west1.run.app/)**

---

## 🌟 Key Features

### 🧠 Echo: The AI Assistant
The core feature of the app. Click "Ask Echo" to open a multimodal interface.
- **Voice & Text Capture**: Speak or type naturally (e.g., *"Remind me to call John next Friday for the marketing review"*).
- **Smart Parsing**: Uses **Gemini 2.5/3** to extract:
  - Task Content & Description
  - Due Dates (Relative & Absolute)
  - Priorities (P1 - P4)
  - Habit Frequency (Daily, Weekly)
  - Target Project/Space
- **Multilingual Support**: Automatically translates tasks into your preferred language defined in Settings.

### ✅ Task Management
- **Smart Filters**: Filter by Priority (P1-P4), Due Date, Overdue, and Completion status.
- **Spaces (Projects)**: Organize tasks into specific buckets (Work, Personal, etc.) with custom colors.
- **Subtask AI**: One-click AI generation of subtasks for complex items.

### 📅 Calendar View
- **Drag & Drop**: Visually organize your month by dragging tasks between days.
- **Visual Cues**: Tasks are color-coded by priority.

### 🔥 Habit Tracker
- **Streak System**: Tracks consecutive completions.
- **Daily/Weekly/Monthly**: Supports different habit frequencies.
- **Visual History**: Streak counters and completion visualizers.

### 🎨 Customization
- **Theming**: Full Dark Mode support and 6 custom accent color palettes (Emerald, Violet, Rose, etc.).
- **Gamification**: Earn "Karma" points and levels for completing tasks and maintaining streaks.

---

## 🏗️ Architecture

EchoFlo is built as a **Client-Side Single Page Application (SPA)**. It operates entirely in the browser without a dedicated backend server for database storage.

### Tech Stack
- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/) (via `@google/genai` SDK)
- **Build**: ES Modules / Vite-compatible structure

### Data Flow
1.  **Persistence**: All data (tasks, projects, settings) is persisted in the browser's `localStorage`. This ensures privacy and offline capability for viewing data.
2.  **State Management**: Centralized state in `App.tsx` using React Hooks (`useState`, `useMemo`) propagated down to components via props.
3.  **AI Integration**:
    - **Input**: User records audio (Web Audio API) or types text.
    - **Processing**: Audio blobs or text strings are sent directly to Google Gemini.
    - **Output**: Gemini returns a structured JSON schema enforcing strict typing (Task vs. Habit, Date formats, etc.).
    - **Hydration**: The JSON is parsed and hydrated into the local React state.

### File Structure
```
/
├── index.html              # Entry point & Tailwind config
├── index.tsx               # React Root mount
├── App.tsx                 # Main Controller & State Holder
├── types.ts                # TypeScript Interfaces (Domain Models)
├── metadata.json           # App capabilities (Permissions)
└── components/
    ├── Sidebar.tsx         # Navigation & Projects list
    ├── HomeDashboard.tsx   # "At a Glance" stats & priorities
    ├── TaskFilters.tsx     # Filter bar logic
    ├── VoiceCapture.tsx    # "Echo" Modal (Audio/Text -> AI)
    ├── AddTask.tsx         # Manual & AI-assisted Quick Add
    ├── CalendarView.tsx    # Monthly Grid View
    ├── FlowItem.tsx        # Individual Task/Habit Card
    ├── SettingsView.tsx    # Theme, Data Export, Language
    └── ...
```

---

## 🚀 Setup & Running

This project uses a standard ES module structure.

### Prerequisites
1.  Node.js (if running locally via Vite/Webpack) or a modern browser environment.
2.  **Google Gemini API Key**: You must have a valid API key from [Google AI Studio](https://aistudio.google.com/).

### Environment Variables
The application expects the API key to be available via `process.env.API_KEY`.

### Installation
If running in a local development environment (e.g., Vite):

1.  Install dependencies:
    ```bash
    npm install react react-dom lucide-react uuid @google/genai
    ```
2.  Run the development server.

---

## 🧩 Data Model

**Tasks (`FlowItem`)**
```typescript
{
  id: string;
  type: 'TASK';
  content: string;
  priority: 1 | 2 | 3 | 4;
  dueDate: 'YYYY-MM-DD';
  projectId: string;
  isCompleted: boolean;
}
```

**Habits (`FlowItem`)**
```typescript
{
  id: string;
  type: 'HABIT';
  content: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  history: string[]; // Array of completion dates
}
```
