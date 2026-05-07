const logger = require('./logger');

const DEFAULT_FLAGS = {
  FEATURE_NEW_BOOKING_FLOW: process.env.FEATURE_NEW_BOOKING_FLOW === 'true',
  FEATURE_REALTIME_UPDATES: process.env.FEATURE_REALTIME_UPDATES === 'true',
  FEATURE_PAYMENT_GATEWAY: process.env.FEATURE_PAYMENT_GATEWAY === 'true',
  FEATURE_ADMIN_V2: process.env.FEATURE_ADMIN_V2 === 'true',
  FEATURE_ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  FEATURE_PUSH_NOTIFICATIONS: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
  FEATURE_SOCIAL_LOGIN: process.env.FEATURE_SOCIAL_LOGIN === 'true',
};

class FeatureFlags {
  constructor() {
    this.flags = new Map(Object.entries(DEFAULT_FLAGS));
    this.overrides = new Map();
  }

  get(flagName) {
    if (this.overrides.has(flagName)) {
      return this.overrides.get(flagName);
    }
    return this.flags.get(flagName) ?? false;
  }

  set(flagName, value) {
    this.overrides.set(flagName, value);
    logger.info(`[FEATURE] ${flagName} = ${value}`);
  }

  enable(flagName) {
    this.set(flagName, true);
  }

  disable(flagName) {
    this.set(flagName, false);
  }

  isEnabled(flagName) {
    return this.get(flagName);
  }

  getAll() {
    const result = {};
    for (const [key, value] of this.flags) {
      result[key] = value;
    }
    return result;
  }

  getAllWithOverrides() {
    const result = this.getAll();
    for (const [key, value] of this.overrides) {
      result[key] = value;
    }
    return result;
  }

  reset(flagName) {
    if (flagName) {
      this.overrides.delete(flagName);
    } else {
      this.overrides.clear();
    }
  }
}

const featureFlags = new FeatureFlags();

const requireFeature = (flagName) => {
  return (req, res, next) => {
    if (featureFlags.isEnabled(flagName)) {
      next();
    } else {
      res.status(501).json({
        success: false,
        error: `Feature ${flagName} is not enabled`
      });
    }
  };
};

module.exports = {
  FeatureFlags,
  featureFlags,
  requireFeature,
  DEFAULT_FLAGS
};