const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', () => __dirname);

require('./utils/request-wrapper');

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('./utils/logger');

const onerror = require('./middleware/onerror');
const header = require('./middleware/header');
const utf8 = require('./middleware/utf8');
const cache = require('./middleware/cache');
const parameter = require('./middleware/parameter');
const template = require('./middleware/template');
const favicon = require('koa-favicon');
const debug = require('./middleware/debug');
const accessControl = require('./middleware/access-control');

const router = require('./router');
// const protected_router = require('./protected_router');
const mount = require('koa-mount');

// API related
const apiTemplate = require('./middleware/api-template');
// const api_router = require('./api_router');
const apiResponseHandler = require('./middleware/api-response-handler');

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Koa();

// const rsshub = new Koa();
// rsshub.proxy = true;
// // favicon
// rsshub.use(favicon(__dirname + '/favicon.png'));
// // global error handing
// rsshub.use(onerror);
// // 1 set header
// rsshub.use(header);
// rsshub.use(accessControl);
// rsshub.use(debug);
// // 5 fix incorrect `utf-8` characters
// rsshub.use(utf8);
// rsshub.use(apiTemplate);
// rsshub.use(apiResponseHandler());
// // 4 generate body
// rsshub.use(template);
// // 3 filter content
// rsshub.use(parameter);
// // 2 cache
// rsshub.use(cache(app));
// rsshub.use(router.routes()).use(router.allowedMethods());

const mainPage = new Koa();
mainPage.use(async (ctx, next) => {
    await next();
    ctx.body = 'vivi.one';
});

const googleRobots = new Koa();
googleRobots.use(async (ctx, next) => {
    await next();
    ctx.body = '';
});

// app.use(mount('/main', mainPage));
// app.use(mount('/rsshub', rsshub));
// app.use(mount('/robots.txt', googleRobots));

const appRouter = new Router();
appRouter
    .get('/', mount(mainPage))
    .get('/robots.txt', mount(googleRobots))
    .use('/rsshub', favicon(__dirname + '/favicon.png'), onerror, header, accessControl, debug, utf8, apiTemplate, apiResponseHandler(), template, parameter, cache(app), router.routes(), router.allowedMethods());

app.use(appRouter.routes()).use(appRouter.allowedMethods());

module.exports = app;
