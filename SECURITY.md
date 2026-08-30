# 🛡️ SECURITY.md — MediVault AI Security Policy & Controls

This document details the implemented security controls, defensive countermeasures, threat model mitigations, and identified risks of **MediVault AI**.

---

## 1. Implemented Security Controls

### A. Authentication & User Isolation
*   **Session Management**: Session authentication is handled using Auth.js (NextAuth v5) with secure JSON Web Tokens (JWT) signed with a cryptographically secure key (`AUTH_SECRET`).
*   **Password Hashing**: User credentials are encrypted using `bcrypt` with a work factor (salt rounds) of 12, protecting password databases against brute-force/rainbow table attacks.
*   **User Data Isolation**: Every server action, Server Component database load, and API endpoint resolves user identity from the server-side JWT context (`auth()`). Database queries strictly enforce isolation via the user ID (`where: { userId }`).

### B. File Upload Verification & Storage Security
*   **Magic Byte Validation**: Uploaded files undergo binary signature (magic byte) verification to verify that file contents correspond to the allowed types (`JPEG`, `PNG`, `WEBP`, or `PDF`), bypassing spoofed file extensions.
*   **Storage Path Isolation**: User filenames are discarded, and uploads are stored under randomly generated UUID names (`crypto.randomUUID()`). Uploads are saved inside a private uploads folder (`private_uploads/`) outside the public web server directory.
*   **Secure Serving API**: Files are served exclusively through an authenticated API route (`/api/files/[prescriptionId]/[fileId]`) that checks prescription ownership before streaming file bytes.
*   **No-Store Headers**: Served responses specify `Cache-Control: no-store` headers, preventing public CDNs or intermediate proxy servers from caching private prescription copies.

### C. Input Validation & API Hardening
*   **Zod Payload Validation**: Network input boundaries (such as registrations and prescription reviews) enforce strict type-safe schemas (e.g. `SignUpSchema`, `PrescriptionReviewSchema`) to sanitize strings, lengths, and enums.
*   **API Rate Limiting**: Sensitive routes (`POST /api/auth/register` and `POST /api/prescriptions/upload`) enforce in-memory rate limiting to mitigate brute-force and DDoS flooding.
*   **Log Sanitization**: Connection URIs and bearer authorization tokens are redacted inside `handleApiError` to prevent sensitive credentials from leaking into application stderr/stdout logs.

---

## 2. Threat Modeling & Remaining Risks

### A. Serverless Memory Limitations & Rate Limiting
*   **Risk**: The rate limiter is currently in-memory using JavaScript `Map`. In serverless cloud environments (e.g. Vercel), container scaling creates separate instances, resetting rates per instance.
*   **Mitigation**: In production, bind the rate-limiter to a centralized, low-latency key-value cache database (such as Redis/Upstash).

### B. Attachment Vulnerability Scans
*   **Risk**: Valid PDFs or image attachments could contain binary exploits that target parser vulnerabilities on user devices.
*   **Mitigation**: Introduce a cloud scanner API (e.g., ClamAV API) in the ingestion pipe to audit files for malicious binaries before committing to disk.
