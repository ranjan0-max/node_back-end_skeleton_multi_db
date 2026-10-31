/**
 * PM2 config
 * start:   pm2 start ecosystem.config.js --env production
 * restart: pm2 restart backend   (migrations run automatically on start)
 */
module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      instances: "max", // one process per CPU core (migrations are lock safe, logs per instance)
      exec_mode: "cluster",
      kill_timeout: 10000, // time for graceful shutdown
      env: { NODE_ENV: "development" },
      env_production: { NODE_ENV: "production" },
    },
  ],
};
