module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      port: 3000,
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      merge_logs: true,
      cwd: process.env.PWD,
    },
  ],
};
