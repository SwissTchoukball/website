# Swiss Tchoukball website - frontend

Future website of Swiss Tchoukball, made with [Nuxt.js](https://nuxtjs.org).

Production is on [tchoukball.ch](https://tchoukball.ch)

Staging is on [next.tchoukball.ch](https://next.tchoukball.ch). For now it uses the same CMS instance as in production. It's fine currently, as we only read data from the CMS.

## Setup

Production and staging are hosted on an Infomaniak Managed Cloud Server.

Deployment is automated via GitHub Actions.

### pm2 setup

Based on [Infomaniak documentation](https://www.infomaniak.com/fr/support/faq/2201/serveur-cloud-application-nodejs-fonctionnement-permanent).

[pm2 CLI doc](https://pm2.io/docs/runtime/reference/pm2-cli/)

To show the list of active crons: `crontab -l`.

## Development

After having cloned the repository:

- `nvm use`
- `npm install`
- Duplicate `.env.example` into `.env`
  - The variable `CMS_URL` is already set to match a locally running Directus CMS from [swisstchoukball/cms](https://github.com/swisstchoukball/cms).
- `npm run dev`

### Run in production mode

- `npm run build`
- `npm run start`
