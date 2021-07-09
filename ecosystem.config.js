module.exports = {
  apps: [
    {
      name: 'website-nuxt',
      script: 'npm',
      args: 'start',
      watch: false,
      node_args: '',
      merge_logs: true,
    },
  ],
  deploy: {
    production: {
      ref: 'origin/main',
      repo: 'https://github.com/SwissTchoukball/website-next',
      path: process.env.HOME + '/sites/tchoukball.ch',
      'post-deploy': 'npm ci && npm run build && pm2 restart ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
