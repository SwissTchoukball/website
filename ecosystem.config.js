module.exports = {
  apps: [
    {
      name: 'website-nuxt',
      script: 'npm',
      args: 'start',
      watch: false,
      node_args: '',
      merge_logs: true,
      cwd: process.env.HOME + '/sites/tchoukball.ch',
    },
  ],
};
