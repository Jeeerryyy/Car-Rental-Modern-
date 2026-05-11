import mongoSanitize from 'express-mongo-sanitize';

export const sanitize = (app) => {
  app.use(mongoSanitize());
  
  app.use((req, res, next) => {
    const sanitizeInput = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitizeInput(obj[key]);
        }
      }
      return obj;
    };

    if (req.body) sanitizeInput(req.body);
    if (req.query) sanitizeInput(req.query);
    if (req.params) sanitizeInput(req.params);
    
    next();
  });
};

export default sanitize;
