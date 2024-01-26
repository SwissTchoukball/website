import { ServerMiddleware } from '@nuxt/types';

const redirectMiddleware: ServerMiddleware = (req, res, next) => {
  // These are server-side-only redirections.
  // There shouldn't be any internal link navigating to those, as they wouldn't work client-side.
  if (req.url?.startsWith('/championnat')) {
    res.writeHead(301, { Location: '/competitions/ligue-a' });
    res.end();
  } else if (req.url?.startsWith('/coupesuisse')) {
    res.writeHead(301, { Location: '/competitions/coupe-suisse' });
    res.end();
  } else if (req.url?.startsWith('/staff')) {
    res.writeHead(301, { Location: '/structure' });
    res.end();
  } else if (req.url?.startsWith('/wtc2023')) {
    res.writeHead(301, { Location: '/equipes-nationales/competitions/wtc2023' });
    res.end();
  } else if (req.url?.startsWith('/wytc2023')) {
    res.writeHead(301, { Location: '/equipes-nationales/competitions/wytc2023' });
    res.end();
  } else if (req.url?.startsWith('/etc2022')) {
    res.writeHead(301, { Location: '/equipes-nationales/competitions/etc2022' });
    res.end();
  } else {
    next();
  }
};

export default redirectMiddleware;
