# 📘 Technical_Documentation.md

---

## PART 1: GLOBAL FUNCTIONAL OVERVIEW

### 🎯 Purpose of the App

**LinkedIn Warm Intros** is a modern web application designed to help professionals manage their LinkedIn connections and discover qualified introduction opportunities within their network. The app is primarily targeted at business development professionals, recruiters, and networkers who want to leverage their LinkedIn connections to identify prospects and facilitate warm introductions.

**Business Problems Solved:**
- Difficulty in identifying relevant prospects within a large LinkedIn network.
- Lack of visibility into shared connections and potential introduction paths.
- Manual and time-consuming process to filter, score, and prioritize connections.

---

### 🧑‍💻 Main Features & User Experience

#### 1. **Authentication**
- **Purpose:** Secure access to user-specific data and features.
- **Business Problem:** Protect sensitive network data and ensure personalized experience.
- **UI Organization:** Login/signup forms ([`src/pages/LoginPage.tsx`](src/pages/LoginPage.tsx)), protected routes ([`src/components/auth/ProtectedRoute.tsx`](src/components/auth/ProtectedRoute.tsx)).
- **Backend Services:** Supabase Auth, JWT session management.

#### 2. **Dashboard**
- **Purpose:** Central hub for managing sessions, viewing stats, and importing LinkedIn connections.
- **Business Problem:** Provide a unified view of network data and session management.
- **UI Organization:** Dashboard page ([`src/pages/DashboardPage.tsx`](src/pages/DashboardPage.tsx)), import interface (CSV/URL), session stats.
- **Backend Services:** API endpoints for session and profile management.

#### 3. **Session Management**
- **Purpose:** Organize LinkedIn connections into independent work sessions.
- **Business Problem:** Enable focused prospecting and analysis per session.
- **UI Organization:** Session selector ([`src/components/session/SessionSelector.tsx`](src/components/session/SessionSelector.tsx)), session header ([`src/components/layout/SessionHeader.tsx`](src/components/layout/SessionHeader.tsx)).
- **Backend Services:** Session CRUD via API.

#### 4. **Connections Visualization**
- **Purpose:** Detailed view and advanced filtering of imported LinkedIn connections.
- **Business Problem:** Quickly identify relevant connections and shared attributes.
- **UI Organization:** Connections page ([`src/pages/ConnectionsPage.tsx`](src/pages/ConnectionsPage.tsx)), filtering/search, similarity scoring, highlighting shared companies/education.
- **Backend Services:** Profile data endpoints, scoring algorithms.

#### 5. **Prospect Identification**
- **Purpose:** Analyze network to find and prioritize promising prospects.
- **Business Problem:** Automate prospect discovery and scoring for efficiency.
- **UI Organization:** Prospects page ([`src/pages/ProspectsPage.tsx`](src/pages/ProspectsPage.tsx)), scoring display, introduction path suggestions.
- **Backend Services:** Prospect analysis endpoints, scoring logic.

---

## PART 2: TECHNICAL ARCHITECTURE OVERVIEW

### 🏗️ Overall Architecture

- **Frontend:** React 19 + TypeScript, Vite build tool, Tailwind CSS for styling, React Router v7 for navigation.
- **Backend:** RESTful API (custom client in [`src/services/api.ts`](src/services/api.ts)), Supabase Auth for authentication.
- **Database:** Managed via Supabase (PostgreSQL), storing user, session, and profile data.
- **3rd-party Integrations:** Supabase Auth, LinkedIn data import, JWT-secured API calls.

---

### 🧱 Code Structure

- `src/components/`: Reusable UI components (auth, layout, session, etc.)
- `src/pages/`: Route-level components (Dashboard, Connections, Prospects, Login, Welcome)
- `src/contexts/`: React context providers for global state (Auth, Session, Profile)
- `src/services/`: API clients and external service integrations
- `src/hooks/`: Custom React hooks for logic reuse
- `src/utils/`: Helper functions (auth, general utilities)
- `src/types/`: TypeScript type definitions

---

### 🔑 Key Technical Concepts

- **Authentication Flow:** Supabase Auth manages user sessions; JWT tokens secure API requests. Protected routes ensure only authenticated users access sensitive pages.
- **State Management:** React Contexts (`AuthContext`, `SessionContext`, `ProfileContext`) provide global state for authentication, session, and profile data.
- **Data Flow:** API client handles RESTful communication with backend, including error handling and retry logic. Real-time session status sync.
- **UI Patterns:** Functional components, hooks, and context for modularity and maintainability. Tailwind CSS for responsive, utility-first styling.
- **Routing:** React Router v7 for client-side navigation, with route protection and intelligent redirection based on auth state.
- **Error Management:** Centralized error handling in API client and context providers.

---

### ⚡ Notable Frameworks & Design Decisions

- **React 19** for modern SPA development.
- **Vite** for fast builds and hot module replacement.
- **Supabase** for authentication and backend data storage.
- **Tailwind CSS** for rapid UI development.
- **TypeScript** for type safety and maintainability.
- **Context-based state management** for scalability.

---

### 🚀 Developer Quickstart

#### Install & Run Locally

```bash
git clone <repo-url>
cd WI_frontend
pnpm install
pnpm dev
```

#### Testing

- (Add test instructions here if applicable, e.g. `pnpm test`)

#### Deployment

- Build for production:  
  ```bash
  pnpm build
  ```
- Deploy static files to your preferred hosting (e.g. Vercel, Netlify).

---

For more details, see the [README.md](README.md) and explore the codebase structure for