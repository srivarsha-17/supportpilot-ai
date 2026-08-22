# SupportPilot AI — Tier-1 Customer Support AI Employee

> **Supervity Full-Stack AI Engineer (FDE) Assessment**  
> Fictional SaaS Product: **FlowDesk** (Project Management & Team Collaboration)  
> Priority Mandate: **Groundedness > Reliability > Explainability > Visual Polish > Complexity**

---

## 📌 1. Overview

**SupportPilot AI** is an autonomous Tier-1 Customer Support AI Employee engineered for **FlowDesk**, a modern SaaS collaboration platform. It handles incoming customer inquiries, classifies support tickets into domain categories, retrieves verified documentation from a local structured knowledge base, synthesizes strictly grounded answers using Google Gemini, and deterministically escalates out-of-scope, unsupported, or low-confidence questions to human support specialists.

---

## 🎯 2. Problem & Purpose

Customer support teams in high-growth SaaS companies face a flood of repetitive Tier-1 inquiries (password resets, payment failures, notification permissions, invoice downloads). While generative AI can answer these instantly, unconstrained LLMs risk **hallucinating** fictitious policies, pricing tiers, or unauthorized refund guarantees.

SupportPilot AI solves this through:
1. **Strict Guardrails**: Every answer must be bounded by verified documentation.
2. **Transparent Retrieval**: Inspectable token-level scoring rather than opaque black-box embeddings.
3. **Deterministic Escalation**: Low relevance (< 65%) or out-of-domain queries immediately escalate with clear, explainable reasons.

---

## 🏗️ 3. Architecture & Request Flow

```text
[ User in React Chat UI ]
         │
         ▼  POST /api/support { "message": "Why did my payment fail?" }
┌────────────────────────────────────────────────────────────────────────┐
│ Express.js Backend Server (:5000)                                      │
│                                                                        │
│  1. Ticket Classifier (`server/services/classifier.js`)                │
│     ├── Category: `billing` | `technical` | `account_access` | `out_of_scope`
│     └── Heuristic Confidence: [0.00 – 1.00]                            │
│                                                                        │
│  2. Transparent Knowledge Retrieval (`server/services/retrieval.js`)   │
│     ├── Normalized tokenization & stopword removal                     │
│     ├── Stem & prefix matching across Title, Tags, Content             │
│     └── Calculates normalized relevance score [0.00 – 1.00]            │
│                                                                        │
│  3. Escalation Evaluator (`server/services/escalation.js`)             │
│     ├── Threshold Check: score < 0.65 (ESCALATION_THRESHOLD)           │
│     ├── Ambiguity Check: confidence < 0.45                             │
│     └── Domain Check: category === 'out_of_scope'                      │
│                                                                        │
│  [ Decision Gate ]                                                     │
│     ├── ❌ ESCALATE  ──► Returns status: "escalated" + Explainable Reason
│     └── ✅ ANSWER    ──► 4. Grounded Answer Generator (`aiService.js`) │
│                              ├── Google Gemini API (gemini-1.5-flash)  │
│                              └── Bounded strictly to retrieved snippet │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
[ Structured JSON Response Returned to Frontend Client ]
```

---

## 🌐 4. Deployment Architecture

```text
[ Web Browser ]
      │
      ▼ (HTTPS)
[ Vercel CDN ] ──► React + Vite Single Page App (Client)
      │
      ▼ (HTTPS REST API /api/support)
[ Render Cloud ] ──► Node.js + Express API Backend Server
      │
      ├──► Local FlowDesk Knowledge Base (JSON)
      └──► Google Gemini API (Grounded LLM Inference)
```

---

## 🛠️ 5. Technology Stack

### Frontend
- **React 18** (Functional components, hooks)
- **Vite 5** (Fast ES module bundler)
- **Vanilla CSS** (Custom responsive design system, dark slate & indigo aesthetic)
- **Lucide Icons** (Clean, accessible UI icons)

