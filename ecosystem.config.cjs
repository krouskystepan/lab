module.exports = {
  apps: [
    {
      name: "krouskylab",
      script: "node_modules/vite/bin/vite.js",
      args: "preview --host 127.0.0.1 --port 3020",
      cwd: "/var/www/apps/krouskylab",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
