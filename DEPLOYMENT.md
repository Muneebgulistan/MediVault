# 🚀 DEPLOYMENT.md — Production Deployment & Backups Guide

This document describes the production deployment pipeline and database backup strategies for **MediVault AI**.

---

## 1. Production Deployment Pipeline

### Option A: Vercel Serverless Deployment (Recommended)
Next.js applications run natively on Vercel.
1.  **Repository Connection**: Connect your GitHub repository to Vercel.
2.  **Environment Setup**: Add the production variables in the Vercel project settings:
    *   `DATABASE_URL`: Production PostgreSQL connection string (use transaction pools like PgBouncer).
    *   `AUTH_SECRET`: Generate a secure secret using `openssl rand -hex 32`.
    *   `AUTH_TRUST_HOST`: `true`
    *   `AUTH_URL`: `https://your-domain.com/api/auth`
3.  **Build Command**: The build command is `next build`.
4.  **Database Migration**: Run Prisma migration in the Vercel build step (or post-deployment hook):
    ```bash
    npx prisma migrate deploy
    ```

### Option B: Docker Container Deployment
For custom server instances (AWS ECS, DigitalOcean App Platform, Kubernetes):
1.  **Dockerfile Definition**: Compile a multi-stage Docker build that runs Next.js in standalone output mode.
2.  **Run Migrations**: Run migrations before starting the container:
    ```bash
    npx prisma migrate deploy
    ```
3.  **Environment Variables**: Bind environment variables at container launch.

---

## 2. Production Database Backup Strategy

Since **MediVault AI** processes critical medical schedules, a robust disaster recovery plan is required.

### A. Automated Daily Backups
*   **Logical Backups**: Run automated daily logical backups of PostgreSQL using `pg_dump` to create compressed SQL archives.
    ```bash
    pg_dump -F c -b -v -f /backups/db_backup_$(date +%F).dump $DATABASE_URL
    ```
*   **Storage Location**: Upload dump files immediately to a secure, write-once-read-many (WORM) private cloud bucket (such as AWS S3 with Object Lock enabled).

### B. Point-in-Time Recovery (PITR)
*   For high-availability production databases (AWS RDS, Supabase, Neon), enable **Point-in-Time Recovery**. This maintains Write-Ahead Logs (WAL) allowing recovery to any specific second in the past 7–35 days.

### C. Backup Verification Tests
*   Run automated restore simulation tests once a month. Recreate the database schema and verify data integrity on a detached sandboxed instance.
