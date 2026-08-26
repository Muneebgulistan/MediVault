# MediVault AI

> "Your prescriptions, organized intelligently."

MediVault AI is a production-grade web application designed to help users securely store doctor prescriptions, upload prescription images, extract prescription details via AI/OCR, organize medications, research medication details from trusted data sources, and generate automated medication timetables.

---

## 🏗 Project Architecture & Structure

The codebase adheres to a scalable modular architecture with business logic decoupled from UI components:

```text
src/
├── app/                  # Next.js App Router routes & API endpoints
│   ├── (auth)/           # Authentication layout and routes (Prepared)
│   ├── (dashboard)/      # User portal & dashboard routes (Prepared)
│   ├── api/              # Reusable API routes & health check
│   └── page.tsx          # Production Landing Page
├── components/           # UI Components
│   ├── ui/               # Atomic reusable primitives
│   ├── layout/           # Page layouts, navbar & hero components
│   ├── forms/            # Form components
│   ├── prescription/     # Prescription management UI
│   ├── medicine/         # Medicine list & detail components
│   └── schedule/         # Timetable UI components
├── lib/                  # Core Business & Infrastructure Logic
│   ├── auth/             # Auth.js integration & JWT helpers
│   ├── db/               # Prisma client singleton instance
│   ├── ai/               # AI extraction modules (Stubbed)
│   ├── ocr/              # Document & image OCR processing (Stubbed)
│   ├── medicines/        # Medicine research service (Stubbed)
│   ├── validation/       # Zod validation schemas
│   ├── storage/          # Storage abstraction layer
│   └── utils/            # API response builders & error handlers
├── config/               # Zod-validated environment config
├── types/                # Strict TypeScript domain types
├── hooks/                # Custom React hooks
├── prisma/               # Database schema & migrations blueprint
└── public/               # Static assets
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher
- PostgreSQL instance (optional for local scaffolding)

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Development Server
Run the local dev server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## ⚙ Core Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Compiles production build.
- `npm run lint`: Runs ESLint check.
- `npm run type-check`: Runs TypeScript compiler check without emitting files.
