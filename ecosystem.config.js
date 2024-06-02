module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      args: 'start',
      merge_logs: true,
      cwd: process.env.PWD,
    },
  ],
};
