module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      exec_mode: 'cluster',
      instances: 'max',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      merge_logs: true,
      cwd: process.env.PWD,
    },
  ],
};
