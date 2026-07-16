# ⚖️ LegalBuddy AI (Redesigned Frontend)

LegalBuddy AI is a premium, modern, and highly interactive multilingual Indian legal assistant. Built with **Next.js 16 (App Router)** and styled using the next-generation **Tailwind CSS v4**, the application delivers a seamless, responsive, and glassmorphic user interface tailored for citizens and legal professionals alike.

---

## 🌟 Key Features

- **🌐 Multilingual Support (22 Languages):** Query and receive responses in 22 scheduled Indian languages (including Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Kannada, Malayalam, and more).
- **🎙️ Voice Query (Speech-to-Text):** Integrated browser-based Speech Recognition mapped to local Indian accents and languages.
- **🔊 Read Aloud (Text-to-Speech):** High-quality speech synthesis that cleans and speaks generated legal counsel answers back in the chosen language.
- **📍 Smart State-Specific Filtering:** Ability to filter search results and contexts dynamically using custom state-level rules or search nationally.
- **✅ Citations & Verification:** Bot responses showcase primary legal record citations (Acts, Sections, States, etc.) to ensure information validity.
- **🔒 Flexible Authentication System:**
  - Full registration & login flow.
  - Interactive guest access enabling users to explore the dashboard and chat features immediately without signup.
- **📥 History Export:** Users can download and save their complete legal conversation transcripts.
- **✨ Premium UI & UX:**
  - Custom glassmorphic elements (`glass-panel`, `glass-bubble-user`, `glass-bubble-bot`).
  - Smooth animated mesh gradients (`animate-mesh`, `animate-mesh-dark`).
  - Floating ambient blobs and polished micro-animations.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Standalone Output Mode)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/postcss`
- **HTTP Client:** [Axios](https://github.com/axios/axios) for robust API communications
- **Linting & Formatting:** ESLint 9

---

## 📁 Directory Structure

```text
legalbuddy-frontend/
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.jsx        # Premium Chat console, voice control, language selection
│   │   ├── login/
│   │   │   └── page.jsx        # Authenticate with credentials, mesh gradient bg
│   │   ├── register/
│   │   │   └── page.jsx        # Signup page with password complexity prompts
│   │   ├── globals.css         # Tailwind directives & custom glassmorphism layers
│   │   ├── layout.jsx          # Root layout defining viewports & Geist typography
│   │   └── page.jsx            # client-side entry point (redirects to /chat)
│   └── services/
│       └── auth.js             # API wrapper for register, login, logout, and token handling
├── public/                     # Static vectors, icons, and assets
├── next.config.mjs             # Next.js configuration (configured for 'standalone' builds)
├── eslint.config.mjs           # Project linting configuration
└── package.json                # Dependencies and project scripts
```

---

## ⚙️ Configuration & Environment Variables

The application relies on a backend API server. You can configure the API URL using the following environment variable:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

*Note: If `NEXT_PUBLIC_API_URL` is omitted, the frontend defaults to `http://localhost:8000`.*

---

## 🚀 Getting Started

### 1. Installation

Install all required npm dependencies:

```bash
npm install
```

### 2. Run the Development Server

Start the hot-reloading development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Build for Production

Compile a production-optimized build of the project:

```bash
npm run build
```

This project is configured with `output: 'standalone'` in [next.config.mjs](file:///c:/Users/Hariprakash%20A/Desktop/samp/legalbuddy-frontend/next.config.mjs), which builds a lightweight standalone folder package perfect for containerized environments (like Docker) or quick server deployments without needing all `node_modules` dependencies.

### 4. Start Production Server

Run the production server locally:

```bash
npm run start
```

### 5. Code Quality Check

Run the linter to verify code structure and standard compliance:

```bash
npm run lint
```

---

## 👥 Authentication & Security

- **Tokens:** Access tokens are stored inside `localStorage` along with user email identifiers.
- **Authorization:** Authenticated endpoints automatically receive a `Bearer <token>` via custom `authHeader` injection.
- **Session Expirations:** If the API returns `401 Unauthorized`, the client automatically logs the user out and redirects them to the guest chat screen.

---

> ⚖️ **Disclaimer:** LegalBuddy AI is an AI-powered assistant designed for informational and educational legal purposes. It is not a substitute for professional legal advice from a certified advocate.
