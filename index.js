const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');
const get = require('lodash.get');
const trimStart = require('lodash.trimstart');
const isFunction = require('lodash.isfunction');
const isEmpty = require('lodash.isempty');

const enrouten = (folder, router, prefix = '') => {
  const items = fs.readdirSync(folder);

  items.forEach((item) => {
    const isFile = item.indexOf('.') >= 0;

    if (isFile) {
      try {
        // eslint-disable-next-line
        const file = require(path.join(folder, item));

        if (isFunction(file) && isFunction(get(router, 'use', null))) {
          const fileName = item.split('.').slice(0, -1).join('.');
          const routePath = trimStart(path.join(prefix, fileName !== 'index' ? fileName : ''), '.');
          const fileRouter = new Router({ prefix: !isEmpty(routePath) ? `/${routePath}` : '' });

          file(fileRouter);
          router.use(fileRouter.routes());
        }

        return router;
      } catch (error) {
        return router;
      }
    } else {
      return enrouten(path.join(folder, item), router, path.join(prefix, item !== 'index' ? item : ''));
    }
  });
};

const router = (folderName = '') => {
  const koaRouter = new Router();
  const folder = path.join(__dirname, '../../..', !isEmpty(folderName) ? folderName : '');

  enrouten(folder, koaRouter);

  return koaRouter;
};

module.exports = router;
