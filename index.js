const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');

const enrouten = (dirPath, router, prefix = '') => {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const isFile = item.indexOf('.') >= 0;
      const itemDirPath = path.join(dirPath, item);
      const validPrefix = typeof prefix === 'string' ? prefix : '';

      if (!isFile) return enrouten(itemDirPath, router, path.join(validPrefix, item !== 'index' ? item : ''));

      // eslint-disable-next-line
      const file = require(itemDirPath);

      if (typeof file === 'function' && typeof router.use === 'function') {
        const fileName = item.split('.').slice(0, -1).join('.');
        let routePath = path.join(validPrefix, fileName !== 'index' ? fileName : '');

        if (routePath[0] === '.') routePath = routePath.slice(1);

        const fileRouter = new Router({ prefix: routePath.length > 0 ? `/${routePath}` : '' });

        file(fileRouter);
        router.use(fileRouter.routes());
      }

      return router;
    });

    return router;
  } catch (error) {
    return router;
  }
};

const router = (dir = '') => {
  const koaRouter = new Router();
  const dirName = typeof dir === 'string' ? dir : '';
  const dirPath = path.join(__dirname, '../../..', dirName);

  enrouten(dirPath, koaRouter);

  return koaRouter;
};

module.exports = router;
