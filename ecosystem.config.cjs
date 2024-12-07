module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      exec_mode: 'cluster',
      instances: process.env.PM2_AMOUNT_INSTANCES || 1,
      script: './.output/server/index.mjs',
      merge_logs: true,
      cwd: process.env.PWD,
    },
  ],
};
