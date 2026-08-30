# Tasks: Secure Prescription Upload Pipeline

- `[x]` Update database schema `prisma/schema.prisma` and run generator
- `[x]` Update database seed script `prisma/seed.ts`
- `[x]` Update TypeScript type definitions `src/types/index.ts`
- `[x]` Implement private storage manager `src/lib/storage/provider.ts`
- `[x]` Implement secure file serving API route `src/app/api/files/[prescriptionId]/[fileId]/route.ts`
- `[x]` Update upload UI component `src/components/prescription/upload-quick-action.tsx`
- `[x]` Create and run verification script `scratch/test-upload.ts`
- `[x]` Verify TypeScript & ESLint compiles cleanly
- `[x]` Run production Next.js build
- `[x]` Stage, commit, and push to GitHub

# Tasks: Medicine Research & Verification Layer

- `[x]` Update database schema `prisma/schema.prisma` with research cache fields
- `[x]` Re-generate Prisma Client
- `[x]` Implement openFDA API provider with 30-day cache check (`src/lib/medicines/research.ts`)
- `[x]` Build Medicine detail view dashboard page (`src/app/(dashboard)/dashboard/medicines/[id]/page.tsx`)
- `[x]` Add Medical safety visual sections: "PRESCRIBED BY DOCTOR" vs "ADDITIONAL MEDICINE INFORMATION"
- `[x]` Embed medical disclaimer notice
- `[x]` Create unit/integration tests with mocked database (`scratch/test-medicine.ts`)
- `[x]` Run ESLint / TypeScript type check
- `[x]` Verify clean production compilation build
- `[x]` Commit changes and push to GitHub

# Tasks: Medicine Scheduling Engine

- `[x]` Add MedicineLog and LogStatus enum to `prisma/schema.prisma` to log daily slots
- `[x]` Synchronize local PostgreSQL database schema via `prisma db push`
- `[x]` Implement deterministic scheduling parser (`src/lib/scheduling/engine.ts`)
- `[x]` Add server actions for schedule confirmation, take logs, pauses, time edits (`src/app/actions/schedule.ts`)
- `[x]` Build Timetable client component with status actions and inline time edits (`src/components/schedule/timetable-client.tsx`)
- `[x]` Integrate schedule list view page (`src/app/(dashboard)/dashboard/schedule/page.tsx`)
- `[x]` Add schedule generation trigger button to prescription detail view
- `[x]` Test engine scenarios extensively (`scratch/test-scheduling.ts`)
- `[x]` Clean ESLint and TypeScript checks
- `[x]` Run production Next.js compile check
- `[x]` Stage, commit, and push to origin main

# Tasks: Connected Prescription Management Workflow

- `[x]` Implement simulated background OCR/AI processing action (`src/app/actions/ocr.ts`)
- `[x]` Build PrescriptionReviewClient review component with correction fields, add/delete rows (`src/components/prescription/prescription-review-client.tsx`)
- `[x]` Integrate review form conditional rendering in prescription details view page
- `[x]` Wrap review confirmation inside an atomic transaction (cleans mock data, creates finalized items, and generates schedules)
- `[x]` Create safe revalidation helper `safeRevalidatePath` to support test script runs
- `[x]` Test integration workflow end-to-end (`scratch/test-workflow.ts`)
- `[x]` Verify 0 TypeScript errors & 0 ESLint warnings
- `[x]` Run production build compilation (successful)
- `[x]` Stage, commit, and push to GitHub
