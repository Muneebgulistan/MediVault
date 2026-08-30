# 📑 PRIVACY.md — MediVault AI Privacy Policy & Guidelines

MediVault AI handles sensitive medical and personal data. We are committed to maintaining data privacy, minimizing storage footprint, and giving patients complete control over their medical history.

---

## 1. Processed Data Categories

The application collects, processes, and stores the following categories of user data:

| Category | Data Fields | Purpose | Retention |
| :--- | :--- | :--- | :--- |
| **Identity & Authentication** | Email Address, Name, Passwords, Profile Image | User Account Management & Access control | Until account deletion |
| **Prescription Records** | Doctor Names, Prescription Notes, Timestamps | Clinical Reference & OCR extraction inputs | Until prescription/account deletion |
| **Medication Schedules** | Medicine Names, Dosages, Frequencies, Intervals | Generation of medication compliance charts | Until schedule/account deletion |
| **Compliance History** | Log Status (Taken, Skipped), Log Timestamps | Daily tracker tracking | Until schedule/account deletion |
| **Scanned Attachments** | PDF, JPEG, PNG, WEBP prescription image files | AI OCR text extraction sources | Until prescription/account deletion |

---

## 2. Privacy Protections & Logs Minimization

### A. Non-Exposition of Patient Information in Error Logs
*   Application error logs do not contain raw patient names, emails, prescription notes, or medication names.
*   System connection strings and database URLs are sanitized to hide PostgreSQL access keys.

### B. Analytical Anonymity
*   Analytics must never receive raw prescription images, notes, or patient clinical parameters.
*   Metrics are limited to usage counters (e.g. *number of active users*, *number of prescriptions uploaded*) without exposing sensitive contents.

### C. Self-Service Account & Data Deletion
*   Patients have absolute control over their records:
    *   **Prescription Deletion**: Instantly deletes the scanned attachment, normalized prescription, and its generated timetables.
    *   **Account Deletion**: Invokes cascading database operations that purge the user profile, all login credentials, all uploaded prescriptions, files, schedules, and daily logs.