### Backend
- **Node.js 22 (ES Modules)**
- **Express.js 4** (Lightweight REST API)
- **CORS & Dotenv** (Production environment configuration)
- **Google Generative AI SDK (`@google/generative-ai`)** (Gemini 1.5 Flash)

---

## 📂 6. Repository Folder Structure

```text
supportpilot-ai/
│
├── client/                               # React + Vite Frontend
│   ├── public/
│   │   └── favicon.svg                   # Brand icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx         # Main chat view & layout
│   │   │   ├── InputBar.jsx              # Message input & submission
│   │   │   ├── MessageItem.jsx           # Formatted bubble, badges, escalation cards
│   │   │   ├── MessageList.jsx           # Message stream & empty welcome state
│   │   │   ├── Sidebar.jsx               # System health, KB stats & guardrails card
│   │   │   ├── StatusBadge.jsx           # Category, confidence & source badges
│   │   │   └── SuggestedQuestions.jsx    # Clickable starter demo queries
│   │   ├── services/
│   │   │   └── api.js                    # API client with VITE_API_BASE_URL
│   │   ├── styles/
│   │   │   └── index.css                 # Modern SaaS stylesheet
│   │   ├── App.jsx                       # State orchestration (chat, status)
│   │   └── main.jsx                      # React DOM entrypoint
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Node.js + Express Backend
│   ├── data/
│   │   └── knowledgeBase.json            # 21 realistic FlowDesk articles
│   ├── routes/
│   │   ├── kb.js                         # GET /api/kb & GET /api/health
│   │   └── support.js                    # POST /api/support (RAG orchestration)
│   ├── services/
│   │   ├── aiService.js                  # Gemini API grounded answer generator
│   │   ├── classifier.js                 # Ticket categorization & confidence
│   │   ├── escalation.js                 # Centralized escalation rules & thresholds
│   │   └── retrieval.js                  # Keyword & stem token scoring
│   ├── tests/
│   │   └── verify-pipeline.js            # Automated verification test suite
│   ├── .env.example
│   ├── server.js                         # Express server & CORS configuration
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 7. Local Setup & Startup Guide

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd supportpilot-ai
```

### Step 2: Configure Server
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
*(Note: If `GEMINI_API_KEY` is omitted, the system seamlessly operates in deterministic grounded fallback mode, ensuring zero failures during testing).*

Start backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

### Step 3: Configure Client
Open a new terminal:
```bash
cd client
npm install
cp .env.example .env
```
Edit `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend development server:
```bash
npm run dev
# App opens at http://localhost:5173
```

---

## 🧪 8. Automated Pipeline Verification

The backend includes a comprehensive 10-case verification test suite testing all demonstration scenarios:

```bash
cd server
npm test
```

Sample output:
```text
🧪 Starting SupportPilot AI Comprehensive Pipeline Tests...
--------------------------------------------------
▶ Testing: Case A: Billing (Failed Subscription Payment)
  Classification: billing (Confidence: 0.77)
  Retrieval Top Score: 0.98 (Top Article: Resolving Failed Subscription Payments)
  Escalation Decision: ANSWER
  ✅ PASSED
--------------------------------------------------
▶ Testing: Case D: Out of Scope (Gaming Laptop Recommendation)
  Classification: out_of_scope (Confidence: 0.9)
  Escalation Decision: ESCALATE (Trigger: OUT_OF_SCOPE)
  ✅ PASSED
