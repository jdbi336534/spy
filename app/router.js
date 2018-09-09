'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/test', controller.home.test);
  router.get('/todb', controller.home.todb);
  router.get('/delete', controller.home.delete);
  router.get('/detail', controller.home.detail);
};
