/**
 * ecosystem.config.js
 * PM2 Process Management Configuration
 * 
 * This file defines how the Modern Selfdrive backend runs in production.
 * It utilizes PM2's cluster mode to spawn a separate Node.js process for every CPU core,
 * ensuring maximum throughput. It also defines memory thresholds to prevent leaks
 * and configures graceful zero-downtime reloads.
 */

module.exports = {
  apps: [{
    name: 'modern-selfdrive-api',
    script: 'server/server.js',
    
    // Launch a process for every available CPU core
    instances: 'max',
    
    // Enable Node.js cluster module load balancing
    exec_mode: 'cluster',
    
    // Automatically restart processes if they crash
    autorestart: true,
    
    // Watch for file changes in development, disabled in production
    watch: false,
    
    // Restart the process if it consumes more than 1GB of memory to prevent OOM crashes
    max_memory_restart: '1G',

    // How long to wait for the app to shut down gracefully before sending SIGKILL
    kill_timeout: 10000,
    
    // Ensure the PM2 load balancer waits for the new process to be ready before killing the old one
    wait_ready: true,
    
    // Pass these environment variables to the clustered nodes
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },

    // Logging paths for PM2. We use Winston for structured logs, but PM2 captures raw stdout/stderr
    error_file: './logs/pm2-err.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Merge logs from all clustered instances into a single file
    merge_logs: true
  }]
};
