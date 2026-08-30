# 🛡️ MediVault AI

> **Your Prescriptions, Organized Intelligently.**

MediVault AI is a production-grade, secure web application designed to help users privately upload prescriptions, extract details via AI/OCR, verify and manage schedules, and research safety guidelines using official databases (openFDA). 

---

## ✨ Features & Architecture

### 📁 1. Secure Prescription Upload Pipeline
*   **Magic Byte Verification**: Verifies file uploads by reading binary signatures rather than trusting user-provided MIME types (supports JPEG, PNG, WEBP, and PDF).
*   **Cryptographically Isolated Storage**: Filenames are discarded and files are renamed using secure UUIDs. Files are kept outside the web root (`/private_uploads/`) and served strictly through authenticated endpoints.
*   **No-Store CDN Caching**: Served with custom HTTP headers to prevent private medical documents from being cached by browsers or public CDN servers.

### 🔬 2. Medicine Research & Verification Layer
*   **OpenFDA Integration**: Automatically queries the official US openFDA catalog to retrieve generic names, indications, side effects, warnings, interactions, and storage info.
*   **30-Day Database Cache**: Minimizes external API latency and rate-limits by caching research results locally.
*   **Strict Security & Redaction**: Cleans and redacts credentials or secrets from log traces.

### 📅 3. Medicine Scheduling Engine
*   **Deterministic Scheduling**: Translates complex doctor instructions (e.g. *"1 tablet twice daily"*, *"after meals"*, *"every 8 hours"*) into precise chronological daily time slots.
*   **Intelligent Meal Offsets**: Automatically shifts doses (e.g., adding a 30-minute delay after breakfast/dinner) based on food intake instructions.
*   **Interactive Compliance Tracker**: Allows patients to log doses as Taken or Skipped, adjust specific times inline, and toggle active/paused schedules.

### 🔗 4. Connected AI Extraction Workflow
*   **OCR Simulation & Confidence Mapping**: Simulates file analysis, displaying OCR results alongside extraction confidence parameters (e.g. `95% confidence`).
*   **Inline Verification Form**: Renders an interactive review interface. Any extraction with less than 90% confidence displays a prominent warning badge (`Verify Carefully`).
*   **Atomic Database Transaction**: Finalizing reviews executes inside a Prisma `$transaction` ensuring no orphan files, partial database states, or missing schedules occur.

---

## 🏗️ Folder Structure

```text
src/
├── app/                  # Next.js App Router Pages & API Routes
│   ├── (auth)/           # Authentication views (Credentials, Signup, Signin)
│   ├── (dashboard)/      # Protected dashboard views (Prescriptions, Schedule)
│   ├── api/              # Secure APIs (Private file serving, uploads, registration)
│   └── page.tsx          # Landing page
├── components/           # UI Components
│   ├── ui/               # Reusable atomic buttons, cards, empty states
│   ├── prescription/     # Upload widgets & interactive review forms
│   ├── schedule/         # Timetables, logs, and calendar views
│   └── layout/           # Sidebar navigation & landing navbar
├── lib/                  # Core Business & Infrastructure Logic
│   ├── auth/             # Session configuration & user isolation helpers
│   ├── db/               # Prisma Client singleton configuration
│   ├── medicines/        # openFDA research cache & provider abstraction
│   ├── scheduling/       # Deterministic scheduling & meal offset parser
│   ├── security/         # In-memory IP-based rate-limiter
│   ├── validation/       # Zod validation schemas (Auth & Prescriptions)
│   └── utils/            # safeRevalidatePath helper & sanitized error log handlers
├── types/                # Strict TypeScript domain interfaces
├── prisma/               # Database blueprint schema and seed scripts
└── scratch/              # Test suites and CLI scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js `v20.x` or higher
*   npm `v10.x` or higher
*   PostgreSQL Database Server

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://postgres:Muneeb@localhost:5432/medivault_db?schema=public"
AUTH_SECRET="your-32-character-secret-key-goes-here"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
Synchronize the PostgreSQL database schema and seed the demonstration records:
```bash
# Push schemas to Postgres
npx prisma db push

# Seed demo data (demo@medivault.ai)
npx prisma db seed
```

### 5. Running the Application
Launch the development server:
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to access the landing page. Sign in with the seeded user account (`demo@medivault.ai`).

---

## 🧪 Testing Suites

The codebase includes assertions-based test suites running against mock/sandboxed environments. Execute them using `tsx`:

```bash
# Test 1: Upload validation, MIME signatures, and size limitations
npx tsx scratch/test-upload.ts

# Test 2: openFDA API lookup, data mapping, and local caching
npx tsx scratch/test-medicine.ts

# Test 3: Scheduling engine parsing and daily time slot allocations
npx tsx scratch/test-scheduling.ts

# Test 4: Full connected AI workflow, review corrections, and database transactions
npx tsx scratch/test-workflow.ts
```

---

## ⚙️ Core CLI Scripts

*   `npm run dev`: Starts the Turbopack Next.js development server.
*   `npm run build`: Generates the compiled static/dynamic production output.
*   `npm run lint`: Validates code styles and runs strict ESLint checks.
*   `npm run type-check`: Verifies complete type-safety across the project.
