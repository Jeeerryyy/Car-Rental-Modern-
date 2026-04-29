const logger = require('./logger');

const versions = ['v1'];
const defaultVersion = 'v1';

const versionMiddleware = (req, res, next) => {
  const acceptHeader = req.headers.accept;
  const versionHeader = req.headers['api-version'];
  const queryVersion = req.query.api_version;

  let requestedVersion = defaultVersion;

  if (versionHeader && versions.includes(versionHeader)) {
    requestedVersion = versionHeader;
  } else if (queryVersion && versions.includes(queryVersion)) {
    requestedVersion = queryVersion;
  } else if (acceptHeader && acceptHeader.includes('application/vnd.')) {
    const match = acceptHeader.match(/application\/vnd\.modern-selfdrive\.(\w+)/);
    if (match && versions.includes(match[1])) {
      requestedVersion = match[1];
    }
  }

  req.apiVersion = requestedVersion;
  res.setHeader('API-Version', requestedVersion);
  res.setHeader('X-API-Version', requestedVersion);

  next();
};

const deprecationMiddleware = (req, res, next) => {
  const sunsetDate = process.env.API_SUNSET_DATE;
  
  if (sunsetDate && new Date(sunsetDate) <= new Date()) {
    res.setHeader('Sunset', sunsetDate);
    res.setHeader('Deprecation', `API version ${req.apiVersion} will be sunset on ${sunsetDate}`);
    logger.warn(`[API] Deprecated API version called: ${req.apiVersion}`);
  }
  
  next();
};

const addVersionHeader = (req, res, next) => {
  res.setHeader('X-API-Version', req.apiVersion);
  next();
};

const isLatestVersion = (version) => version === versions[versions.length - 1];

const getSupportedVersions = () => [...versions];

module.exports = {
  versionMiddleware,
  deprecationMiddleware,
  addVersionHeader,
  isLatestVersion,
  getSupportedVersions
};