const { ALLOWED_EXTENSIONS, Mode, DEFAULT_MODE } = require('./lib/constants');
const {
  loadConfig,
  getAndLoadConfigIfNeeded,
  getConfig,
  getPortalId,
  getPortalConfig,
  updatePortalConfig,
} = require('./lib/config');
const { uploadFolder } = require('./lib/uploadFolder');
const { watch } = require('./lib/watch');
const { walk } = require('./lib/walk');

module.exports = {
  ALLOWED_EXTENSIONS,
  DEFAULT_MODE,
  Mode,
  getAndLoadConfigIfNeeded,
  getConfig,
  loadConfig,
  getPortalConfig,
  getPortalId,
  updatePortalConfig,
  uploadFolder,
  watch,
  walk,
};
