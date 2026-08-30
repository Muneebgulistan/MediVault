# MediVault AI: Security & Production-Readiness Audit

This document records the findings, fixes, and recommendations from the production-readiness audit conducted on **MediVault AI**.

---

## 1. Issues Found & Fixed

### A. API Request Rate Limiting (Fixed)
*   **Issue**: Crucial public API endpoints (`POST /api/auth/register` and `POST /api/prescriptions/upload`) lacked rate limiting. This made the application vulnerable to DDoS, registration flooding, and resource exhaustion.
*   **Fix**: Implemented a lightweight, thread-safe, in-memory rate-limiting utility (`src/lib/security/rate-limit.ts`) and applied it to the sensitive routes:
    *   **Register Endpoint**: Limit of 5 registration attempts per 15 minutes per IP.
    *   **Upload Endpoint**: Limit of 20 uploads per hour per user/IP.

### B. Prescription Review Input Verification (Fixed)
*   **Issue**: The user-finalized prescription review values submitted via server actions (`savePrescriptionReview`) were parsed without data structure schema validation. SQL/injection queries were avoided by Prisma but invalid values or malformed parameters could compromise integrity.
*   **Fix**: Created a rigid Zod validator schema (`src/lib/validation/prescription-schemas.ts`) that enforces constraints on names, frequencies, dosages, duration, and enum administration routes (`AdministrationRoute`). Integrated it directly at the boundary of `savePrescriptionReview`.

### C. Sensitive Log Redaction (Fixed)
*   **Issue**: Raw system errors containing database connection strings (`postgresql://user:password@host`) or active authorization tokens were printed directly in `console.error` inside `handleApiError()`, presenting a risk of secret leakage in log files.
*   **Fix**: Implemented `sanitizeError` in `src/lib/utils/error-handler.ts` which automatically matches and redacts database credentials and server authorization tokens from the logs before outputting.

### D. Unclear Confidence & Verification Prompts (Fixed)
*   **Issue**: If the OCR AI extraction returned a lower confidence score, the UI did not clearly flag it as uncertain, which could lead patients to accept inaccurate medical schedules.
*   **Fix**: Updated the review UI (`src/components/prescription/prescription-review-client.tsx`) to render a prominent, warning-styled Amber Banner (`Verify Carefully`) for any medication record with a confidence score below 90% ($< 0.90$), highlighting that manual correction is highly advised.

---

## 2. Security Audited Controls

### A. Authentication & User Isolation
*   **Audit**: Checked session management via Auth.js v5. Every database query in `/dashboard`, `/dashboard/prescriptions/[id]`, `/dashboard/schedule`, `/api/prescriptions`, and `/api/files` strictly resolves user identity from the server-side cookie context (`requireAuth()`). Data is isolated via `where: { userId }` filters on all Prisma queries.
*   **Status**: **SECURE**

### B. File Uploads & Malicious Files
*   **Audit**: Prescription document uploads are restricted to a maximum size of 10MB (`MAX_FILE_SIZE`). Uploaded files undergo binary magic-byte inspection (`validateFileSignature`) to verify they are true JPEG, PNG, WEBP, or PDF files. Filenames are discarded, and files are stored using cryptographically random UUIDs (`crypto.randomUUID()`) inside a private uploads folder.
*   **Status**: **SECURE**

### C. Access Control to Uploads
*   **Audit**: Files are served through `/api/files/[prescriptionId]/[fileId]`. This endpoint enforces ownership (`requirePrescriptionOwnership`) and disables browser/CDN caching using `Cache-Control: no-store` headers, preventing private medical files from leaking.
*   **Status**: **SECURE**

### D. Database Indexing & Transactions
*   **Audit**: All foreign keys and query parameters are indexed (`@@index([userId])`, `@@index([status])`, `@@index([takenDate])`), preventing full table scans. Operations altering medical schedules are wrapped in Prisma `$transaction` blocks to prevent corrupt schedule generation.
*   **Status**: **SECURE**

---

## 3. Remaining Risks & Recommended Production Controls

### A. In-Memory Rate Limiting Reset in Serverless Deployments
*   **Risk**: The current rate limiter uses an in-memory `Map`. In serverless environments (e.g. Vercel, AWS Lambda), server containers scale horizontally, meaning rate limit state is not shared across instances.
*   **Recommendation**: Replace the in-memory `Map` with a centralized cache store like Redis (e.g. Upstash, Redis Labs) in production.

### B. Antivirus Scanning for Uploaded Files
*   **Risk**: While magic-byte validation prevents executable extensions from being spoofed, PDF or image exploits could still evade standard signatures.
*   **Recommendation**: Integrate a cloud antivirus scanner (e.g. ClamAV, attachment scanning service) in the ingestion pipeline.

### C. Dependency Verification
*   **Risk**: `deepmerge-ts` inside `prisma` CLI config raises a deep nested dependency advisory regarding stack exhaustion in recursive object merges.
*   **Recommendation**: Perform regular package updates (`npm update`) as security advisories are resolved by Prisma.
