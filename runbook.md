# FAANG-Level Operations Runbook
**Modern Selfdrive Car Platform**

This document serves as the operational guide for developers and sysadmins maintaining the production environment. It provides step-by-step commands for common operational tasks, disaster recovery, and infrastructure debugging.

---

## 1. Zero-Downtime Deployments & Manual Rollbacks

The platform utilizes a PM2 cluster mode architecture, enabling zero-downtime reloads. However, if a deployment causes regressions that slip past the CI/CD pipeline, an emergency manual rollback is required.

**To manually rollback the deployment to the previous commit:**
1. SSH into the production server: `ssh user@production-ip`
2. Navigate to the project root: `cd /var/www/modern-selfdrive`
3. Revert git to the previous commit: `git reset --hard HEAD~1`
4. Reload the backend clusters without dropping active requests:
   ```bash
   pm2 reload ecosystem.config.js --update-env
   ```
   > Tip: You can also trigger an automated rollback directly from the GitHub Actions UI by running the `Production Deployment Pipeline` workflow manually and checking the `Trigger Rollback to Previous Version` box.

---

## 2. Managing the PM2 Cluster

PM2 keeps the Node.js instances alive, load balances them across CPU cores, and restarts them on failure.

- **Check cluster health & status:** `pm2 status`
- **Monitor live logs, CPU, and memory:** `pm2 monit`
- **View raw aggregated logs:** `pm2 logs modern-selfdrive-api`
- **Restart the entire cluster (causes brief downtime):** `pm2 restart modern-selfdrive-api`
- **Reload the cluster (zero downtime):** `pm2 reload modern-selfdrive-api`

---

## 3. Managing the Redis Cache

Redis caches high-traffic API endpoints (like vehicle listings) and handles distributed rate-limiting. If data appears stale, you may need to flush the cache.

**To flush all cached API responses:**
1. Connect to the Upstash Redis instance using `redis-cli` (or via the Upstash web console):
   ```bash
   redis-cli -u rediss://default:YOUR_UPSTASH_PASSWORD@your-upstash-endpoint:6379
   ```
2. Flush the entire database:
   ```bash
   FLUSHDB
   ```
   > Warning: `FLUSHDB` will clear rate limit counters and cached API responses. Use `DEL cache:/api/cars` if you only want to invalidate a specific endpoint.

---

## 4. OpenTelemetry Traces & Jaeger

Every request flowing through the platform is tagged with a unique Trace ID, which propagates down to MongoDB queries and external Cloudinary uploads.

**To debug a slow API request:**
1. Look at the PM2 logs (`pm2 logs`). You will see structured JSON logs. Note the `trace_id` attached to the slow request.
2. Open your Jaeger UI Dashboard (the exporter endpoint configured in `server/telemetry.js`).
3. Paste the `trace_id` into the search bar.
4. You will see a flame graph of the entire transaction, allowing you to instantly identify if the bottleneck was a slow MongoDB query, a slow Cloudinary upload, or heavy CPU computation in Node.js.

---

## 5. Circuit Breakers (Opossum)

Circuit breakers protect the system from cascading failures. If MongoDB or Cloudinary go down, the circuit "trips" open, returning a fast fallback error instead of causing request timeouts.

**How they work:**
- The breakers automatically close (recover) after 5 seconds if the failing dependency comes back online.

**To manually inspect breaker status:**
- You cannot "force reset" a breaker via CLI, as they are entirely self-healing. Check your PM2 logs for `[CIRCUIT BREAKER] name circuit half-open, testing recovery.` to observe its automated recovery cycle.

---

## 6. Rotating JWT Secrets Without Downtime

If a `JWT_SECRET` is compromised, you must rotate it. Rotating it abruptly will instantly log out all active users.

**To rotate secrets with minimal disruption:**
1. Update your `.env` file on the production server. Instead of replacing the secret, configure your auth service to accept the old secret as a fallback for validation, but sign all *new* tokens with the new secret. (Requires a minor code change in `auth.js`).
2. Reload PM2: `pm2 reload ecosystem.config.js --update-env`
3. All new logins will use the new secret. After 24 hours (when old tokens expire naturally), remove the old secret fallback from the codebase.