==================================================
📊 Test Summary: 10 Passed, 0 Failed
==================================================
```

---

## 🎭 9. Five Mandatory Demonstration Cases

| Case | Customer Inquiry | Category | Decision | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Case A (Billing)** | *"Why did my subscription payment fail?"* | `billing` | **Answer** | Returns 7-day grace period, 3-retry schedule, and card update steps. Cites source `billing-05`. |
| **Case B (Account)** | *"I forgot my password. How can I log in?"* | `account_access` | **Answer** | Returns reset link steps (valid 60 mins), 8-character requirements. Cites source `account-01`. |
| **Case C (Technical)** | *"FlowDesk isn't sending me notifications."* | `technical` | **Answer** | Returns notification channel checks, OS Focus Assist/Do Not Disturb, and whitelist email. Cites source `tech-03`. |
| **Case D (Out of Scope)** | *"Can you recommend a laptop for gaming?"* | `out_of_scope` | **Escalate** | Immediately escalated with explanation: *"This request is outside FlowDesk product and support domain."* |
| **Case E (Unsupported)** | *"How do I deploy FlowDesk on our custom on-premise mainframe hardware cluster?"* | `out_of_scope` / Low Relevance | **Escalate** | Detects lack of evidence / unsupported on-premise mainframe hosting and escalates. |

---

## 🛡️ 10. Grounding & Anti-Hallucination Mechanism

Grounding is enforced through a multi-tier defense:

1. **Deterministic Filter Before LLM**: The server evaluates retrieval relevance score **before** touching the generative model. If the top article scores below `ESCALATION_THRESHOLD = 0.65`, the request is immediately halted and escalated. The LLM is never given the opportunity to hallucinate an answer for unsupported topics.
2. **Strict System Prompt Constraints**:
   ```text
   Answer using only the provided FlowDesk knowledge-base context.
   If the context does not contain enough information to answer the question reliably,
   do not guess. Request escalation instead.
   ```
3. **Low Temperature Inference**: Generation uses `temperature: 0.2` to minimize speculative phrasing and prioritize factual adherence.
4. **Source Attribution**: The response returns the exact article ID and title supporting each claim, displayed transparently in the chat bubble.

---

## ⚖️ 11. Key Architectural Tradeoff (Interview Talking Point)

> **Design Tradeoff Decision:**  
> *"We chose a lightweight, transparent keyword and stem-overlap retrieval engine over an external vector database (such as Pinecone, Qdrant, or Chroma) because the assessment utilizes a curated knowledge base of 21 articles. This makes the retrieval and scoring mechanism 100% inspectable, fast, zero-dependency, and deterministic. It allows engineers to inspect exactly why an article matched or why a query was escalated. In a production environment with 50,000+ documents, this layer can be seamlessly swapped for dense semantic vector embeddings without altering the downstream classification or escalation pipeline."*

---

## 🔒 12. Security & Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `PORT` | Backend | Port on which Express server listens (default: `5000` or dynamically assigned by host) |
| `GEMINI_API_KEY` | Backend | Google Gemini API key for grounded synthesis. **Never exposed to frontend.** |
| `CLIENT_URL` | Backend | Allowed CORS origin for production frontend (e.g. Vercel deployment URL) |
| `VITE_API_BASE_URL` | Frontend | Backend base URL (`http://localhost:5000` or production Render URL) |

Secrets are kept in local `.env` files which are strictly excluded in `.gitignore`.

---

## 🚢 13. Production Deployment Guide

### Deploying Backend to Render
1. Push repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your repository:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables in Render Dashboard:
   - `GEMINI_API_KEY`: `<your_gemini_api_key>`
   - `CLIENT_URL`: `https://<your-project>.vercel.app`
5. Deploy service and copy the live URL (e.g. `https://supportpilot-ai-backend.onrender.com`).

### Deploying Frontend to Vercel
1. Create a new project on [Vercel](https://vercel.com).
2. Connect your repository:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variable in Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://supportpilot-ai-backend.onrender.com`
4. Deploy and verify the live chat interface.

---

## 🔮 14. Future Roadmap
- **Dense Vector Search**: Integration with pgvector or Chroma for hybrid keyword + semantic retrieval.
- **Multi-turn Contextual Memory**: Session-based Redis memory to resolve conversational pronouns across turns.
- **Ticketing Webhooks**: Automatic ticket creation in Zendesk / Freshdesk upon escalation.
- **Agent Copilot Portal**: Real-time human handoff interface with escalation audit logs.
