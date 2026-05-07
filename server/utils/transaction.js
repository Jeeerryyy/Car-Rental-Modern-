const mongoose = require('mongoose');

const withTransaction = async (operations, retries = 3) => {
  const session = await mongoose.startSession();
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      let result;
      await session.withTransaction(async () => {
        result = await operations(session);
      });
      session.endSession();
      return result;
    } catch (err) {
      if (err.ok === 0 || attempt === retries - 1) {
        session.endSession();
        throw err;
      }
    }
  }
};

const withRetry = async (fn, maxRetries = 3, delay = 100) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
};

module.exports = { withTransaction, withRetry };