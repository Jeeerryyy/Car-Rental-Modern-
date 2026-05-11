import express from 'express';
import routes from '../src/routes/index.js';

const app = express();
app.use('/api', routes);

function printRoutes(path, stack) {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      const fullPath = (path + layer.route.path).replace(/\/+/g, '/');
      const middlewares = layer.route.stack.map(s => s.name || 'anonymous').join(', ');
      console.log(`${methods} ${fullPath} [${middlewares}]`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      printRoutes(path + layer.regexp.source.replace('\\/?', '').replace('^\\', '').replace('\\/', '/').replace('$', ''), layer.handle.stack);
    }
  });
}

console.log('--- ROUTE MAP ---');
printRoutes('/api', app._router.stack);
