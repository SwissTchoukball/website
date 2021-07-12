module.exports = {
  apps: [
    {
      name: 'website-nuxt',
      exec_mode: 'cluster',
      instances: 'max',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start',
      merge_logs: true,
      cwd: process.env.HOME + '/sites/tchoukball.ch',
    },
  ],
};
